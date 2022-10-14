import { Injectable } from '@angular/core';
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
  throwError,
} from 'rxjs';
import {
  CreateEventArguments,
  EventAccount,
  EventApiService,
} from './event-api.service';
import { FirebaseService } from './firebase/firebase.service';

export interface EventDetailsView extends EventAccount {
  acceptedMint: Mint | null;
  ticketMint: Mint | null;
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
    private readonly _firebaseService: FirebaseService,
    private readonly _connectionStore: ConnectionStore,
    private readonly _eventApiService: EventApiService
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

      return this._firebaseService.getEvent(eventId).pipe(
        concatMap((event) => {
          if (event === undefined) {
            return throwError(() => new Error('Error loading the event'));
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
              totalValueLocked: event.account.totalValueLocked,
              totalValueLockedInTickets:
                event.account.totalValueLockedInTickets,
              totalValueLockedInRecharges:
                event.account.totalValueLockedInRecharges,
              totalDeposited: event.account.totalDeposited,
              totalProfit: event.account.totalProfit,
              totalProfitInTickets: event.account.totalProfitInTickets,
              totalProfitInPurchases: event.account.totalProfitInPurchases,
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
          (error) => {
            this.patchState({ error, loading: false });
            throwError(() => new Error(error as string));
          }
        )
      );
    })
  );

  reload() {
    this.reloadSubject.next(null);
  }

  publishEvent() {
    const event = this.get().event;

    return defer(() => {
      if (event === null) {
        return of(null);
      }

      const args = {
        name: event.account.name,
        description: event.account.description,
        location: event.account.location,
        banner: event.account.banner,
        startDate: event.account.eventStartDate,
        endDate: event.account.eventEndDate,
        ticketPrice: event.account.ticketPrice,
        ticketQuantity: event.account.ticketQuantity,
        certifierFunds: 0,
        fId: event.account.fId,
      };

      return from(this._eventApiService.publish(args as CreateEventArguments));
    });
  }

  updateEventTickets(
    eventId: string,
    args: { ticketPrice: number; ticketQuantity: number }
  ) {
    return defer(() => {
      return from(this._firebaseService.updateEventTickets(eventId, args));
    });
  }

  updateEventDates(
    eventId: string,
    args: { startDate: string; endDate: string }
  ) {
    return defer(() => {
      return from(this._firebaseService.updateEventDates(eventId, args));
    });
  }

  updateEventInfo(
    eventId: string,
    args: {
      name: string;
      description: string;
      location: string;
      banner: string;
    }
  ) {
    return defer(() => {
      return from(this._firebaseService.updateEventInfo(eventId, args));
    });
  }
}
