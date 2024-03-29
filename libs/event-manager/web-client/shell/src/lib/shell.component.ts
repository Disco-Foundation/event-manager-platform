import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  ConfigStore,
  EnvironmentConfig,
  ENVIRONMENT_CONFIG,
  LoginStore,
} from '@event-manager-web-client/data-access';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import {
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolongWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { PublicKey } from '@solana/web3.js';
import { catchError, EMPTY } from 'rxjs';

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
          *ngIf="loggedIn | async; loggedIn"
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
export class ShellComponent implements OnInit, OnDestroy {
  readonly loggedIn = this._loginStore.connected$;
  walletSubscription = this._hdWalletStore.publicKey$.subscribe(
    async (publicKey) => this.handleWallet(publicKey)
  );

  constructor(
    private readonly _hdConnectionStore: ConnectionStore,
    private readonly _hdWalletStore: WalletStore,
    private readonly _loginStore: LoginStore,
    private readonly _matSnackBar: MatSnackBar,
    private readonly _router: Router,
    @Inject(ENVIRONMENT_CONFIG) private environment: EnvironmentConfig
  ) {}

  ngOnInit() {
    this._hdConnectionStore.setEndpoint(this.environment.network);
    this._hdWalletStore.setAdapters([
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolongWalletAdapter(),
    ]);
  }

  ngOnDestroy() {
    this.walletSubscription.unsubscribe();
  }

  singIn(publicKey: PublicKey, signature: Uint8Array) {
    this._loginStore
      .signIn(Buffer.from(signature), publicKey.toBase58())
      .catch((error) => {
        this._matSnackBar.open(error, 'close', {
          duration: 5000,
        });
        this._hdWalletStore.disconnect().subscribe();
      });
  }

  signOut() {
    this._loginStore.signOut().then(() => {
      this._router.navigate(['/list-events']);
    });
  }

  signMessage(publicKey: PublicKey, message: string) {
    this._hdWalletStore
      .signMessage(new TextEncoder().encode(message))
      ?.pipe(
        catchError(() => {
          this._hdWalletStore.disconnect().subscribe();
          return EMPTY;
        })
      )
      ?.subscribe((signature) => {
        if (signature === undefined) {
          this._matSnackBar.open('Signature error, try again', 'close', {
            duration: 5000,
          });
          return;
        }
        this.singIn(publicKey, signature);
      });
  }

  async handleWallet(publicKey: PublicKey | null) {
    if (publicKey === null) {
      return this.signOut();
    }
    (await this._loginStore.getNonce(publicKey.toBase58())).subscribe((msg) => {
      this.signMessage(publicKey, msg);
    });
  }
}
