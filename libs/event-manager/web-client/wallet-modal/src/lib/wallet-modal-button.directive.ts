import {
    Directive,
    EventEmitter,
    HostListener,
    Input,
    Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { WalletName } from '@solana/wallet-adapter-base';
import { WalletModalComponent } from './wallet-modal.component';

@Directive({
	selector: 'button[WalletModalButton]',
	standalone: true,
})
export class WalletModalButtonDirective {
	@Input() wallets: Wallet[] = [];
	@Input() panelClass = '';
	@Output() selectWallet = new EventEmitter<WalletName>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<WalletModalComponent, { wallets: Wallet[] }, WalletName>(
				WalletModalComponent,
				{
					panelClass: ['wallet-modal', ...this.panelClass.split(' ')],
					maxWidth: '380px',
					maxHeight: '90vh',
					data: {
						wallets: this.wallets || [],
					},
				}
			)
			.afterClosed()
			.subscribe(
				(walletName) => walletName && this.selectWallet.emit(walletName)
			);
	}

	constructor(private readonly _matDialog: MatDialog) {}
}