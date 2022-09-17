import { Component } from '@angular/core';
import { Web3AuthStore } from '@event-manager-web-client/data-access';

@Component({
  selector: 'em-social-login',
  template: `
    <button
      *ngIf="connected != true"
      (click)="onLogin()"
      class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
    >
      Connect with Social
    </button>
  `,
})
export class SocialLoginComponent {
  connected: boolean = false;

  constructor(private readonly _web3AuthStore: Web3AuthStore) {
    this._web3AuthStore.connected$.subscribe(
      (value: boolean) => (this.connected = value)
    );
  }

  async onLogin() {
    await this._web3AuthStore.connect();
  }
}
