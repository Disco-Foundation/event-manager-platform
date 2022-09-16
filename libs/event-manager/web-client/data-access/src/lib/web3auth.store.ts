import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { WalletError } from "@solana/wallet-adapter-base";
import { PublicKey, Transaction } from "@solana/web3.js";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { SolanaWallet } from "@web3auth/solana-provider";
import { SolanaWalletConnectorPlugin } from "@web3auth/solana-wallet-connector-plugin";
import { Web3Auth } from "@web3auth/web3auth";
import { firstValueFrom, Observable } from "rxjs";
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

  async initialize(): Promise<Web3Auth> {
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
      walletInitOptions: {
        enableLogging: true,
    }})
    
    // add torus pluggin
    await adapter.addPlugin(plugin);

    // init login modal
    await adapter.initModal().then(
      ()=> {
        // set Web3Auth adapter instance
        this._setAdapter(adapter);
        console.log("INITIALIZED", adapter);
      },
      ()=> {
        console.log("ERR0R init modal")
      }
    );

    this._setAdapter(adapter);
    return adapter;
    
  }

  async connect() {
    let state = this.get();

    if (!state.adapter) {
      const error = new WalletError();
      this._setError(error);
      console.log("ERROR",error);
    }
    this.patchState({ connecting: true });
    let provider = await state.adapter!.connect();
    
    this.patchState({ 
      connected: true,
      provider: provider,
      connecting: false
    })
  }

    async disconnect() {
      let state = this.get();
  
      if (!state.adapter) {
        const error = new WalletError();
        this._setError(error);
        console.log("ERROR",error);
      }
      this.patchState({ disconnecting: true });
      let provider = await state.adapter!.logout();
      
      this.patchState({ 
        connected: false,
        provider: null,
        disconnecting: false
      })
  
  }
}

