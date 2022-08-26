import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { HdWalletListItemComponent } from '@heavy-duty/wallet-adapter-cdk';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/web3auth";
import RPC from "./solanaRPC";

const clientId = "BDymsWXpQgrMblpPdoBkQ7UL37Wg4QMofK_0Mzg0zJmI3lTRaT6erPfl8i4sJssonHv9OqQeDd7fVksn_dmsvuU"; // get from https://dashboard.web3auth.io


@Component({
	selector: 'hd-wallet-modal',
	template: `
		<ng-container *ngIf="installedWallets.length > 0">
			<header>
				<button
					mat-icon-button
					aria-label="Close wallet adapter selection"
					(click)="onClose()"
				>
					<mat-icon>close</mat-icon>
				</button>
				<h2>Connect a wallet on Solana to continue</h2>
			</header>

            <div style= "margin-bottom:20px; display: flex; flex-wrap: nowrap; justify-content: center;">
                <button
                class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                (click)="login()">
                    Connect with social
                </button>
            </div>

			<mat-selection-list
				[multiple]="false"
				(selectionChange)="onSelectionChange($event.options[0].value)"
			>
				<mat-list-option
					*ngFor="let wallet of installedWallets"
					[value]="wallet.adapter.name"
				>
					<hd-wallet-list-item [wallet]="wallet"></hd-wallet-list-item>
				</mat-list-option>
				<mat-expansion-panel
					#expansionPanel="matExpansionPanel"
					class="mat-elevation-z0"
					disabled
				>
					<ng-template matExpansionPanelContent>
						<mat-list-option
							*ngFor="let wallet of otherWallets"
							[value]="wallet.adapter.name"
						>
							<hd-wallet-list-item [wallet]="wallet"> </hd-wallet-list-item>
						</mat-list-option>
					</ng-template>
				</mat-expansion-panel>
			</mat-selection-list>
			<button
				*ngIf="otherWallets.length > 0"
				class="toggle-expand"
				(click)="expansionPanel.toggle()"
				mat-button
			>
				<span>
					{{ expansionPanel.expanded ? 'Less options' : 'More options' }}
				</span>
				<mat-icon [ngClass]="{ expanded: expansionPanel.expanded }">
					expand_more
				</mat-icon>
			</button>
		</ng-container>
		<ng-container *ngIf="installedWallets.length === 0">
			<header>
				<button
					mat-icon-button
					mat-dialog-close
					aria-label="Close wallet adapter selection"
				>
					<mat-icon>close</mat-icon>
				</button>
				<h2>You'll need a wallet on Solana to continue</h2>
			</header>
			<button
				(click)="onGettingStarted()"
				color="primary"
				mat-flat-button
				class="getting-started"
			>
				Get started
			</button>
			<mat-expansion-panel
				#expansionPanel="matExpansionPanel"
				class="mat-elevation-z0"
				disabled
			>
				<ng-template matExpansionPanelContent>
					<mat-selection-list
						[multiple]="false"
						(selectionChange)="onSelectionChange($event.options[0].value)"
					>
						<mat-list-option
							*ngFor="let wallet of otherWallets"
							[value]="wallet.adapter.name"
						>
							<hd-wallet-list-item [wallet]="wallet"> </hd-wallet-list-item>
						</mat-list-option>
					</mat-selection-list>
				</ng-template>
			</mat-expansion-panel>
			<button
				*ngIf="otherWallets.length > 0"
				class="toggle-expand"
				(click)="expansionPanel.toggle()"
				mat-button
			>
				<span>
					{{
						expansionPanel.expanded
							? 'Hide options'
							: 'Already have a wallet? View options'
					}}
				</span>
				<mat-icon [ngClass]="{ expanded: expansionPanel.expanded }">
					expand_more
				</mat-icon>
			</button>
		</ng-container>
	`,
	styles: [
		`
			:host {
				display: block;
			}
			.mat-dialog-title {
				margin: 0;
			}
			header {
				margin-bottom: 2.5rem;
			}
			header h2 {
				font-size: 1.5rem;
				text-align: center;
				padding: 0 3rem;
				font-weight: bold;
			}
			header button {
				display: block;
				margin-left: auto;
				margin-right: 1rem;
				margin-top: 1rem;
			}
			.getting-started {
				display: block;
				margin: 2rem auto;
			}
			.toggle-expand {
				display: flex;
				justify-content: space-between;
				margin: 1rem 1rem 1rem auto;
				align-items: center;
			}
			.toggle-expand span {
				margin: 0;
			}
			.toggle-expand mat-icon {
				transition: 500ms cubic-bezier(0.4, 0, 0.2, 1);
			}
			.toggle-expand mat-icon.expanded {
				transform: rotate(180deg);
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		HdWalletListItemComponent,
		MatButtonModule,
		MatIconModule,
		MatListModule,
		MatExpansionModule,
	],
})
export class LoginModalComponent implements OnInit {
    web3auth: Web3Auth | null = null;
    provider: SafeEventEmitterProvider | null = null;
    isModalLoaded = false;


    async ngOnInit(): Promise<void> {
        //throw new Error('Method not implemented.');
        this.web3auth = new Web3Auth({
            clientId,
            chainConfig: {
                chainNamespace: CHAIN_NAMESPACES.SOLANA,
                chainId: "0x3", // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
                rpcTarget: "https://api.devnet.solana.com", // This is the public RPC we have added, please pass on your own endpoint while creating an app
            },
        });
    
        console.log("MODAL LOADING");
        await this.web3auth.initModal();
            console.log("MODAL LOADED")
            if (this.web3auth.provider) {
                this.provider = this.web3auth.provider;
                console.log("provider", this.provider);
            }
            this.isModalLoaded = true;
    }

    
	private readonly _dialogRef =
		inject<MatDialogRef<LoginModalComponent, WalletName>>(MatDialogRef);
	private readonly _data = inject<{ wallets: Wallet[] }>(MAT_DIALOG_DATA);

	expanded = false;
	readonly installedWallets = this._data.wallets.filter(
		(wallet) => wallet.readyState === WalletReadyState.Installed
	);
	readonly otherWallets = [
		...this._data.wallets.filter(
			(wallet) => wallet.readyState === WalletReadyState.Loadable
		),
		...this._data.wallets.filter(
			(wallet) => wallet.readyState === WalletReadyState.NotDetected
		),
	];
	readonly getStartedWallet = this.installedWallets.length
		? this.installedWallets[0]
		: this._data.wallets.find(
				(wallet: { adapter: { name: WalletName } }) =>
					wallet.adapter.name === 'Phantom'
		  ) ||
		  this._data.wallets.find(
				(wallet: { adapter: { name: WalletName } }) =>
					wallet.adapter.name === 'Torus'
		  ) ||
		  this._data.wallets.find(
				(wallet: { readyState: WalletReadyState }) =>
					wallet.readyState === WalletReadyState.Loadable
		  ) ||
		  this.otherWallets[0];

	onSelectionChange(walletName: WalletName): void {
		this._dialogRef.close(walletName);
	}

	onGettingStarted(): void {
		this._dialogRef.close(this.getStartedWallet.adapter.name);
	}

	onClose(): void {
		this._dialogRef.close();
	}

	onToggleExpand(): void {
		this.expanded = !this.expanded;
	}

   

    async login() {
        if (!this.web3auth) {
            console.log("web3auth not initialized yet");
            return;
        }
        this._dialogRef.close();
        console.log("LLEGO AQUI");
        this.provider = await this.web3auth.connect();
        console.log("logged in");
    };
    
        getUserInfo = async () => {
            if (!this.web3auth) {
            console.log("web3auth not initialized yet");
            return;
            }
            const user = await this.web3auth.getUserInfo();
            console.log(user);
        };
    
        getAccounts = async () => {
            if (!this.provider) {
            console.log("provider not initialized yet");
            return;
            }
            const rpc = new RPC(this.provider);
            const address = await rpc.getAccounts();
            console.log(address);
        };
    
        getBalance = async () => {
            if (!this.provider) {
            console.log("provider not initialized yet");
            return;
            }
            const rpc = new RPC(this.provider);
            const balance = await rpc.getBalance();
            console.log(balance);
        };
    
        sendTransaction = async () => {
            if (!this.provider) {
            console.log("provider not initialized yet");
            return;
            }
            const rpc = new RPC(this.provider);
            const receipt = await rpc.sendTransaction();
            console.log(receipt);
        };
    
        signMessage = async () => {
            if (!this.provider) {
            console.log("provider not initialized yet");
            return;
            }
            const rpc = new RPC(this.provider);
            const signedMessage = await rpc.signMessage();
            console.log(signedMessage);
        };
    
        getPrivateKey = async () => {
            if (!this.provider) {
            console.log("provider not initialized yet");
            return;
            }
            const rpc = new RPC(this.provider);
            const privateKey = await rpc.getPrivateKey();
            console.log(privateKey);
        };
    
        logout = async () => {
            if (!this.web3auth) {
            console.log("web3auth not initialized yet");
            return;
            }
            await this.web3auth.logout();
            this.provider = null;
            console.log("logged out");
        };
}