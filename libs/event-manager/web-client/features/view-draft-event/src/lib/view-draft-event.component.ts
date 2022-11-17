import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigStore, EventStore } from '@event-manager-web-client/data-access';
import { ScaleType } from '@swimlane/ngx-charts';
import { catchError, concatMap, EMPTY, interval, map, startWith } from 'rxjs';
@Component({
  selector: 'em-view-event',
  template: `
    <div
      *ngIf="event$ | async as event"
      class="flex flex-col items-center gap-8 mb-8"
    >
      <header class="flex flex-col items-center gap-2">
        <h2
          class="m-0 text-5xl text-center font-bold disco-text blue disco-font"
        >
          {{ event.account.name }}
        </h2>

        <p class="m-0 text-center">
          You can edit everything about
          <b class="disco-text gold">{{ event.account.name }}</b> here.
        </p>

        <p class="m-0" *ngIf="error$ | async as error">
          {{ error }}
        </p>
      </header>

      <div class="flex flex-wrap justify-center gap-8">
        <div class="flex flex-row gap-4" style="width: 50rem; margin-top:2rem">
          <section
            class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
            style="width: 60%; height: fit-content;"
          >
            <header class="flex flex-col gap-2">
              <figure class="h-48 overflow-hidden bg-black">
                <img [src]="event.account.banner" alt="" />
              </figure>

              <div>
                <div style="display: flex; justify-content: space-between;">
                  <h3 class="text-3xl uppercase m-0 disco-text blue disco-font">
                    {{ event.account.name }}
                  </h3>
                  <button
                    class=" top-0 right-0"
                    mat-icon-button
                    (click)="showEditInfo()"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>

                <p
                  class="text-xs m-0 italic flex items-center text-opacity-50  disco-text gold"
                >
                  <mat-icon inline>place</mat-icon>
                  {{ event.account.location }}
                </p>
              </div>
            </header>

            <div class="flex flex-col gap-3">
              <p class="m-0 text-justify" style="    height: 45px;">
                {{ event.account.description }}
              </p>
              <button
                class="w-full disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                (click)="onPublishEvent()"
              >
                Publish Event
              </button>
            </div>
          </section>
          <div class="flex flex-col gap-4 w-98" style="width: 20rem;">
            <section
              class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
            >
              <header>
                <div style="display: flex; justify-content: space-between;">
                  <h3 class="disco-font m-0 text-3xl uppercase disco-text blue">
                    Dates
                  </h3>
                  <button
                    class=" top-0 right-0"
                    mat-icon-button
                    (click)="showEditDates()"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>

                <p
                  *ngIf="now$ | async as now"
                  class="italic text-xs m-0 disco-text gold"
                >
                  <ng-container *ngIf="now < event.account.eventStartDate">
                    Starts
                    {{ event.account.eventStartDate - now | emRelativeTime }}.
                  </ng-container>
                  <ng-container
                    *ngIf="
                      now > event.account.eventStartDate &&
                      now < event.account.eventEndDate
                    "
                  >
                    Ends
                    {{ event.account.eventEndDate - now | emRelativeTime }}.
                  </ng-container>
                  <ng-container *ngIf="now > event.account.eventEndDate">
                    Ended
                    {{ now - event.account.eventEndDate | emRelativeTime }}.
                  </ng-container>
                </p>
              </header>

              <div class="flex flex-col gap-3">
                <div>
                  <p class="m-0">
                    From <br />
                    <span class="text-xl font-bold">
                      {{ event.account.eventStartDate | date: 'medium' }}
                    </span>
                  </p>
                  <p class="m-0">
                    To <br />
                    <span class="text-xl font-bold">
                      {{ event.account.eventEndDate | date: 'medium' }}
                    </span>
                  </p>
                </div>
                <div class="py-4 disco-layer disco-border border-2 blue">
                  <p
                    class="m-0 font-bold uppercase text-2xl text-center disco-text gold"
                  >
                    Lasts
                    {{
                      event.account.eventEndDate - event.account.eventStartDate
                        | emDurationTime
                    }}
                  </p>
                </div>
              </div>
            </section>
            <section
              class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
            >
              <header>
                <div style="display: flex; justify-content: space-between;">
                  <h3 class="m-0 text-3xl uppercase disco-text blue disco-font">
                    Tickets
                  </h3>
                  <button
                    class=" top-0 right-0"
                    mat-icon-button
                    (click)="showEditTickets()"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>
              </header>

              <div class="flex flex-col  gap-3">
                <div class="flex flex-col gap-2">
                  <p class=" m-0">Ticket price:</p>

                  <div class="flex  gap-2">
                    <figure>
                      <img
                        class="disco-accepted-mint-logo"
                        src="{{ acceptedMintLogo$ | async }}"
                        alt="usdc logo"
                      />
                    </figure>
                    <span
                      class="text-3xl font-bold leading-none disco-text green"
                      >{{ event.account.ticketPrice | number: '1.2-2' }}</span
                    >
                  </div>
                  <div class="flex flex-col gap-2">
                    <div>Accepted Mint</div>
                    <figure class="flex  gap-2">
                      <img
                        class="disco-accepted-mint-logo h8 w8"
                        src="{{ acceptedMintLogo$ | async }}"
                      />
                      <figcaption class="text-2xl font-bold">
                        {{ acceptedMintSymbol$ | async }}
                      </figcaption>
                    </figure>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <ng-container *ngIf="editingInfo">
        <div
          id="eventContainer"
          class="disco-layer disco-border border-4 disco-glow blue"
          style="width: 50rem; padding:1rem;"
        >
          <h4 class="m-0 text-xl disco-text">Edit Basic Info</h4>
          <form
            [formGroup]="infoForm"
            class="flex flex-col gap-2 w-full"
            style="margin-top: 1rem; marging-bottom:1rem"
          >
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
                [ngModel]="event.account.name"
              />
              <mat-hint align="end"
                >{{ infoForm.get('name')?.value?.length || 0 }}/40</mat-hint
              >

              <mat-error
                *ngIf="submitted && infoForm.get('name')?.hasError('required')"
                >The name is mandatory.</mat-error
              >
              <mat-error
                *ngIf="submitted && infoForm.get('name')?.hasError('maxlength')"
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
                [ngModel]="event.account.description"
              ></textarea>
              <mat-hint align="end"
                >{{
                  infoForm.get('description')?.value?.length || 0
                }}/500</mat-hint
              >

              <mat-error
                *ngIf="
                  submitted && infoForm.get('description')?.hasError('required')
                "
                >The description is mandatory.</mat-error
              >
              <mat-error
                *ngIf="
                  submitted &&
                  infoForm.get('description')?.hasError('maxlength')
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
                [ngModel]="event.account.location"
              />
              <mat-hint align="end"
                >{{ infoForm.get('location')?.value?.length || 0 }}/40</mat-hint
              >

              <mat-error
                *ngIf="
                  submitted && infoForm.get('location')?.hasError('required')
                "
                >The location is mandatory.</mat-error
              >
              <mat-error
                *ngIf="
                  submitted && infoForm.get('location')?.hasError('maxlength')
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
                [ngModel]="event.account.banner"
              />
              <mat-hint align="end"
                >{{ infoForm.get('banner')?.value?.length || 0 }}/40</mat-hint
              >

              <mat-error
                *ngIf="
                  submitted && infoForm.get('banner')?.hasError('required')
                "
                >The banner is mandatory.</mat-error
              >
              <mat-error
                *ngIf="
                  submitted && infoForm.get('banner')?.hasError('maxlength')
                "
                >Maximum length is 40.</mat-error
              >
            </mat-form-field>
          </form>
          <div class="flex gap-2 w-full" style="margin-top: 1rem;">
            <button
              class="disco-btn red ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
              (click)="onCancel()"
            >
              Cancel
            </button>
            <button
              class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
              (click)="onSaveInfo()"
            >
              Save
            </button>
          </div>
        </div>
      </ng-container>
      <ng-container *ngIf="editingDates">
        <div
          id="datesContainer"
          class="disco-layer disco-border border-4 disco-glow blue"
          style="width: 50rem; padding:1rem;"
        >
          <h4 class="m-0 text-xl disco-text">Edit Dates Info</h4>
          <form
            [formGroup]="datesForm"
            class="flex flex-col gap-2 w-full"
            style="margin-top: 1rem; marging-bottom:1rem"
          >
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
                [ngModel]="event.account.eventStartDate | date: 'short'"
              />
              <mat-error
                *ngIf="
                  submitted && datesForm.get('startDate')?.hasError('required')
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
                [ngModel]="event.account.eventEndDate | date: 'short'"
              />
              <mat-error
                *ngIf="
                  submitted && datesForm.get('endDate')?.hasError('required')
                "
                >The end date is mandatory.</mat-error
              >
            </mat-form-field>
          </form>
          <div class="flex gap-2 w-full" style="margin-top: 1rem;">
            <button
              class="disco-btn red ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
              (click)="onCancel()"
            >
              Cancel
            </button>
            <button
              class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
              (click)="onSaveDates()"
            >
              Save
            </button>
          </div>
        </div>
      </ng-container>
      <ng-container *ngIf="editingTickets">
        <div
          id="ticketsContainer"
          class="disco-layer disco-border border-4 disco-glow blue"
          style="width: 50rem; padding:1rem;"
        >
          <h4 class="m-0 text-xl disco-text">Edit Tickets Info</h4>
          <form
            [formGroup]="ticketsForm"
            class="flex flex-col gap-2 w-full"
            style="margin-top: 1rem; marging-bottom:1rem"
          >
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
                [ngModel]="event.account.ticketPrice"
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
                [ngModel]="event.account.ticketQuantity"
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
          <div class="flex gap-2 w-full" style="margin-top: 1rem;">
            <button
              class="disco-btn red ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
              (click)="onCancel()"
            >
              Cancel
            </button>
            <button
              class="disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
              (click)="onSaveTickets()"
            >
              Save
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .advanced-pie-legend-wrapper {
        display: none;
      }
    `,
  ],
  providers: [EventStore, ConfigStore],
})
export class ViewDraftEventComponent implements OnInit {
  editingInfo = false;
  editingDates = false;
  editingTickets = false;
  submitted = false;

