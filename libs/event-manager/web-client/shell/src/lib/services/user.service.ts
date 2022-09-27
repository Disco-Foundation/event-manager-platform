import { inject, Injectable } from '@angular/core';
import { Auth, signInWithCustomToken, signOut } from '@angular/fire/auth';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _auth = inject(Auth);
  private readonly _fns = inject(Functions);

  signOut() {
    return signOut(this._auth);
  }

  getNonce(publicKey: string): Observable<any> {
    // call getNonceFunction
    const callable = httpsCallableData(this._fns, 'getNonceToSign');
    return callable({ publicKey: publicKey });
  }

  async signIn(signature: Buffer, publicKey: string) {
    // call verifySignedMessage
    const callable = httpsCallableData(this._fns, 'verifySignedMessage');
    callable({ signature: signature, publicKey: publicKey }).subscribe(
      async (token) => {
        if (token != undefined) {
          await signInWithCustomToken(this._auth, token as string);
        }
      }
    );
  }
}
