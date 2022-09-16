import { Component } from '@angular/core';
import { Web3AuthStore } from '@event-manager-web-client/data-access';

@Component({
  selector: 'em-social-login',
  template: `
        <button
          (click)="onLogin()"
          class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
        >
          Connect with Social
        </button>

        <button
          (click)="onLogout()"
          class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
        >
          Logout
        </button>
        
  `
})
export class SocialLoginComponent {
  constructor( private readonly _web3AuthStore: Web3AuthStore ) {}

  async onLogin() {
    await this._web3AuthStore.connect();
  }

  async onLogout() {
    await this._web3AuthStore.disconnect();
  }

}
