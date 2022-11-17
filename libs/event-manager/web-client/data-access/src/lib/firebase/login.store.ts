import { inject, Injectable } from '@angular/core';
import { Auth, signInWithCustomToken, signOut } from '@angular/fire/auth';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, throwError } from 'rxjs';

interface LoginState {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
}

const initialState = {
  connected: false,
  connecting: false,
  disconnecting: false,
};

@Injectable()
export class LoginStore extends ComponentStore<LoginState> {
  private readonly _auth = inject(Auth);
  private readonly _fns = inject(Functions);

  readonly connected$ = this.select(({ connected }) => connected);
  readonly activeConnection$ = this.select(({ connected, connecting }) => {
    return connecting === false && connected === true;
  });

  constructor() {
    super(initialState);
  }

  async signOut() {
    this.patchState({ disconnecting: true });
    await signOut(this._auth)
      .then(() => this.patchState({ disconnecting: false, connected: false }))
      .catch((error) => {
        return throwError(() => new Error(error));
      });
  }

  async getNonce(publicKey: string): Promise<Observable<any>> {
    // call getNonceFunction
    this.patchState({ connecting: true });
    try {
      const callable = httpsCallableData(this._fns, 'getNonceToSign');
      return callable({ publicKey: publicKey });
    } catch (error) {
      return throwError(() => new Error("Error verifiying user's identity"));
    }
  }

  async signIn(signature: Buffer, publicKey: string) {
    // call verifySignedMessage
    const callable = httpsCallableData(this._fns, 'verifySignedMessage');
    try {
      return callable({ signature: signature, publicKey: publicKey }).subscribe(
        async (token) => {
          if (token === undefined) {
            return throwError(() => new Error('error'));
          }

          return await signInWithCustomToken(this._auth, token as string)
            .then(() =>
              this.patchState({
                connecting: false,
                connected: true,
              })
            )
            .catch((error) => {
              this.patchState({
                connecting: false,
                connected: false,
              });
              return throwError(() => new Error(error));
            });
        }
      );
    } catch (error) {
      return throwError(
        () => new Error('Wallet sign in error, please try again')
      );
    }
  }
}
