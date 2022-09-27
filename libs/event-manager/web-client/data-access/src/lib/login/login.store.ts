import { inject, Injectable } from '@angular/core';
import {
  Auth,
  signInWithCustomToken,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';

interface LoginState {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  userCredential: UserCredential | null;
}

const initialState = {
  connected: false,
  connecting: false,
  disconnecting: false,
  userCredential: null,
};

@Injectable()
export class LoginStore extends ComponentStore<LoginState> {
  private readonly _auth = inject(Auth);
  private readonly _fns = inject(Functions);

  private readonly _connected$ = this.select(
    this.state$,
    ({ connected }) => connected
  );

  private readonly _connecting$ = this.select(
    this.state$,
    ({ connecting }) => connecting
  );

  private readonly _disconnecting$ = this.select(
    this.state$,
    ({ disconnecting }) => disconnecting
  );

  private readonly _userCredential$ = this.select(
    this.state$,
    ({ userCredential }) => userCredential
  );

  constructor() {
    super(initialState);
  }

  async signOut() {
    this.patchState({ disconnecting: true });
    await signOut(this._auth);
    this.patchState({ disconnecting: false, connected: false });
  }

  getNonce(publicKey: string): Observable<any> {
    // call getNonceFunction
    this.patchState({ connecting: true });
    const callable = httpsCallableData(this._fns, 'getNonceToSign');
    return callable({ publicKey: publicKey });
  }

  async signIn(signature: Buffer, publicKey: string) {
    // call verifySignedMessage
    const callable = httpsCallableData(this._fns, 'verifySignedMessage');
    callable({ signature: signature, publicKey: publicKey }).subscribe(
      async (token) => {
        if (token != undefined) {
          await signInWithCustomToken(this._auth, token as string).then(
            (userCredentials) => {
              this.patchState({
                connecting: false,
                connected: true,
                userCredential: userCredentials,
              });
            }
          );
        }
      }
    );
  }
}
