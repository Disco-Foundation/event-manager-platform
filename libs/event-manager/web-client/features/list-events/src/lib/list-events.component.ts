import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ConfigStore,
  EventProgramService,
  EventsStore,
} from '@event-manager-web-client/data-access';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { catchError, concatMap, defer, EMPTY, first, from, tap } from 'rxjs';

@Component({
  selector: 'em-list-events',
  template: `
    <div class="flex flex-col gap-8 mb-8">
      <header class="flex flex-col items-center gap-2">
        <h2
          class="m-0 text-5xl text-center font-bold disco-text blue disco-font"
        >
          Events Board
        </h2>
        <p class="text-center">
          Looking to create your own event?
          <a
            [routerLink]="['/create-event']"
            class="underline disco-text purple disco-text-glow"
            >Create event</a
          >
        </p>

        <p class="text-center" *ngIf="error$ | async as error">
          {{ error }}
        </p>
        <div class="flex flex-wrap gap-8 justify-center mt-1">
          <form
            [formGroup]="searchForm"
            style="width: 25rem; display: flex; flex-direction: row;align-items: center;"
          >
            <mat-form-field class="w-full" appearance="fill">
              <input
                matInput
                formControlName="search"
                required
                type="string"
                autocomplete="off"
                placeholder="Search event..."
              />
            </mat-form-field>
          </form>
          <!--<button
            (click)="onReload()"
            class="disco-btn green ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
          >
            Reload
          </button>-->
        </div>
      </header>

      <section
        *ngIf="events$ | async as events; else notLoaded"
        class="flex flex-wrap gap-8 justify-center"
      >
        <p *ngIf="events.length === 0">No Events Found</p>

        <article
          *ngFor="let event of events | searchFilter: searchForm.value.search"
          class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
          style="width: 30rem"
        >
          <header class="relative flex flex-col gap-2">
            <figure class="h-52 overflow-hidden disco-layer blue">
              <img [src]="event.account.banner" alt="" />
            </figure>

            <div>
              <h3
                class="text-3xl uppercase m-0 disco-text blue disco-font overflow-hidden whitespace-nowrap overflow-ellipsis"
              >
                {{ event.account.name }}
              </h3>

              <p
                class="text-xs m-0 italic flex items-center text-opacity-50  disco-text gold"
              >
                <mat-icon inline>place</mat-icon>
                {{ event.account.location }}
              </p>
            </div>

            <a
              class="absolute top-0 right-0"
              mat-icon-button
              aria-label="View details"
              [routerLink]="['/view-event', event.account.eventId]"
            >
              <mat-icon>launch</mat-icon>
            </a>
          </header>

          <div class="flex flex-col gap-2">
            <p class="line-clamp-3 text-justify m-0 h-14">
              {{ event.account.description }}
            </p>

            <div class="flex justify-between items-center">
              <p class="text-left m-0">
                Starts at: <br />

                <span class="font-bold">{{
                  event.account.eventStartDate | date: 'short'
                }}</span>
              </p>

              <p class="text-right m-0">
                Ends at: <br />

                <span class="font-bold">{{
                  event.account.eventEndDate | date: 'short'
                }}</span>
              </p>
            </div>

            <div class="flex flex-col items-center gap-3">
              <div class=" px-4 py-2 disco-layer disco-border border-2 blue">
                <p
                  *ngIf="event.account.ticketQuantity > 0"
                  class="m-0 text-justify disco-text gold"
                >
                  <ng-container *ngIf="event.account.ticketsSold === 0">
                    Out of the total of
                    <b class="text-lg">{{
                      event.account.ticketQuantity | number
                    }}</b>
                    tickets, none have been sold.
                  </ng-container>
                  <ng-container *ngIf="event.account.ticketsSold > 0">
                    Out of the total of
                    <b class="text-lg">{{
                      event.account.ticketQuantity | number
                    }}</b>
                    tickets,
                    <b class="text-lg">{{
                      event.account.ticketsSold | number
                    }}</b>
                    have been already sold.
                  </ng-container>
                  <ng-container
                    *ngIf="
                      event.account.ticketsSold === event.account.ticketQuantity
                    "
                  >
                    All
                    <b class="text-lg">{{
                      event.account.ticketQuantity | number
                    }}</b>
                    tickets have been sold out.
                  </ng-container>
                </p>
              </div>

              <div class="flex flex-col gap-2 w-full">
                <mat-progress-bar
                  mode="determinate"
                  color="accent"
                ></mat-progress-bar>
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
                        >{{ event.account.ticketPrice | number: '1.2-2' }}</span
                      >
                    </div>
                  </div>

                  <p class="m-0">
                    {{ event.account.ticketsSold | number }}/{{
                      event.account.ticketQuantity | number
                    }}
                  </p>
                </div>
              </div>

              <button
                class="w-full disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                emBuyTicketsTrigger
                [eventName]="event.account.name"
                [ticketPrice]="event.account.ticketPrice"
                [eventId]="event.account.eventId"
                (buyTickets)="
                  onBuyTickets(
                    event.publicKey!,
                    event.account.acceptedMint!,
                    $event,
                    event.account.eventId
                  )
                "
              >
                <div class="flex flex-col items-center">
                  <span class="uppercase text-2xl"> Buy Tickets! </span>
                  <span class="text-xs italic">
                    Only
                    <b
                      >{{
                        event.account.ticketQuantity - event.account.ticketsSold
                          | number
                      }}
                      ticket(s)</b
                    >
                    left.
                  </span>
                </div>
              </button>
            </div>
          </div>
        </article>
      </section>

      <!-- <ng-template #emptyList>
        <p class="text-center">There are no events.</p>
      </ng-template> -->

      <ng-template #notLoaded>
        <div class="w-full flex justify-center mt-20">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      </ng-template>
    </div>
  `,
  providers: [EventsStore],
})
export class ListEventsComponent {
  readonly events$ = this._eventsStore.events$;
  readonly loading$ = this._eventsStore.loading$;
  readonly error$ = this._eventsStore.error$;
  readonly acceptedMintLogo$ = this._configStore.acceptedMintLogo$;

  readonly searchForm = this._formBuilder.group({
    search: '',
  });

  constructor(
    private readonly _configStore: ConfigStore,
    private readonly _eventsStore: EventsStore,
    private readonly _eventProgramService: EventProgramService,
    private readonly _matSnackBar: MatSnackBar,
    private readonly _connectionStore: ConnectionStore,
    private readonly _formBuilder: UntypedFormBuilder
  ) {}

  onReload() {
    this._eventsStore.reload();
  }

  onBuyTickets(
    event: PublicKey,
    acceptedMint: PublicKey,
    ticketQuantity: number,
    eventId: string
  ) {
    this._eventProgramService
      .buyTickets({
        event,
        ticketQuantity,
        acceptedMint,
        eventId,
      })
      .pipe(
        concatMap((signature) => {
          this._matSnackBar.open('Confirming...');

          return this._connectionStore.connection$.pipe(
            first(),
            concatMap((connection) => {
              if (connection === null) {
                this._matSnackBar.open('Connection missing', 'close', {
                  duration: 5000,
                });
                return EMPTY;
              }

              return defer(() =>
                from(connection.confirmTransaction(signature))
              );
            }),
            tap(() => {
              this._matSnackBar.open(
                `You bought (${ticketQuantity}) ticket(s)!`,
                'Close',
                {
                  duration: 5000,
                }
              );
              this._eventsStore.reload();
            })
          );
        }),
        catchError((error) => {
          this._matSnackBar.open(error, 'close', {
            duration: 5000,
          });
          return EMPTY;
        })
      )
      .subscribe();
  }
}
