import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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

        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onNumpadClick(1)"
            >
              1
            </button>
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onNumpadClick(2)"
            >
              2
            </button>
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onNumpadClick(3)"
            >
              3
            </button>
          </div>
          <div class="flex gap-2">
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onNumpadClick(4)"
            >
              4
            </button>
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onNumpadClick(5)"
            >
              5
            </button>
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onNumpadClick(6)"
            >
              6
            </button>
          </div>
          <div class="flex gap-2">
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onNumpadClick(7)"
            >
              7
            </button>
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onNumpadClick(8)"
            >
              8
            </button>
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onNumpadClick(9)"
            >
              9
            </button>
          </div>
          <div class="flex gap-2">
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onNumpadClick(0)"
            >
              0
            </button>
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onClearEntry()"
            >
              CE
            </button>
            <button
              class="w-24 h-10 flex justify-center items-center disco-btn green ease-in duration-300 text-lg uppercase border-4 cursor-pointer font-bold"
              (click)="onClear()"
            >
              C
            </button>
          </div>
        </div>

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
        <div class="flex justify-between items-center">
          <button
          *hdWalletAdapter="let wallet = wallet"
          (click)="onPay()"
          class="block mx-auto disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
          type="submit">
            <div class="flex justify-between items-center gap-2">
              Pay with
              <hd-wallet-icon *ngIf="wallet" [wallet]="wallet"></hd-wallet-icon>
            </div>
          </button>

          <button
          (click)="onScanQR()"
          class="block mx-auto disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold">
          emGenerateBuyTicketQrTrigger
                [amount]=ticketQuantity
                [eventId]="event.publicKey.toBase58()"
            <div class="flex justify-between items-center gap-2">
              Scan QR code
            </div>
          </button>
        </div>

        
      </form>
    </div>
  `,
  providers: [ConfigStore],
})
export class BuyTicketsComponent {
  readonly eventName: string;
  readonly ticketPrice: number;
  readonly acceptedMintLogo$ = this._configStore.acceptedMintLogo$;

  form = this._formBuilder.group({
    ticketQuantity: this._formBuilder.control(1, {
      validators: [Validators.required],
    }),
  });

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _configStore: ConfigStore,
    private readonly _bottomSheetRef: MatBottomSheetRef<BuyTicketsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    data: { eventName: string; ticketPrice: number }
  ) {
    this.eventName = data.eventName;
    this.ticketPrice = data.ticketPrice;
  }

  onPay() {
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
