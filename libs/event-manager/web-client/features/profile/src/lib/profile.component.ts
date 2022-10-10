import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ConfigStore,
  EventAccount,
  EventApiService,
  EventsByOwnerStore,
  TicketsByOwnerStore,
} from '@event-manager-web-client/data-access';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { catchError, concatMap, defer, EMPTY, first, from, tap } from 'rxjs';

@Component({
  selector: 'em-profile',
  template: `
    <div class="flex flex-col gap-8 mb-8">
      <header class="flex flex-col items-center gap-2">
        <h2
          class="m-0 text-5xl text-center font-bold disco-text blue disco-font"
        >
          My Profile
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
      </header>
      <div>
        <mat-tab-group animationDuration="0ms" style="align-items: center;">
          <mat-tab label="Tickets">
            <section
              *ngIf="tickets$ | async as tickets; else loading"
              class="flex flex-wrap gap-8 justify-center mt-6"
            >
              <p *ngIf="tickets.length === 0" class="text-center mt-10">
                There are no tickets.
              </p>

              <article
                *ngFor="let ticket of tickets"
                class="w-96 p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
              >
                <header class="relative flex flex-col gap-2">
                  <figure class="h-52 overflow-hidden bg-black">
                    <img [src]="ticket.account.banner" alt="" />
                  </figure>

                  <div>
                    <h3
                      class="text-3xl uppercase m-0 disco-text blue disco-font overflow-hidden whitespace-nowrap overflow-ellipsis"
                    >
                      {{ ticket.account.name }}
                    </h3>

                    <p
                      class="text-xs m-0 italic flex items-center text-opacity-50  disco-text gold"
                    >
                      <mat-icon inline>place</mat-icon>
                      {{ ticket.account.location }}
                    </p>
                  </div>

                  <a
                    class="absolute top-0 right-0"
                    mat-icon-button
                    aria-label="View details"
                    [routerLink]="['/view-event', ticket.account.fId]"
                  >
                    <mat-icon>launch</mat-icon>
                  </a>
                </header>

                <div class="flex flex-col gap-2 flex-grow">
                  <p class="line-clamp-3 text-justify m-0 flex-grow">
                    {{ ticket.account.description }}
                  </p>

                  <div class="flex justify-between items-center">
                    <p class="text-left m-0">
                      Starts at: <br />

                      <span class="font-bold">{{
                        ticket.account.eventStartDate.toNumber() | date: 'short'
                      }}</span>
                    </p>

                    <p class="text-right m-0">
                      Ends at: <br />

                      <span class="font-bold">{{
                        ticket.account.eventEndDate.toNumber() | date: 'short'
                      }}</span>
                    </p>
                  </div>

                  <div class="flex justify-between items-center gap-2 h-20">
                    <div
                      class="border-2 disco-layer disco-border blue w-full h-full flex flex-col justify-center"
                    >
                      <p class="text-center m-0">Ticket price:</p>
                      <div class="m-0 flex justify-center items-baseline gap-1">
                        <figure>
                          <img
                            class="disco-accepted-mint-logo"
                            src="{{ acceptedMintLogo$ | async }}"
                            alt="usdc logo"
                          />
                        </figure>

                        <p
                          class="text-center m-0 text-3xl font-bold leading-none disco-text green"
                        >
                          {{ 1 | number: '1.2-2' }}
                        </p>
                      </div>
                    </div>

                    <div
                      class="border-2 disco-layer disco-border blue w-full h-full flex flex-col justify-center"
                    >
                      <p class="text-center m-0">My Tickets:</p>
                      <p
                        class="text-center m-0 text-3xl font-bold leading-none disco-text green"
                      >
                        {{ 10 | number }}
                      </p>
                    </div>
                  </div>

                  <button
                    class="w-full disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                    emBuyTicketsTrigger
                    [eventName]="ticket.account.name"
                    [ticketPrice]="ticket.account.ticketPrice"
                    [eventId]="ticket.publicKey!.toBase58()"
                  >
                    <div class="flex flex-col items-center">
                      <span class="uppercase text-2xl"> Buy More </span>
                      <span class="text-xs italic">
                        Only
                        <b
                          >{{
                            ticket.account.ticketQuantity -
                              ticket.account.ticketsSold | number
                          }}
                          ticket(s)</b
                        >
                        left.
                      </span>
                    </div>
                  </button>
                </div>
              </article>
            </section>
            <ng-template #loading>
              <p class="text-center mt-10">There are no tickets.</p>
            </ng-template>
          </mat-tab>

          <mat-tab label="Events">
            <section
              *ngIf="events$ | async as events; else eventloading"
              class="flex flex-wrap gap-8 justify-center mt-6"
            >
              <p *ngIf="events.length === 0" class="text-center mt-10">
                There are no events.
              </p>
              <article
                *ngFor="let event of events"
                class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
                style="width: 30rem"
              >
                <header class="relative flex flex-col gap-2">
                  <figure class="h-52 overflow-hidden disco-layer blue">
                    <img [src]="event.account.banner" alt="" />
                  </figure>

                  <div>
                    <div
                      style="display: flex;
                      justify-content: space-between;
                      align-content: center;
                      align-items: flex-start;"
                    >
                      <h3
                        class="text-3xl uppercase m-0 disco-text blue disco-font overflow-hidden whitespace-nowrap overflow-ellipsis"
                      >
                        {{ event.account.name }}
                      </h3>
                    </div>

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
                    [routerLink]="['/view-event', event.account.fId]"
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
                    <div
                      class=" px-4 py-2 disco-layer disco-border border-2 blue"
                    >
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
                            event.account.ticketsSold ===
                            event.account.ticketQuantity
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
                                event.account.ticketPrice | number: '1.2-2'
                              }}</span
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
                      [eventId]="event.publicKey!.toBase58()"
                    >
                      <div class="flex flex-col items-center">
                        <span class="uppercase text-2xl"> Buy Tickets! </span>
                        <span class="text-xs italic">
                          Only
                          <b
                            >{{
                              event.account.ticketQuantity -
                                event.account.ticketsSold | number
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
            <ng-template #eventloading>
              <p class="text-center mt-10">There are no events.</p>
            </ng-template>
          </mat-tab>

          <mat-tab label="Drafts">
            <section
              *ngIf="draftEvents$ | async as drafts; else draftloading"
              class="flex flex-wrap gap-8 justify-center mt-6"
            >
              <p *ngIf="drafts.length === 0" class="text-center mt-10">
                There are no drafts events.
              </p>
              <article
                *ngFor="let draft of drafts"
                class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
                style="width: 30rem"
              >
                <header class="relative flex flex-col gap-2">
                  <figure class="h-52 overflow-hidden disco-layer blue">
                    <img [src]="draft.account.banner" alt="" />
                  </figure>

                  <div>
                    <div
                      style="display: flex;
                      justify-content: space-between;
                      align-content: center;
                      align-items: flex-start;"
                    >
                      <h3
                        class="text-3xl uppercase m-0 disco-text blue disco-font overflow-hidden whitespace-nowrap overflow-ellipsis"
                      >
                        {{ draft.account.name }}
                      </h3>
                      <p class="text-m m-0 flex items-center disco-text gold">
                        Draft
                      </p>
                    </div>

                    <p
                      class="text-xs m-0 italic flex items-center text-opacity-50  disco-text gold"
                    >
                      <mat-icon inline>place</mat-icon>
                      {{ draft.account.location }}
                    </p>
                  </div>

                  <a
                    class="absolute top-0 right-0"
                    mat-icon-button
                    aria-label="View details"
                    [routerLink]="['/view-draft-event', draft.account.fId]"
                  >
                    <mat-icon>launch</mat-icon>
                  </a>
                </header>

                <div class="flex flex-col gap-2">
                  <p class="line-clamp-3 text-justify m-0 h-14">
                    {{ draft.account.description }}
                  </p>

                  <div class="flex justify-between items-center">
                    <p class="text-left m-0">
                      Starts at: <br />

                      <span class="font-bold">{{
                        draft.account.eventStartDate | date: 'short'
                      }}</span>
                    </p>

                    <p class="text-right m-0">
                      Ends at: <br />

                      <span class="font-bold">{{
                        draft.account.eventEndDate | date: 'short'
                      }}</span>
                    </p>
                  </div>

                  <div class="flex flex-col items-center gap-3">
                    <div
                      class=" px-4 py-2 disco-layer disco-border border-2 blue"
                    >
                      <p
                        *ngIf="draft.account.ticketQuantity > 0"
                        class="m-0 text-justify disco-text gold"
                      >
                        <ng-container *ngIf="draft.account.ticketsSold === 0">
                          Out of the total of
                          <b class="text-lg">{{
                            draft.account.ticketQuantity | number
                          }}</b>
                          tickets, none have been sold.
                        </ng-container>
                        <ng-container *ngIf="draft.account.ticketsSold > 0">
                          Out of the total of
                          <b class="text-lg">{{
                            draft.account.ticketQuantity | number
                          }}</b>
                          tickets,
                          <b class="text-lg">{{
                            draft.account.ticketsSold | number
                          }}</b>
                          have been already sold.
                        </ng-container>
                        <ng-container
                          *ngIf="
                            draft.account.ticketsSold ===
                            draft.account.ticketQuantity
                          "
                        >
                          All
                          <b class="text-lg">{{
                            draft.account.ticketQuantity | number
                          }}</b>
                          tickets have been sold out.
                        </ng-container>
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
                                draft.account.ticketPrice | number: '1.2-2'
                              }}</span
                            >
                          </div>
                        </div>

                        <p class="m-0">
                          {{ draft.account.ticketsSold | number }}/{{
                            draft.account.ticketQuantity | number
                          }}
                        </p>
                      </div>
                    </div>

                    <button
                      class="w-full disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                      (click)="onPublishEvent(draft)"
                    >
                      <div class="flex flex-col items-center">
                        <span class="uppercase text-2xl"> Publish Event </span>
                      </div>
                    </button>
                  </div>
                </div>
              </article>
            </section>
            <ng-template #draftloading>
              <p class="text-center mt-10">There are no draft events.</p>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  providers: [EventsByOwnerStore, ConfigStore, TicketsByOwnerStore],
})
export class ProfileComponent implements OnInit {
  readonly events$ = this._eventsByOwnerStore.events$;
  readonly tickets$ = this._ticketsByOwnerStore.tickets$;
  readonly draftEvents$ = this._eventsByOwnerStore.draftEvents$;
  readonly acceptedMintLogo$ = this._configStore.acceptedMintLogo$;
  readonly error$ = this._eventsByOwnerStore.error$;

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _configStore: ConfigStore,
    private readonly _eventsByOwnerStore: EventsByOwnerStore,
    private readonly _ticketsByOwnerStore: TicketsByOwnerStore,
    private readonly _eventApiService: EventApiService,
    private readonly _matSnackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this._eventsByOwnerStore.setOwner(this._walletStore.publicKey$);
    this._ticketsByOwnerStore.setOwner(this._walletStore.publicKey$);
  }

  onReload() {
    this._eventsByOwnerStore.reload();
    this._ticketsByOwnerStore.reload();
  }

  onBuyTickets(
    event: PublicKey,
    acceptedMint: PublicKey,
    ticketQuantity: number
  ) {
    this._eventApiService
      .buyTickets({
        event,
        ticketQuantity,
        acceptedMint,
      })
      .pipe(
        concatMap((signature) => {
          this._matSnackBar.open('Confirming...');

          return this._connectionStore.connection$.pipe(
            first(),
            concatMap((connection) => {
              if (connection === null) {
                this._matSnackBar.open('Connection missing');
                return EMPTY;
              }

              return defer(() =>
                from(connection.confirmTransaction(signature))
              ).pipe(
                catchError((error) => {
                  this._matSnackBar.open(error.msg);
                  return EMPTY;
                })
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
              this._eventsByOwnerStore.reload();
            })
          );
        }),
        catchError((error) => {
          this._matSnackBar.open(error, 'close');
          return EMPTY;
        })
      )
      .subscribe();
  }

  onPublishEvent(draft: EventAccount) {
    this._eventsByOwnerStore.publishDraft(draft);
  }
}
