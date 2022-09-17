import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { WalletError } from "@solana/wallet-adapter-base";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { SolanaWallet } from "@web3auth/solana-provider";
import { SolanaWalletConnectorPlugin } from "@web3auth/solana-wallet-connector-plugin";
import { Web3Auth } from "@web3auth/web3auth";
import { firstValueFrom, Observable, tap } from "rxjs";
import { fromAdapterEvent } from "./internals/from-adapter-events";
import { handleEvent } from "./internals/handle-events";
import { signAllTransactions, signMessage, signTransaction } from "./internals/sign";

export interface SocialAuth {
    adapter: Web3Auth | null;
    provider: SafeEventEmitterProvider | null
    wallet: SolanaWallet | null;
    publicKey: PublicKey | null;
    connecting: boolean;
    connected: boolean;
    disconnecting: boolean;
    error: Error | null;
  }

const clientId = "BDymsWXpQgrMblpPdoBkQ7UL37Wg4QMofK_0Mzg0zJmI3lTRaT6erPfl8i4sJssonHv9OqQeDd7fVksn_dmsvuU"; // get from https://dashboard.web3auth.io
  
const initialState : SocialAuth = {
    adapter: null,
    provider: null,
    wallet: null,
    publicKey: null,
    connecting: false,
    connected: false,
    disconnecting: false,
    error: null
}

@Injectable({providedIn: 'root'})
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
			const adapterSignTransaction =
				wallet && 'signTransaction' in wallet
					? signTransaction(wallet, connected, (error) =>
							this._setError(error)
					  )
					: undefined;
			const adapterSignAllTransactions =
				wallet && 'signAllTransactions' in wallet
					? signAllTransactions(wallet, connected, (error) =>
							this._setError(error)
					  )
					: undefined;

			return publicKey && adapterSignTransaction && adapterSignAllTransactions
				? {
						publicKey,
						signTransaction: (transaction: Transaction) =>
							firstValueFrom(adapterSignTransaction(transaction)),
						signAllTransactions: (transactions: Transaction[]) =>
							firstValueFrom(adapterSignAllTransactions(transactions)),
				  }
				: undefined;
		},
		{ debounce: true }
	);
    
  constructor() {
      super(initialState);
  }

    readonly _setProvider = this.updater<SafeEventEmitterProvider | null>((state, provider) => ({
        ...state,
        provider,
    }));

    readonly _setAdapter = this.updater<Web3Auth | null>((state, adapter) => ({
      ...state,
      adapter,
    }));

    // Set error
	private readonly _setError = this.updater((state, error: WalletError) => ({
		...state,
		error: state.connecting? state.error : error,
	}));

  readonly onConnect = this.effect(() => {
		return this.adapter$.pipe(
			handleEvent((adapter) =>
				fromAdapterEvent(adapter, ADAPTER_EVENTS.CONNECTED).pipe(
					tap(() =>
						this.connect()
					)
				)
			)
		);
	});


async getPk(provider: SafeEventEmitterProvider): Promise<string>{
  const wallet = new SolanaWallet(provider);
  const accounts = await wallet.requestAccounts();
  this.patchState({ publicKey: new PublicKey(accounts[0]) });
  return accounts[0];
}

// Sign a transaction if the wallet supports it
signTransaction(
  transaction: Transaction
): Observable<Transaction> | undefined {
  const { wallet, connected } = this.get();

  return wallet && 'signTransaction' in wallet
    ? signTransaction(wallet, connected, (error) => this._setError(error))(
        transaction
      )
    : undefined;
}

// Sign multiple transactions if the wallet supports it
signAllTransactions(
  transactions: Transaction[]
): Observable<Transaction[]> | undefined {
  const { wallet, connected } = this.get();

  return wallet && 'signAllTransactions' in wallet
    ? signAllTransactions(wallet, connected, (error) =>
        this._setError(error)
      )(transactions)
    : undefined;
}

// Sign an arbitrary message if the wallet supports it
signMessage(message: Uint8Array): Observable<Uint8Array> | undefined {
  const { wallet, connected } = this.get();

  return wallet && 'signMessage' in wallet
    ? signMessage(wallet, connected, (error) => this._setError(error))(
        message
      )
    : undefined;
  }

  async initialize() {
    const adapter = new Web3Auth({
      clientId,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.SOLANA,
        chainId: "0x3",
        rpcTarget: "http://127.0.0.1:8899",
      },
      enableLogging: true
    });

    const plugin = new SolanaWalletConnectorPlugin({torusWalletOpts: {},
      walletInitOptions: {}})
    
    // add torus pluggin
    await adapter.addPlugin(plugin);

    // init login modal
    await adapter.initModal().then(
      ()=> {
        // set Web3Auth adapter instance
        this.patchState({ adapter: adapter });
        console.log("INITIALIZED", adapter);
      },
      ()=> { console.log("ERR0R init modal") }
    );
  }

  //connect to social

  async connect() {
    let state = this.get();

    if (!state.adapter) {
      const error = new WalletError();
      this._setError(error);
      console.log("ERROR",error);
    }
    
    this.patchState({ connecting: true });
    const provider = await state.adapter!.connect();
    if(provider){
      const wallet = new SolanaWallet(provider);
      const accounts = await wallet.requestAccounts();

      this.patchState({ 
        connected: true,
        provider: provider,
        connecting: false,
        wallet: wallet,
        publicKey: new PublicKey(accounts[0])
      })
    }
  }

    async disconnect() {
      let state = this.get();
  
      if (!state.adapter) {
        const error = new WalletError();
        this._setError(error);
        console.log("ERROR",error);
      }
      this.patchState({ disconnecting: true });
      await state.adapter!.logout();
      
      this.patchState({ 
        connected: false,
        provider: null,
        disconnecting: false
      })
  
  }
}

