import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { BuyTicketsComponent } from './buy-tickets.component';
import { BuyTicketsTriggerDirective } from './buy-tickets.directive';
import { GenerateBuyTicketQrComponent } from './generate-buy-ticket-qr.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    HdWalletAdapterCdkModule,
  ],
  declarations: [BuyTicketsComponent, BuyTicketsTriggerDirective, GenerateBuyTicketQrComponent],
  exports: [BuyTicketsTriggerDirective],
})
export class BuyTicketsModule {}
