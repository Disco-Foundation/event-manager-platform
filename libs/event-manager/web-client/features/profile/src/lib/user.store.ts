import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';

interface User {
  name: string;
  lastName: string;
  image: string | null;
  email: string | null;
}

const initialState: User = {
  name: 'Disco',
  lastName: 'User',
  image: null,
  email: null,
};

@Injectable()
export class UserStore extends ComponentStore<User> {
  /* constructor(
        private readonly _userApiService: UserApiService,
        private readonly _notificationStore: NotificationStore
      ) {
        super(initialState);
    
        this._loadUserId(this.authority$);
        this._loadUser(this.userId$);
      }
    */
}
