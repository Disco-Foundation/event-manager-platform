import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  EventApiService,
  EventStore,
} from '@event-manager-web-client/data-access';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { ScaleType } from '@swimlane/ngx-charts';
import {
  catchError,
  combineLatest,
  concatMap,
  defer,
  EMPTY,
  first,
  from,
  interval,
  map,
  startWith,
  tap,
} from 'rxjs';

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
          Everything you'll need to know about
          <b class="disco-text gold">{{ event.account.name }}</b> goes here.
        </p>

        <p class="m-0" *ngIf="error$ | async as error">
          {{ error }}
        </p>

        <button
          (click)="onReload()"
          class="disco-btn green ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
        >
          Reload
        </button>
      </header>

      <div class="flex flex-wrap justify-center gap-4">
        <div class="flex flex-col gap-4" style="width: 30rem">
          <section
            class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
          >
            <header class="flex flex-col gap-2">
              <figure class="h-48 overflow-hidden bg-black">
                <img [src]="event.account.banner" alt="" />
              </figure>

              <div>
                <h3 class="text-3xl uppercase m-0 disco-text blue disco-font">
                  {{ event.account.name }}
                </h3>

                <p
                  class="text-xs m-0 italic flex items-center text-opacity-50  disco-text gold"
                >
                  <mat-icon inline>place</mat-icon>
                  {{ event.account.location }}
                </p>
              </div>
            </header>

            <p class="m-0 text-justify">
              {{ event.account.description }}
            </p>
          </section>

          <section
            class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
          >
            <header>
              <h3 class="m-0 text-3xl uppercase disco-text blue disco-font">
                Tickets
              </h3>
            </header>

            <div class="flex flex-col items-center gap-3">
              <div class="px-4 py-2 disco-layer disco-border border-2 blue">
                <p
                  *ngIf="event.account.ticketQuantity > 0"
                  class="m-0 text-justify disco-text gold"
                >
                  <ng-container *ngIf="event.ticketsSold === 0">
                    Out of the total of
                    <b class="text-lg">{{
                      event.account.ticketQuantity | number
                    }}</b>
                    tickets, none have been sold.
                  </ng-container>
                  <ng-container *ngIf="event.ticketsSold > 0">
                    Out of the total of
                    <b class="text-lg">{{
                      event.account.ticketQuantity | number
                    }}</b>
                    tickets,
                    <b class="text-lg">{{ event.ticketsSold | number }}</b>
                    have been already sold.
                  </ng-container>
                  <ng-container
                    *ngIf="event.ticketsSold === event.account.ticketQuantity"
                  >
                    All
                    <b class="text-lg">{{
                      event.account.ticketQuantity | number
                    }}</b>
                    tickets have been sold out.
                  </ng-container>
                </p>
              </div>

              <mat-progress-bar
                mode="determinate"
                color="accent"
                [value]="event.salesProgress"
              ></mat-progress-bar>

              <div class="flex justify-between w-full">
                <a
                  [href]="
                    'https://explorer.solana.com/address/' +
                    event.ticketMint.address.toBase58()
                  "
                  class="disco-text purple disco-text-glow"
                  target="__blank"
                  >[view ticket mint in explorer]</a
                >
                <p class="m-0">
                  {{ event.ticketsSold | number }}/{{
                    event.account.ticketQuantity | number
                  }}
                </p>
              </div>

              <div class="flex flex-col gap-2">
                <p class="text-center m-0">Ticket price:</p>

                <div class="flex items-center gap-2">
                  <figure>
                    <img
                      class="w-5 h-5"
                      src="assets/usdc-logo.png"
                      alt="usdc logo"
                    />
                  </figure>
                  <span
                    class="text-3xl font-bold leading-none disco-text green"
                    >{{ event.ticketPrice | number: '1.2-2' }}</span
                  >
                </div>
              </div>

              <button
                class="w-full disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
                emBuyTicketsTrigger
                [eventName]="event.account.name"
                [ticketPrice]="event.ticketPrice"
                (buyTickets)="
                  onBuyTickets(
                    event.publicKey,
                    event.account.acceptedMint,
                    $event
                  )
                "
              >
                <div class="flex flex-col items-center">
                  <span class="uppercase text-2xl"> Buy Tickets! </span>
                  <span class="text-xs italic">
                    Only
                    <b>{{ event.ticketsLeft | number }} ticket(s)</b> left.
                  </span>
                </div>
              </button>
            </div>
          </section>
        </div>

        <div class="flex flex-col gap-4 w-96">
          <section
            class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
          >
            <header>
              <h3 class="disco-font m-0 text-3xl uppercase disco-text blue">
                Dates
              </h3>

              <p
                *ngIf="now$ | async as now"
                class="italic text-xs m-0 disco-text gold"
              >
                <ng-container
                  *ngIf="now < event.account.eventStartDate.toNumber()"
                >
                  Starts
                  {{
                    event.account.eventStartDate.toNumber() - now
                      | emRelativeTime
                  }}.
                </ng-container>
                <ng-container
                  *ngIf="
                    now > event.account.eventStartDate.toNumber() &&
                    now < event.account.eventEndDate.toNumber()
                  "
                >
                  Ends
                  {{
                    event.account.eventEndDate.toNumber() - now
                      | emRelativeTime
                  }}.
                </ng-container>
                <ng-container
                  *ngIf="now > event.account.eventEndDate.toNumber()"
                >
                  Ended
                  {{
                    now - event.account.eventEndDate.toNumber()
                      | emRelativeTime
                  }}.
                </ng-container>
              </p>
            </header>

            <div class="flex flex-col gap-3">
              <div>
                <p class="m-0">
                  From <br />
                  <span class="text-xl font-bold">
                    {{
                      event.account.eventStartDate.toNumber() | date: 'medium'
                    }}
                  </span>
                </p>
                <p class="m-0">
                  To <br />
                  <span class="text-xl font-bold">
                    {{ event.account.eventEndDate.toNumber() | date: 'medium' }}
                  </span>
                </p>
              </div>

              <div class="py-4 disco-layer disco-border border-2 blue">
                <p
                  class="m-0 font-bold uppercase text-2xl text-center disco-text gold"
                >
                  Lasts
                  {{
                    event.account.eventEndDate.toNumber() -
                      event.account.eventStartDate.toNumber() | emDurationTime
                  }}
                </p>
              </div>
            </div>
          </section>

          <section
            class="p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
          >
            <header>
              <h3 class="m-0 text-3xl uppercase disco-text blue disco-font ">
                Treasury
              </h3>
            </header>

            <div class="flex flex-col gap-3">
              <div class="flex flex-col gap-2">
                <div>Accepted Mint</div>
                <figure class="flex items-center gap-2">
                  <img class="w-8 h-8" src="assets/usdc-logo.png" />
                  <figcaption class="text-2xl font-bold">USDC</figcaption>
                </figure>
                <a
                  [href]="
                    'https://explorer.solana.com/address/' +
                    event.account.acceptedMint.toBase58()
                  "
                  target="__blank"
                  class="disco-text purple disco-text-glow"
                  >[view in explorer]</a
                >
              </div>

              <div class="flex justify-between">
                <div class="flex flex-col">
                  <p class="m-0">Total Value Locked</p>

                  <div class="flex items-center gap-2">
                    <figure>
                      <img
                        class="w-5 h-5"
                        src="assets/usdc-logo.png"
                        alt="usdc logo"
                      />
                    </figure>
                    <span
                      class="text-2xl font-bold leading-none disco-text green"
                      >{{ event.totalValueLocked | number: '1.2-2' }}</span
                    >
                  </div>
                </div>

                <div class="flex flex-col">
                  <p class="m-0">Total Deposited</p>

                  <div class="flex items-center gap-2">
                    <figure>
                      <img
                        class="w-5 h-5"
                        src="assets/usdc-logo.png"
                        alt="usdc logo"
                      />
                    </figure>
                    <span
                      class="text-2xl font-bold leading-none disco-text green"
                      >{{ event.totalDeposited | number: '1.2-2' }}</span
                    >
                  </div>
                </div>
              </div>

              <div class="flex justify-between items-center gap-4">
                <div class="w-full h-full flex justify-end items-center">
                  <ngx-charts-advanced-pie-chart
                    *ngIf="event.totalValueLocked > 0"
                    [view]="[500, 160]"
                    [scheme]="colorScheme"
                    [gradient]="true"
                    [results]="[
                      {
                        name: 'Tickets',
                        value: event.totalValueLockedInTickets
                      },
                      {
                        name: 'Recharges',
                        value: event.totalValueLockedInRecharges
                      }
                    ]"
                  >
                  </ngx-charts-advanced-pie-chart>

                  <p *ngIf="event.totalValueLocked === 0">
                    There's no total value locked.
                  </p>
                </div>
                <div class="w-full h-full flex flex-col gap-2 justify-center">
                  <div
                    class="flex items-center gap-4 px-4 py-2 disco-layer disco-border blue border-2"
                  >
                    <div
                      class="inline-block w-4 h-4 rounded-full"
                      style="background-color: #19fb9b"
                    ></div>

                    <div>
                      <p class="m-0 text-lg font-bold">Tickets</p>

                      <div class="flex items-center gap-2">
                        <figure>
                          <img
                            class="w-4 h-4"
                            src="assets/usdc-logo.png"
                            alt="usdc logo"
                          />
                        </figure>
                        <p
                          class="m-0 text-sm font-bold leading-none disco-text green"
                        >
                          {{
                            event.totalValueLockedInTickets | number: '1.2-2'
                          }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex items-center gap-4 px-4 py-2 disco-layer disco-border blue border-2"
                  >
                    <div
                      class="inline-block w-4 h-4 rounded-full"
                      style="background-color: #ff5ef9"
                    ></div>

                    <div>
                      <p class="m-0 text-lg font-bold">Recharges</p>

                      <div class="flex items-center gap-2">
                        <figure>
                          <img
                            class="w-4 h-4"
                            src="assets/usdc-logo.png"
                            alt="usdc logo"
                          />
                        </figure>
                        <p
                          class="m-0 text-sm font-bold leading-none disco-text green"
                        >
                          {{
                            event.totalValueLockedInRecharges | number: '1.2-2'
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col">
                <p class="m-0">Profit</p>

                <div class="flex items-center gap-2">
                  <figure>
                    <img
                      class="w-6 h-6"
                      src="assets/usdc-logo.png"
                      alt="usdc logo"
                    />
                  </figure>
                  <div>
                    <span
                      class="text-3xl font-bold leading-none disco-text green"
                      >{{ event.totalProfit | number: '1.2-2' }}</span
                    >
                    <span class="text-xs disco-text green">
                      ({{
                        (event.totalProfit * 100) / event.totalDeposited
                          | number
                      }}%)
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex justify-between items-center gap-4">
                <div class="w-full h-full flex justify-end items-center ">
                  <ngx-charts-advanced-pie-chart
                    *ngIf="event.totalProfit > 0"
                    [view]="[500, 160]"
                    [scheme]="colorScheme"
                    [gradient]="true"
                    [results]="[
                      {
                        name: 'Tickets',
                        value: event.totalProfitInTickets
                      },
                      {
                        name: 'Purchases',
                        value: event.totalProfitInPurchases
                      }
                    ]"
                  >
                  </ngx-charts-advanced-pie-chart>

                  <p *ngIf="event.totalProfit === 0">There's no profit yet.</p>
                </div>
                <div class="w-full h-full flex flex-col gap-2 justify-center">
                  <div
                    class="flex items-center gap-4 px-4 py-2 disco-layer disco-border blue border-2"
                  >
                    <div
                      class="inline-block w-4 h-4 rounded-full"
                      style="background-color: #19fb9b"
                    ></div>

                    <div>
                      <p class="m-0 text-lg font-bold">Tickets</p>

                      <div class="flex items-center gap-2">
                        <figure>
                          <img
                            class="w-4 h-4"
                            src="assets/usdc-logo.png"
                            alt="usdc logo"
                          />
                        </figure>
                        <p
                          class="m-0 text-sm font-bold leading-none disco-text green"
                        >
                          {{ event.totalProfitInTickets | number: '1.2-2' }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex items-center gap-4 px-4 py-2 disco-layer disco-border blue border-2"
                  >
                    <div
                      class="inline-block w-4 h-4 rounded-full"
                      style="background-color: #ff5ef9"
                    ></div>

                    <div>
                      <p class="m-0 text-lg font-bold">Purchases</p>

                      <div class="flex items-center gap-2">
                        <figure>
                          <img
                            class="w-4 h-4"
                            src="assets/usdc-logo.png"
                            alt="usdc logo"
                          />
                        </figure>
                        <p
                          class="m-0 text-sm font-bold leading-none disco-text green"
                        >
                          {{ event.totalProfitInPurchases | number: '1.2-2' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .advanced-pie-legend-wrapper {
        display: none;
      }
    `,
  ],
  providers: [EventStore],
})
export class ViewEventComponent implements OnInit {
  readonly event$ = this._eventStore.event$;
  readonly loading$ = this._eventStore.loading$;
  readonly error$ = this._eventStore.error$;
  readonly now$ = interval(1000).pipe(
    startWith(Date.now()),
    map(() => Date.now())
  );
  readonly beforeStart$ = combineLatest([this.event$, this.now$]).pipe(
    map(([event, now]) => event?.account.eventStartDate.toNumber() - now)
  );
  readonly beforeEnd$ = combineLatest([this.event$, this.now$]).pipe(
    map(([event, now]) => event?.account.eventEndDate.toNumber() - now)
  );
  readonly sinceEnd$ = combineLatest([this.event$, this.now$]).pipe(
    map(([event, now]) => now - event?.account.eventEndDate.toNumber())
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
    private readonly _eventApiService: EventApiService,
    private readonly _matSnackBar: MatSnackBar,
    private readonly _connectionStore: ConnectionStore
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
              this._eventStore.reload();
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
}
