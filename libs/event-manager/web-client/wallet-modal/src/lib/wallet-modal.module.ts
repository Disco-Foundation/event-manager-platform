import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { WalletModalButtonComponent } from './wallet-modal-button.component';
import { WalletModalButtonDirective } from './wallet-modal-button.directive';

@NgModule({
  imports: [
    CommonModule, 
    WalletModalButtonDirective,
    WalletModalButtonComponent
  ],
  exports: [
    WalletModalButtonDirective, 
    WalletModalButtonComponent
  ]
})
export class WalletModalModule {}

