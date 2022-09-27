import { PublicKey } from '@solana/web3.js';
import * as firebaseAdmin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as nacl from 'tweetnacl';

const admin = firebaseAdmin.initializeApp({});

export const getNonceToSign = functions.https.onCall(async (data) => {
  // Get user info from DB
  const userDoc = await admin
    .firestore()
    .collection('users')
    .doc(data.publicKey)
    .get();

  if (userDoc.exists) {
    // If the user already exists, return the nonce
    const existingNonce = userDoc.data()?.nonce;
    return existingNonce;
  } else {
    // If the user does not exist, create it first

    // Generate new nonce value
    const generatedNonce = Math.floor(Math.random() * 1000000).toString();

    // Create an user
    const createdUser = await admin.auth().createUser({
      uid: data.publicKey,
    });

    // Associate the new nonce with the user
    await admin.firestore().collection('users').doc(createdUser.uid).set({
      nonce: generatedNonce,
    });

    // Return new nonce value
    return generatedNonce;
  }
});

export const verifySignedMessage = functions.https.onCall(async (data) => {
  const publicKey = new PublicKey(data.publicKey); // User public key
  const signature = data.signature; // User signature

  // Get the data from this user
  const userDocRef = admin.firestore().collection('users').doc(data.publicKey);
  const userDoc = await userDocRef.get();

  // if user exists, verify signature
  if (userDoc.exists) {
    const existingNonce = userDoc.data()?.nonce; // Get the nonce for this user

    // Prepare data for verification
    const encodedSignature = new Uint8Array(Object.values(signature));
    const encodedNonce = new TextEncoder().encode(existingNonce);

    // Verify if the signature corresponded to nonce and public key.
    const data = nacl.sign.detached.verify(
      encodedNonce,
      encodedSignature,
      publicKey.toBytes()
    );

    // If the signature was verified, update the nonce
    if (data) {
      // Update user's nonce
      await userDocRef.update({
        nonce: Math.floor(Math.random() * 1000000).toString(),
      });

      // Create a custom auth token for the user
      const authToken = await admin
        .auth()
        .createCustomToken(publicKey.toBase58());

      // Return the auth token
      return authToken;
    } else {
      // The signature could not be verified
      return undefined;
    }
  } else {
    // The user does not exist
    return undefined;
  }
});
