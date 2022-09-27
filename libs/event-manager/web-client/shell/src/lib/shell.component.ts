import { Component, Inject, OnInit } from '@angular/core';
import {
  ConfigStore,
  EnvironmentConfig,
  ENVIRONMENT_CONFIG,
} from '@event-manager-web-client/data-access';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import {
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolongWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { PublicKey } from '@solana/web3.js';
import { UserService } from './services/user.service';

@Component({
  selector: 'em-shell',
  template: `
    <header class="flex justify-between items-center px-8 py-5">
      <div class="flex items-center">
        <img src="assets/images/logo.png" class="w-12" alt="DAO NAME LOGO" />
        <a [routerLink]="['/']">
          <h1 class="mt-7 ml-2">
            <span class="disco-font">DISCO</span>
            Protocol
          </h1>
        </a>
      </div>
      <div class="flex justify-between items-center gap-8">
        <a
          class="underline disco-text purple disco-text-glow"
          [routerLink]="['/profile']"
          >My Profile</a
        >

        <div
          *hdWalletAdapter="
            let wallet = wallet;
            let wallets = wallets;
            let selectWallet = selectWallet;
            let connecting = connecting;
            let connected = connected
          "
          class="block mx-auto"
        >
          <ng-container *ngIf="wallet !== null">
            <button
              *ngIf="!connected"
              class="flex justify-center disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
              hdWalletConnectButton
              [disabled]="connecting"
            >
              Connect
              <hd-wallet-icon [wallet]="wallet"></hd-wallet-icon>
            </button>
            <button
              *ngIf="connected"
              class="flex justify-center gap-2 disco-btn red ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
              hdWalletDisconnectButton
              [disabled]="connecting"
            >
              Disconnect
              <hd-wallet-icon [wallet]="wallet"></hd-wallet-icon>
            </button>
          </ng-container>

          <button
            *ngIf="wallet === null"
            class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
            hdWalletModalButton
            [wallets]="wallets"
            (selectWallet)="selectWallet($event)"
          >
            Select wallet
          </button>
        </div>
      </div>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  providers: [ConfigStore],
})
export class ShellComponent implements OnInit {
  publicKey: PublicKey | undefined;

  constructor(
    private readonly _hdConnectionStore: ConnectionStore,
    private readonly _hdWalletStore: WalletStore,
    private readonly _userService: UserService,
    @Inject(ENVIRONMENT_CONFIG) private environment: EnvironmentConfig
  ) {
    _hdWalletStore.publicKey$.subscribe((value) => {
      if (value != undefined) {
        const nonce = this._userService.getNonce(value.toBase58());
        const encodedNonce = new TextEncoder().encode(nonce);
        this._hdWalletStore
          .signMessage(encodedNonce)
          ?.subscribe((signature) => {
            if (signature != undefined) {
              this._userService.signIn(signature.toString(), value.toBase58());
            }
          });
      }
    });
  }

  ngOnInit() {
    this._hdConnectionStore.setEndpoint(this.environment.network);
    this._hdWalletStore.setAdapters([
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolongWalletAdapter(),
    ]);
  }
}
