import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ConfigStore,
  EventApiService,
  EventsByOwnerStore,
  Web3AuthStore,
} from '@event-manager-web-client/data-access';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import {
  catchError,
  combineLatest,
  concatMap,
  defer,
  EMPTY,
  first,
  from,
  map,
  tap,
} from 'rxjs';

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

        <button
          (click)="onReload()"
          class="disco-btn green ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
        >
          Reload
        </button>
      </header>

      <section
        *ngIf="events$ | async as events; else emptyList"
        class="flex flex-wrap gap-8 justify-center"
      >
        <article
          *ngFor="let event of events"
          class="w-96 p-4 border-4 disco-layer disco-border disco-glow ease-out duration-300 blue flex flex-col gap-3"
        >
          <header class="relative flex flex-col gap-2">
            <figure class="h-52 overflow-hidden bg-black">
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
              [routerLink]="['/view-event', event.publicKey.toBase58()]"
            >
              <mat-icon>launch</mat-icon>
            </a>
          </header>

          <div class="flex flex-col gap-2 flex-grow">
            <p class="line-clamp-3 text-justify m-0 flex-grow">
              {{ event.account.description }}
            </p>

            <div class="flex justify-between items-center">
              <p class="text-left m-0">
                Starts at: <br />

                <span class="font-bold">{{
                  event.account.eventStartDate.toNumber() | date: 'short'
                }}</span>
              </p>

              <p class="text-right m-0">
                Ends at: <br />

                <span class="font-bold">{{
                  event.account.eventEndDate.toNumber() | date: 'short'
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
                    {{ event.ticketPrice | number: '1.2-2' }}
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
                  {{ event.ticketQuantity | number }}
                </p>
              </div>
            </div>

            <button
              class="w-full disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
              emBuyTicketsTrigger
              [eventName]="event.account.name"
              [ticketPrice]="event.ticketPrice"
              [eventId]="event.publicKey.toBase58()"
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
        </article>
      </section>

      <ng-template #emptyList>
        <p class="text-center">There are no events.</p>
      </ng-template>
    </div>
  `,
  providers: [EventsByOwnerStore, ConfigStore],
})
export class ProfileComponent implements OnInit {
  readonly events$ = this._eventsByOwnerStore.events$;
  readonly acceptedMintLogo$ = this._configStore.acceptedMintLogo$;
  readonly error$ = this._eventsByOwnerStore.error$;

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _web3AuthStore: Web3AuthStore,
    private readonly _configStore: ConfigStore,
    private readonly _eventsByOwnerStore: EventsByOwnerStore,
    private readonly _eventApiService: EventApiService,
    private readonly _matSnackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this._eventsByOwnerStore.setOwner(
      combineLatest([
        this._walletStore.publicKey$,
        this._web3AuthStore.publicKey$,
      ]).pipe(
        map(
          ([walletPublicKey, web3AuthPublicKey]) =>
            walletPublicKey || web3AuthPublicKey
        )
      )
    );
  }

  onReload() {
    this._eventsByOwnerStore.reload();
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
}
