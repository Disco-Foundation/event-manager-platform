import * as corsLib from 'cors';
import * as firebaseAdmin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as nacl from 'tweetnacl';

const admin = firebaseAdmin.initializeApp({});
const cors = corsLib({
  origin: true,
});

export const getNonceToSign = functions.https.onRequest((request, response) =>
  cors(request, response, async () => {
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(request.body.pk)
      .get();

    if (userDoc.exists) {
      // The user document exists already, so just return the nonce
      const existingNonce = userDoc.data()?.nonce;
      return response.status(200).json({ nonce: existingNonce });
    } else {
      // The user document does not exist, create it first
      const generatedNonce = Math.floor(Math.random() * 1000000).toString();

      // Create an Auth user
      const createdUser = await admin.auth().createUser({
        uid: request.body.pk,
      });

      // Associate the nonce with that user
      await admin.firestore().collection('users').doc(createdUser.uid).set({
        nonce: generatedNonce,
      });

      return response.status(200).json({ nonce: generatedNonce });
    }

    //return await admin.auth().createCustomToken(pk);
  })
);

export const verifySignedMessage = functions.https.onRequest(
  (request, response) =>
    cors(request, response, async () => {
      if (request.method !== 'POST') {
        return response.sendStatus(403);
      }

      if (!request.body.address || !request.body.signature) {
        return response.sendStatus(400);
      }

      const pk = request.body.pk;
      const sig = request.body.signature;

      // Get the nonce for this address
      const userDocRef = admin.firestore().collection('users').doc(pk);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        const existingNonce = userDoc.data()?.nonce;

        // Verify if the signature corresponded to nonce and Public key.
        const data = nacl.sign.detached.verify(existingNonce, sig, pk);

        // See if that matches the address the user is claiming the signature is from
        if (data) {
          // The signature was verified - update the nonce to prevent replay attacks
          // update nonce
          await userDocRef.update({
            nonce: Math.floor(Math.random() * 1000000).toString(),
          });

          // Create a custom token for the specified address
          const firebaseToken = await admin.auth().createCustomToken(pk);

          // Return the token
          return response.status(200).json({ token: firebaseToken });
        } else {
          // The signature could not be verified
          return response.sendStatus(401);
        }
      } else {
        console.log('user doc does not exist');
        return response.sendStatus(500);
      }
    })
);

/*@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _auth = inject(Auth);
  constructor() {}

  public signOutWallet() {
    return signOut(this._auth);
  }

  

  public async signInWallet(pk: string): Promise<UserCredential> {
    const value = await this.createToken(pk);
    return await signInWithCustomToken(this._auth, value);
  }
}
*/
