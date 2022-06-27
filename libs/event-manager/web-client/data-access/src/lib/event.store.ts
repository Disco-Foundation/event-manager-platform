import { Injectable } from '@angular/core';
import { BN } from '@heavy-duty/anchor';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { getMint, Mint } from '@solana/spl-token';
import { Connection } from '@solana/web3.js';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  defer,
  EMPTY,
  forkJoin,
  from,
  map,
  of,
  switchMap,
} from 'rxjs';
import { EventAccount, EventApiService } from './event-api.service';

export interface EventDetailsView extends EventAccount {
  acceptedMint: Mint;
  ticketMint: Mint;
  salesProgress: number;
  ticketPrice: number;
  ticketsSold: number;
  ticketsLeft: number;
  totalValueLocked: number;
  totalValueLockedInRecharges: number;
  totalValueLockedInTickets: number;
  totalDeposited: number;
  totalProfit: number;
  totalProfitInTickets: number;
  totalProfitInPurchases: number;
}

interface ViewModel {
  loading: boolean;
  eventId: string | null;
  event: EventDetailsView | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  event: null,
  eventId: null,
  error: null,
};

@Injectable()
export class EventStore extends ComponentStore<ViewModel> {
  private readonly reloadSubject = new BehaviorSubject(null);

  readonly eventId$ = this.select(({ eventId }) => eventId);
  readonly event$ = this.select(({ event }) => event);
  readonly loading$ = this.select(({ loading }) => loading);
  readonly error$ = this.select(({ error }) => error);

  constructor(
    private readonly _eventApiService: EventApiService,
    private readonly _connectionStore: ConnectionStore
  ) {
    super(initialState);

    this._loadEvent(
      combineLatest([
        // Trigger load events when connection changes
        this.select(
          this._connectionStore.connection$,
          this.eventId$,
          (connection, eventId) => ({ connection, eventId }),
          { debounce: true }
        ),
        this.reloadSubject.asObservable(),
      ]).pipe(map(([data]) => data))
    );
  }

  readonly setEventId = this.updater<string | null>((state, eventId) => ({
    ...state,
    eventId,
  }));

  private readonly _loadEvent = this.effect<{
    eventId: string | null;
    connection: Connection | null;
  }>(
    switchMap(({ connection, eventId }) => {
      // If there's no connection or eventId ignore loading call
      if (connection === null || eventId === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._eventApiService.findById(eventId).pipe(
        concatMap((event) => {
          if (event === null) {
            return of(null);
          }

          return forkJoin({
            acceptedMint: defer(() =>
              from(getMint(connection, event.account.acceptedMint))
            ),
            ticketMint: getMint(connection, event.account.ticketMint),
          }).pipe(
            map(({ acceptedMint, ticketMint }) => ({
              ...event,
              acceptedMint,
              ticketMint,
              ticketPrice: event.account.ticketPrice
                .div(new BN(10).pow(new BN(acceptedMint.decimals)))
                .toNumber(),
              ticketsSold: event.account.ticketsSold,
              ticketsLeft:
                event.account.ticketQuantity - Number(ticketMint.supply),
              salesProgress: Math.floor(
                (Number(ticketMint.supply) * 100) / event.account.ticketQuantity
              ),
              totalValueLocked: event.account.totalValueLocked
                .div(new BN(10).pow(new BN(acceptedMint.decimals)))
                .toNumber(),
              totalValueLockedInTickets: event.account.totalValueLockedInTickets
                .div(new BN(10).pow(new BN(acceptedMint.decimals)))
                .toNumber(),
              totalValueLockedInRecharges:
                event.account.totalValueLockedInRecharges
                  .div(new BN(10).pow(new BN(acceptedMint.decimals)))
                  .toNumber(),
              totalDeposited: event.account.totalDeposited
                .div(new BN(10).pow(new BN(acceptedMint.decimals)))
                .toNumber(),
              totalProfit: event.account.totalProfit
                .div(new BN(10).pow(new BN(acceptedMint.decimals)))
                .toNumber(),
              totalProfitInTickets: event.account.totalProfitInTickets
                .div(new BN(10).pow(new BN(acceptedMint.decimals)))
                .toNumber(),
              totalProfitInPurchases: event.account.totalProfitInPurchases
                .div(new BN(10).pow(new BN(acceptedMint.decimals)))
                .toNumber(),
            }))
          );
        }),
        tapResponse(
          (event) => {
            this.patchState({
              event,
              loading: false,
            });
          },
          (error) => this.patchState({ error, loading: false })
        )
      );
    })
  );

  reload() {
    this.reloadSubject.next(null);
  }
}
