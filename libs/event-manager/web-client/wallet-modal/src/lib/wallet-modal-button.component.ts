import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ElementRef
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import {
    HdWalletAdapterDirective,
    HdWalletIconComponent
} from '@heavy-duty/wallet-adapter-cdk';
import { WalletModalButtonDirective } from './wallet-modal-button.directive';
import { WalletModalComponent } from './wallet-modal.component';

@Component({
	selector: 'wallet-modal-button',
	template: `
		<button
			*hdWalletAdapter="let wallets = wallets; let selectWallet = selectWallet"
			mat-raised-button
			WalletModalButton
			[wallets]="wallets"
			(selectWallet)="selectWallet($event)"
		>
			<ng-content></ng-content>
			<ng-container *ngIf="!children">Select Wallet</ng-container>
		</button>
	`,
	styles: [
		`
			button {
				display: inline-block;
			}
			.button-content {
				display: flex;
				gap: 0.5rem;
				align-items: center;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		HdWalletAdapterDirective,
		HdWalletIconComponent,
		WalletModalButtonDirective,
		WalletModalComponent,
		MatButtonModule,
		MatDialogModule,
	],
})
export class WalletModalButtonComponent {
	@ContentChild('children') children: ElementRef | null = null;
}