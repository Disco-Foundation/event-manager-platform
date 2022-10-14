import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
import { FirebaseService } from 'libs/event-manager/web-client/data-access/src/lib/firebase/firebase.service';
import { combineLatest, defer, EMPTY, from, map, switchMap } from 'rxjs';

interface UserState {
  id: PublicKey | null;
  user: User | null;
  loading: boolean;
  error: unknown | null;
}

export interface User {
  name: string;
  lastName: string;
  email: string | null;
  image: string | null;
  discoTokens: number;
}

const initialState: UserState = {
  user: null,
  loading: false,
  id: null,
  error: null,
};

@Injectable()
export class UserStore extends ComponentStore<UserState> {
  readonly user$ = this.select(({ user }) => user);
  readonly id$ = this.select(({ id }) => id);
  readonly error$ = this.select(({ error }) => error);

  constructor(private readonly _firebaseService: FirebaseService) {
    super(initialState);

    this._loadUser(
      combineLatest([
        // Trigger load events when connection changes
        this.select(this.id$, (id) => ({ id }), { debounce: true }),
      ]).pipe(map(([data]) => data))
    );
  }

  readonly setUserId = this.updater<PublicKey | null>((state, id) => ({
    ...state,
    id: id,
  }));

  private readonly _loadUser = this.effect<{
    id: PublicKey | null;
  }>(
    switchMap(({ id }) => {
      // If there's no connection ignore loading call
      if (id === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._firebaseService.getUser(id.toBase58()).pipe(
        tapResponse(
          (user) => {
            if (user != undefined)
              this.patchState({
                user: {
                  name: user.name,
                  lastName: user.lastName,
                  email: user.email,
                  image: user.image,
                  discoTokens: user.discoTokens,
                },
                loading: false,
              });
          },
          (error) => this.patchState({ error, loading: false })
        )
      );
    })
  );

  updateUserInfo(args: {
    name: string;
    lastName: string;
    email: string;
    image: string;
  }) {
    const userId = this.get().id!;
    return defer(() => {
      return from(this._firebaseService.updateUser(userId?.toBase58(), args));
    });
  }
}