  readonly event$ = this._eventStore.event$;
  readonly acceptedMintLogo$ = this._configStore.acceptedMintLogo$;
  readonly acceptedMintSymbol$ = this._configStore.acceptedMintSymbol$;
  readonly loading$ = this._eventStore.loading$;
  readonly error$ = this._eventStore.error$;
  readonly ticketsForm = this._formBuilder.group({
    ticketQuantity: this._formBuilder.control(null, {
      validators: [Validators.required],
    }),
    ticketPrice: this._formBuilder.control(null, {
      validators: [Validators.required],
    }),
  });
  readonly datesForm = this._formBuilder.group({
    startDate: this._formBuilder.control(null, {
      validators: [Validators.required],
    }),
    endDate: this._formBuilder.control(null, {
      validators: [Validators.required],
    }),
  });

  readonly infoForm = this._formBuilder.group({
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
  });

  readonly now$ = interval(1000).pipe(
    startWith(Date.now()),
    map(() => Date.now())
  );

  readonly colorScheme = {
    name: 'my-color-scheme',
    selectable: false,
    group: ScaleType.Linear,
    domain: ['#19fb9b', '#ff5ef9'],
  };

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _eventStore: EventStore,
    private readonly _configStore: ConfigStore,
    private readonly _formBuilder: UntypedFormBuilder,
    private readonly _matSnackBar: MatSnackBar,
    private readonly _router: Router
  ) {}

  ngOnInit() {
    this._eventStore.setEventId(
      this._activatedRoute.paramMap.pipe(
        map((paramMap) => paramMap.get('eventId'))
      )
    );
  }

  onReload() {
    this._eventStore.reload();
  }

  onPublishEvent() {
    this._eventStore
      .publishEvent()
      .pipe(
        concatMap(() => {
          return this._matSnackBar
            .open('Event published!', '', {
              duration: 5000,
            })
            .afterOpened();
        }),
        catchError((error) => {
          this._matSnackBar.open(error.message, 'close', {
            duration: 5000,
          });
          return EMPTY;
        })
      )
      .subscribe(() => this._router.navigate(['/profile']));
  }

  showEditTickets() {
    this.editingDates = false;
    this.editingInfo = false;

    this.editingTickets = true;
    this.waitForElement('ticketsContainer');
  }

  onSaveTickets() {
    this.submitted = true;
    if (this.ticketsForm.valid) {
      this._eventStore
        .updateEventTickets({
          ...this.ticketsForm.value,
        })
        .pipe(
          concatMap(() => {
            return this._matSnackBar
              .open('Event draft updated!', '', {
                duration: 5000,
              })
              .afterOpened();
          }),
          catchError((error) => {
            this._matSnackBar.open(error.message, 'close', {
              duration: 5000,
            });
            return EMPTY;
          })
        )
        .subscribe(() => this.onCancel());
    }
  }

  showEditDates() {
    this.editingInfo = false;
    this.editingTickets = false;

    this.editingDates = true;
    this.waitForElement('datesContainer');
  }

  onSaveDates() {
    this.submitted = true;
    if (this.datesForm.valid) {
      this._eventStore
        .updateEventDates({
          ...this.datesForm.value,
        })
        .pipe(
          concatMap(() => {
            return this._matSnackBar
              .open('Event draft updated!', 'close', {
                duration: 5000,
              })
              .afterOpened();
          }),
          catchError((error) => {
            this._matSnackBar.open(error.message, 'close', {
              duration: 5000,
            });
            return EMPTY;
          })
        )
        .subscribe(() => this.onCancel());
    }
  }

  showEditInfo() {
    this.editingInfo = true;
    this.editingDates = false;
    this.editingTickets = false;
    this.waitForElement('eventContainer');
  }

  onSaveInfo() {
    this.submitted = true;
    if (this.infoForm.valid) {
      this._eventStore
        .updateEventInfo({
          ...this.infoForm.value,
        })
        .pipe(
          concatMap(() => {
            return this._matSnackBar
              .open('Event draft updated!', '', {
                duration: 5000,
              })
              .afterOpened();
          }),
          catchError((error) => {
            this._matSnackBar.open(error.message, 'close', {
              duration: 5000,
            });
            return EMPTY;
          })
        )
        .subscribe(() => this.onCancel());
    }
  }

  onCancel() {
    this.submitted = false;
    this.editingDates = false;
    this.editingInfo = false;
    this.editingTickets = false;
    this.onReload();
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element === null) {
      return;
    }
    element.scrollIntoView({ behavior: 'smooth' });
  }

  waitForElement(id: string) {
    this.scrollTo(id);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const nodes = Array.from(mutation.addedNodes);
        for (const node of nodes) {
          if (node.contains(document.getElementById(id))) {
            this.scrollTo(id);
            observer.disconnect();
            return;
          }
        }
      });
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
}
