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
import { LoginModalComponent } from './login-modal.component';


@Directive({
	selector: 'button[LoginModalButton]',
	standalone: true,
})
export class LoginModalButtonDirective {
	@Input() wallets: Wallet[] = [];
	@Input() panelClass = '';
	@Output() selectWallet = new EventEmitter<WalletName>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<LoginModalComponent, { wallets: Wallet[] }, WalletName>(
				LoginModalComponent,
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