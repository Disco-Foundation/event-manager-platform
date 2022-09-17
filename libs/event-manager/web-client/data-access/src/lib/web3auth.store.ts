import { Inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { WalletError } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
} from '@web3auth/base';
import { SolanaWallet } from '@web3auth/solana-provider';
import { SolanaWalletConnectorPlugin } from '@web3auth/solana-wallet-connector-plugin';
import { Web3Auth } from '@web3auth/web3auth';
import { tap } from 'rxjs';
import { fromAdapterEvent } from './internals/from-adapter-events';
import { handleEvent } from './internals/handle-events';
import { EnvironmentConfig, ENVIRONMENT_CONFIG } from './types/environment';

export interface SocialAuth {
  adapter: Web3Auth | null;
  provider: SafeEventEmitterProvider | null;
  wallet: SolanaWallet | null;
  publicKey: PublicKey | null;
  connecting: boolean;
  connected: boolean;
  disconnecting: boolean;
  error: Error | null;
}

// get from https://dashboard.web3auth.io
export const W3A_CLIENT_ID =
  'BDymsWXpQgrMblpPdoBkQ7UL37Wg4QMofK_0Mzg0zJmI3lTRaT6erPfl8i4sJssonHv9OqQeDd7fVksn_dmsvuU';

// Initial state
const initialState: SocialAuth = {
  adapter: null,
  provider: null,
  wallet: null,
  publicKey: null,
  connecting: false,
  connected: false,
  disconnecting: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class Web3AuthStore extends ComponentStore<SocialAuth> {
  readonly adapter$ = this.select(({ adapter }) => adapter);
  readonly provider$ = this.select(({ provider }) => provider);
  readonly publicKey$ = this.select(({ publicKey }) => publicKey);
  readonly wallet$ = this.select(({ wallet }) => wallet);
  readonly connecting$ = this.select(({ connecting }) => connecting);
  readonly connected$ = this.select(({ connected }) => connected);
  readonly disconnecting$ = this.select(({ disconnecting }) => disconnecting);
  readonly error$ = this.select(({ error }) => error);
  readonly anchorWallet$ = this.select(
    this.publicKey$,
    this.wallet$,
    this.connected$,
    (publicKey, wallet, connected) => {
      if (wallet === null || publicKey === null || !connected) {
        return null;
      }

      return {
        publicKey,
        signTransaction: (transaction: Transaction) =>
          wallet.signTransaction(transaction),
        signAllTransactions: (transactions: Transaction[]) =>
          wallet.signAllTransactions(transactions),
      };
    },
    { debounce: true }
  );

  constructor(
    @Inject(ENVIRONMENT_CONFIG) private environment: EnvironmentConfig
  ) {
    super(initialState);
  }

  readonly _setProvider = this.updater<SafeEventEmitterProvider | null>(
    (state, provider) => ({
      ...state,
      provider,
    })
  );

  readonly _setAdapter = this.updater<Web3Auth | null>((state, adapter) => ({
    ...state,
    adapter,
  }));

  // Set error
  private readonly _setError = this.updater((state, error: WalletError) => ({
    ...state,
    error: state.connecting ? state.error : error,
  }));

  // Handle on connect event
  readonly onConnect = this.effect(() => {
    return this.adapter$.pipe(
      handleEvent((adapter) =>
        fromAdapterEvent(adapter, ADAPTER_EVENTS.CONNECTED).pipe(
          tap(() => this.connect())
        )
      )
    );
  });

  // Initialize Web3Auth adapter
  async initialize() {
    const adapter = new Web3Auth({
      clientId: W3A_CLIENT_ID,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.SOLANA,
        chainId: '0x3',
        rpcTarget: this.environment.network,
      },
      enableLogging: true,
    });

    const plugin = new SolanaWalletConnectorPlugin({
      torusWalletOpts: {},
      walletInitOptions: {},
    });

    // add torus pluggin
    await adapter.addPlugin(plugin);

    // init login modal
    await adapter.initModal().then(
      () => {
        // set Web3Auth adapter instance
        this.patchState({ adapter: adapter });
      },
      () => {
        console.log('ERR0R init modal');
      }
    );
  }

  // connect with social
  async connect() {
    let state = this.get();

    if (!state.adapter) {
      const error = new WalletError();
      this._setError(error);
      console.log('ERROR', error);
    }

    this.patchState({ connecting: true });
    const provider = await state.adapter!.connect();
    if (provider) {
      const wallet = new SolanaWallet(provider);
      const accounts = await wallet.requestAccounts();

      this.patchState({
        connected: true,
        provider: provider,
        connecting: false,
        wallet: wallet,
        publicKey: new PublicKey(accounts[0]),
      });
    }
  }

  // logout from account
  async disconnect() {
    let state = this.get();

    if (!state.adapter) {
      const error = new WalletError();
      this._setError(error);
      console.log('ERROR', error);
    }
    this.patchState({ disconnecting: true });
    await state.adapter!.logout();

    this.patchState({
      connected: false,
      provider: null,
      disconnecting: false,
    });
  }
}
