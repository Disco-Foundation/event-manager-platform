import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { GenerateEventQrComponent } from './generate-event-qr.component';
import { GenerateEventQrTriggerDirective } from './generate-event-qr.directive';

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
  declarations: [GenerateEventQrComponent, GenerateEventQrTriggerDirective],
  exports: [GenerateEventQrTriggerDirective],
})
export class GenerateEventQrModule {}
