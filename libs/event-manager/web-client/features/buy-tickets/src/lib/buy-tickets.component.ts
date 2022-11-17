import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { ConfigStore } from '@event-manager-web-client/data-access';

@Component({
  selector: 'em-buy-tickets',
  template: `
    <div
      class="py-8 disco-border border-4 border-b-0 blue backdrop-blur-sm bg-opacity-5"
    >
      <header class="flex flex-col items-center gap-2">
        <h2
          class="m-0 text-3xl text-center font-bold disco-text blue disco-font"
        >
          Buy tickets
        </h2>

        <p class="text-center text-xs m-0">
          Each ticket has a unit price of

          <span class="inline-flex items-baseline gap-1 ml-1">
            <figure>
              <img
                class="disco-accepted-mint-logo"
                src="{{ acceptedMintLogo$ | async }}"
                alt="usdc logo"
              />
            </figure>

            <span class="text-lg font-bold leading-none disco-text green"
              >{{ ticketPrice | number: '1.2-2' }}.</span
            >
          </span>
        </p>
      </header>

      <form [formGroup]="form" class="flex flex-col gap-3 items-center">
        <mat-form-field class="w-64" appearance="legacy" floatLabel="never">
          <input
            class="text-2xl"
            matInput
            formControlName="ticketQuantity"
            required
            autocomplete="off"
            type="number"
            aria-label="Ticket's Quantity"
          />
          <mat-error
            class="text-xs"
            *ngIf="form.get('ticketQuantity')?.hasError('required')"
            >Missing quantity.</mat-error
          >
        </mat-form-field>

        <div class="flex flex-col">
          <p class="text-center m-0">Total:</p>

          <div class="flex items-center gap-1">
            <figure>
              <img
                class="disco-accepted-mint-logo"
                src="{{ acceptedMintLogo$ | async }}"
                alt="usdc logo"
              />
            </figure>

            <span class="text-3xl font-bold disco-text green">
              <ng-container
                *ngIf="
                  form.get('ticketQuantity')?.value as ticketQuantity;
                  else noTickets
                "
              >
                {{ ticketPrice * ticketQuantity | number: '1.2-2' }}
              </ng-container>

              <ng-template #noTickets>0</ng-template>
            </span>
          </div>
        </div>
        <button
          *hdWalletAdapter="let wallet = wallet"
          (click)="onPay()"
          class="block mx-auto disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
          type="submit"
        >
          <div class="flex justify-between items-center gap-2">
            Pay with
            <hd-wallet-icon *ngIf="wallet" [wallet]="wallet"></hd-wallet-icon>
          </div>
        </button>
        <em-generate-buy-ticket-qr
          *ngIf="form.get('ticketQuantity')?.value as ticketQuantity"
          [qrdata]="{
            ticketsAmount: ticketQuantity,
            eventId: eventId
          }"
        >
        </em-generate-buy-ticket-qr>
      </form>
    </div>
  `,
  providers: [ConfigStore],
})
export class BuyTicketsComponent {
  readonly eventName: string;
  readonly ticketPrice: number;
  readonly eventId: string;
  readonly acceptedMintLogo$ = this._configStore.acceptedMintLogo$;

  form = this._formBuilder.group({
    ticketQuantity: this._formBuilder.control(1, {
      validators: [Validators.required],
    }),
  });

  constructor(
    private readonly _formBuilder: UntypedFormBuilder,
    private readonly _configStore: ConfigStore,
    private readonly _bottomSheetRef: MatBottomSheetRef<BuyTicketsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    data: { eventId: string; eventName: string; ticketPrice: number }
  ) {
    this.eventName = data.eventName;
    this.ticketPrice = data.ticketPrice;
    this.eventId = data.eventId;
  }

  onPay() {
    if (this.form.valid) {
      const { ticketQuantity } = this.form.value;
      this._bottomSheetRef.dismiss(ticketQuantity);
    }
  }

  onScanQR() {
    if (this.form.valid) {
      const { ticketQuantity } = this.form.value;
      this._bottomSheetRef.dismiss(ticketQuantity);
    }
  }

  onClearEntry() {
    const { ticketQuantity } = this.form.value;
    if (ticketQuantity !== null) {
      const chars = ticketQuantity.toString().split('').map(Number);

      if (chars.length === 1) {
        this.form.get('ticketQuantity')?.setValue(null);
      } else {
        chars.pop();
        this.form.get('ticketQuantity')?.setValue(parseInt(chars.join('')));
      }
    }
  }

  onClear() {
    this.form.get('ticketQuantity')?.setValue(null);
  }

  onNumpadClick(digit: number) {
    const { ticketQuantity } = this.form.value;
    if (ticketQuantity === null) {
      this.form.get('ticketQuantity')?.setValue(digit);
    } else {
      const chars = ticketQuantity.toString().split('').map(Number);
      chars.push(digit);
      this.form.get('ticketQuantity')?.setValue(parseInt(chars.join('')));
    }
  }
}
