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
  acceptedMint: Mint | null;
  ticketMint: Mint | null;
  salesProgress: number;
  ticketPrice: number;
  ticketsSold: number;
  ticketsLeft: number;
  totalProfit: number;
}

interface ViewModel {
  loading: boolean;
  eventId: string | null;
  event: EventDetailsView | null;
  error: unknown | null;
  draft: boolean;
}

const initialState: ViewModel = {
  loading: false,
  event: null,
  eventId: null,
  error: null,
  draft: false,
};

@Injectable()
export class EventStore extends ComponentStore<ViewModel> {
  private readonly reloadSubject = new BehaviorSubject(null);

  readonly eventId$ = this.select(({ eventId }) => eventId);
  readonly event$ = this.select(({ event }) => event);
  readonly loading$ = this.select(({ loading }) => loading);
  readonly error$ = this.select(({ error }) => error);
  readonly draft$ = this.select(({ draft }) => draft);

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

  readonly setDraft = this.updater<boolean>((state, draft) => ({
    ...state,
    draft,
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

      console.log(eventId);
      return this._eventApiService.findEventById(eventId).pipe(
        concatMap((event) => {
          if (event === null) {
            return of(null);
          }

          return forkJoin({
            acceptedMint: defer(() =>
              from(
                event.account.acceptedMint != null
                  ? getMint(connection, event.account.acceptedMint!)
                  : of(null)
              )
            ),
            ticketMint:
              event.account.ticketMint != null
                ? getMint(connection, event.account.ticketMint)
                : of(null),
          }).pipe(
            map(({ acceptedMint, ticketMint }) => ({
              ...event,
              acceptedMint,
              ticketMint,
              ticketPrice:
                event.account.acceptedMint != null
                  ? event.account.ticketPrice
                      .div(new BN(10).pow(new BN(acceptedMint!.decimals)))
                      .toNumber()
                  : 0,
              ticketsSold: event.account.ticketsSold,
              ticketsLeft:
                event.account.ticketMint != null
                  ? event.account.ticketQuantity - Number(ticketMint!.supply)
                  : 0,
              salesProgress:
                event.account.ticketMint != null
                  ? Math.floor(
                      (Number(ticketMint!.supply) * 100) /
                        event.account.ticketQuantity
                    )
                  : 0,
              totalProfit:
                event.account.acceptedMint != null
                  ? event.account.totalProfit
                      .div(new BN(10).pow(new BN(acceptedMint!.decimals)))
                      .toNumber()
                  : 0,
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
