import { Component } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  ConfigStore,
  EventApiService,
} from '@event-manager-web-client/data-access';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { catchError, concatMap, EMPTY, tap } from 'rxjs';

export function publicKeyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    try {
      new PublicKey(control.value);
      return null;
    } catch (error) {
      return { publicKey: { value: control.value } };
    }
  };
}

/* const downloadCertifier = (certifierSecret: Uint8Array) => {
  const a = document.createElement('a');

  a.href = URL.createObjectURL(
    new Blob([`[${certifierSecret.toString()}]`], { type: 'application/json' })
  );
  a.download = 'certifier.json';
  a.click();
  a.remove();
}; */

@Component({
  selector: 'em-create-event',
  template: `
    <div class="flex flex-col gap-8 mb-8 items-center">
      <header class="flex flex-col items-center gap-2">
        <h2
          class="m-0 text-5xl text-center font-bold disco-text blue disco-font"
        >
          Create event
        </h2>

        <p class="m-0 text-center">
          Fill this form and send the transaction to
          <b class="disco-text gold">create your event.</b>
        </p>
      </header>

      <section
        class="w-full disco-layer disco-border border-4 disco-glow blue"
        style="max-width: 40rem"
      >
        <mat-stepper
          linear
          #stepper
          orientation="vertical"
          class="bg-transparent"
        >
          <mat-step [stepControl]="informationForm">
            <div class="flex flex-col gap-3">
              <ng-template matStepLabel>Fill event information</ng-template>

              <form [formGroup]="informationForm" class="flex flex-col gap-2">
                <mat-form-field
                  class="w-full"
                  appearance="fill"
                  hintLabel="Enter the event name."
                >
                  <mat-label>Event Name</mat-label>
                  <input
                    matInput
                    formControlName="name"
                    required
                    autocomplete="off"
                    maxlength="40"
                  />
                  <mat-hint align="end"
                    >{{
                      informationForm.get('name')?.value?.length || 0
                    }}/40</mat-hint
                  >

                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('name')?.hasError('required')
                    "
                    >The name is mandatory.</mat-error
                  >
                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('name')?.hasError('maxlength')
                    "
                    >Maximum length is 40.</mat-error
                  >
                </mat-form-field>

                <mat-form-field
                  class="w-full"
                  appearance="fill"
                  hintLabel="Enter the event description."
                >
                  <mat-label>Event description</mat-label>
                  <textarea
                    matInput
                    formControlName="description"
                    required
                    autocomplete="off"
                    maxlength="500"
                  ></textarea>
                  <mat-hint align="end"
                    >{{
                      informationForm.get('description')?.value?.length || 0
                    }}/500</mat-hint
                  >

                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('description')?.hasError('required')
                    "
                    >The description is mandatory.</mat-error
                  >
                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('description')?.hasError('maxlength')
                    "
                    >Maximum length is 500.</mat-error
                  >
                </mat-form-field>

                <mat-form-field
                  class="w-full"
                  appearance="fill"
                  hintLabel="Enter the event location."
                >
                  <mat-label>Event Location</mat-label>
                  <input
                    matInput
                    formControlName="location"
                    required
                    autocomplete="off"
                    maxlength="40"
                  />
                  <mat-hint align="end"
                    >{{
                      informationForm.get('location')?.value?.length || 0
                    }}/40</mat-hint
                  >

                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('location')?.hasError('required')
                    "
                    >The location is mandatory.</mat-error
                  >
                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('location')?.hasError('maxlength')
                    "
                    >Maximum length is 40.</mat-error
                  >
                </mat-form-field>

                <mat-form-field
                  class="w-full"
                  appearance="fill"
                  hintLabel="Enter the event banner."
                >
                  <mat-label>Event Banner</mat-label>
                  <input
                    matInput
                    formControlName="banner"
                    required
                    autocomplete="off"
                    maxlength="40"
                    type="url"
                  />
                  <mat-hint align="end"
                    >{{
                      informationForm.get('banner')?.value?.length || 0
                    }}/40</mat-hint
                  >

                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('banner')?.hasError('required')
                    "
                    >The banner is mandatory.</mat-error
                  >
                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('banner')?.hasError('maxlength')
                    "
                    >Maximum length is 40.</mat-error
                  >
                </mat-form-field>

                <!-- <mat-form-field
                  class="w-full"
                  appearance="fill"
                  hintLabel="Enter the certifier funds."
                >
                  <mat-label>Certifier Funds</mat-label>
                  <input
                    matInput
                    formControlName="certifierFunds"
                    required
                    type="number"
                  />
                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('certifier')?.hasError('required')
                    "
                    >The certifier is mandatory.</mat-error
                  >
                </mat-form-field> -->

                <mat-form-field
                  class="w-full"
                  appearance="fill"
                  hintLabel="Enter the start date."
                >
                  <mat-label>Start date</mat-label>
                  <input
                    matInput
                    type="datetime-local"
                    required
                    formControlName="startDate"
                  />
                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('startDate')?.hasError('required')
                    "
                    >The start date is mandatory.</mat-error
                  >
                </mat-form-field>

                <mat-form-field
                  class="w-full"
                  appearance="fill"
                  hintLabel="Enter the end date."
                >
                  <mat-label>End date</mat-label>
                  <input
                    matInput
                    type="datetime-local"
                    required
                    formControlName="endDate"
                  />
                  <mat-error
                    *ngIf="
                      submitted &&
                      informationForm.get('endDate')?.hasError('required')
                    "
                    >The end date is mandatory.</mat-error
                  >
                </mat-form-field>
              </form>

              <div>
                <button
                  class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                  matStepperNext
                >
                  Next
                </button>
              </div>
            </div>
          </mat-step>
          <mat-step [stepControl]="ticketsForm">
            <div class="flex flex-col gap-3">
              <ng-template matStepLabel>Fill out ticket settings</ng-template>

              <form [formGroup]="ticketsForm" class="flex flex-col gap-2">
                <mat-form-field
                  class="w-full"
                  appearance="fill"
                  hintLabel="Enter ticket price"
                >
                  <mat-label>Ticket price</mat-label>
                  <input
                    matInput
                    formControlName="ticketPrice"
                    required
                    type="number"
                    autocomplete="off"
                  />
                  <mat-error
                    *ngIf="
                      submitted &&
                      ticketsForm.get('ticketPrice')?.hasError('required')
                    "
                    >The ticket price is mandatory.</mat-error
                  >
                </mat-form-field>

                <mat-form-field
                  class="w-full"
                  appearance="fill"
                  hintLabel="Enter ticket quantity"
                >
                  <mat-label>Ticket quantity</mat-label>
                  <input
                    matInput
                    formControlName="ticketQuantity"
                    required
                    type="number"
                    autocomplete="off"
                  />
                  <mat-error
                    *ngIf="
                      submitted &&
                      ticketsForm.get('ticketQuantity')?.hasError('required')
                    "
                    >The ticket quantity is mandatory.</mat-error
                  >
                </mat-form-field>
              </form>

              <div class="flex gap-2">
                <button
                  class="disco-btn blue ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                  matStepperPrevious
                >
                  Back
                </button>
                <button
                  class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                  matStepperNext
                >
                  Next
                </button>
              </div>
            </div>
          </mat-step>
          <mat-step>
            <div class="flex flex-col gap-3">
              <ng-template matStepLabel>Done</ng-template>
              <p>
                You are now done. Check your event preview before submitting.
              </p>
              <article
                class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
                style="width: 30rem; margin-bottom:12px;"
              >
                <header class="relative flex flex-col gap-2">
                  <figure class="h-52 overflow-hidden disco-layer blue">
                    <img [src]="informationForm.get('banner')?.value" alt="" />
                  </figure>

                  <div>
                    <h3
                      class="text-3xl uppercase m-0 disco-text blue disco-font overflow-hidden whitespace-nowrap overflow-ellipsis"
                    >
                      {{ informationForm.get('name')?.value }}
                    </h3>

                    <p
                      class="text-xs m-0 italic flex items-center text-opacity-50  disco-text gold"
                    >
                      <mat-icon inline>place</mat-icon>
                      {{ informationForm.get('location')?.value }}
                    </p>
                  </div>
                </header>
                <div class="flex flex-col gap-2">
                  <p class="line-clamp-3 text-justify m-0 h-14">
                    {{ informationForm.get('description')?.value }}
                  </p>

                  <div class="flex justify-between items-center">
                    <p class="text-left m-0">
                      Starts at: <br />

                      <span class="font-bold">{{
                        informationForm.get('startDate')?.value | date: 'short'
                      }}</span>
                    </p>

                    <p class="text-right m-0">
                      Ends at: <br />

                      <span class="font-bold">{{
                        informationForm.get('endDate')?.value | date: 'short'
                      }}</span>
                    </p>
                  </div>
                  <div class="flex flex-col items-center gap-3">
                    <div
                      class=" px-4 py-2 disco-layer disco-border border-2 blue"
                    >
                      <p class="m-0 text-justify disco-text gold">
                        Out of the total of
                        <b class="text-lg">{{
                          ticketsForm.get('ticketQuantity')?.value | number
                        }}</b>
                        tickets, none have been sold.
                      </p>
                    </div>
                    <div class="flex flex-col gap-2 w-full">
                      <div class="flex justify-between items-baseline">
                        <div class="flex gap-2 items-center">
                          <p class="text-center m-0">Price:</p>

                          <div class="flex items-center gap-1">
                            <figure>
                              <img
                                class="disco-accepted-mint-logo"
                                src="{{ acceptedMintLogo$ | async }}"
                                alt="usdc logo"
                              />
                            </figure>
                            <span
                              class="text-2xl font-bold leading-none disco-text green"
                              >{{
                                ticketsForm.get('ticketPrice')?.value
                                  | number: '1.2-2'
                              }}</span
                            >
                          </div>
                        </div>

                        <p class="m-0">
                          0/{{
                            ticketsForm.get('ticketQuantity')?.value | number
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              <div class="flex gap-2">
                <button
                  class="disco-btn blue ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                  matStepperPrevious
                >
                  Back
                </button>
                <button
                  class="disco-btn red ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                  (click)="stepper.reset()"
                >
                  Reset
                </button>
                <button
                  class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                  (click)="onSubmit()"
                >
                  Save
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </section>
    </div>
  `,
  styles: [
    `
      .mat-error + .mat-error {
        display: none;
      }
    `,
  ],
})
export class CreateEventComponent {
  submitted = false;
  readonly acceptedMintLogo$ = this._configStore.acceptedMintLogo$;
  readonly informationForm = this._formBuilder.group({
    // Event data
    name: this._formBuilder.control(null, {
      validators: [Validators.required, Validators.maxLength(40)],
    }),
    description: this._formBuilder.control(null, {
      validators: [Validators.required, Validators.maxLength(500)],
    }),
    location: this._formBuilder.control(null, {
      validators: [Validators.required, Validators.maxLength(40)],
    }),
    banner: this._formBuilder.control(null, {
      validators: [Validators.required, Validators.maxLength(40)],
    }),
    /* certifierFunds: this._formBuilder.control(null, {
      validators: [Validators.required],
    }), */
    startDate: this._formBuilder.control(null, {
      validators: [Validators.required],
    }),
    endDate: this._formBuilder.control(null, {
      validators: [Validators.required],
    }),
  });
  readonly ticketsForm = this._formBuilder.group({
    ticketQuantity: this._formBuilder.control(null, {
      validators: [Validators.required],
    }),
    ticketPrice: this._formBuilder.control(null, {
      validators: [Validators.required],
    }),
  });

  constructor(
    private readonly _formBuilder: UntypedFormBuilder,
    private readonly _eventApiService: EventApiService,
    private readonly _matSnackBar: MatSnackBar,
    private readonly _connectionStore: ConnectionStore,
    private readonly _router: Router,
    private readonly _configStore: ConfigStore
  ) {}

  onSubmit() {
    this.submitted = true;

    if (this.informationForm.valid && this.ticketsForm.valid) {
      this._eventApiService
        .createEvent({
          ...this.ticketsForm.value,
          ...this.informationForm.value,
        })
        .pipe(
          concatMap(() => {
            return this._matSnackBar
              .open('Event draft created!', 'Check your profile', {
                duration: 5000,
              })
              .afterDismissed()
              .pipe(
                tap(({ dismissedByAction }) => {
                  if (dismissedByAction) {
                    this._router.navigate(['/profile']);
                  }
                })
              );
          }),
          catchError((error) => {
            this._matSnackBar.open(error.message);
            return EMPTY;
          })
        )
        .subscribe();
    }
  }
}
