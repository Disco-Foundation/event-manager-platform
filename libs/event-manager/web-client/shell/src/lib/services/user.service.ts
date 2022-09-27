import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth, signInWithCustomToken, signOut } from '@angular/fire/auth';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _auth = inject(Auth);
  private readonly _http = inject(HttpClient);

  signOut() {
    return signOut(this._auth);
  }

  getNonce(pk: string) {
    // call getNonceFunction
    const nonceTest = '12345678';
    return nonceTest;
  }

  async signIn(signature: string, pk: string) {
    // call verify signatura
    const tokenTest = 'sgdsdfghdsqw432';
    await signInWithCustomToken(this._auth, tokenTest);
  }
}
