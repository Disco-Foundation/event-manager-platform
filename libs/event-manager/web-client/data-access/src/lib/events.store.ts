import { Injectable } from '@angular/core';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  Account as TokenAccount,
  getAccount as getTokenAccount,
  getMint,
  Mint,
} from '@solana/spl-token';
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
  switchMap,
  toArray,
} from 'rxjs';
import { EventAccount } from './event-api.service';
import { FirebaseService } from './firebase/firebase.service';

export interface EventItem extends EventAccount {
  temporalVault: TokenAccount;
  acceptedMint: Mint;
  ticketMint: Mint;
  salesProgress: number;
  ticketsLeft: number;
  ticketsSold: number;
  ticketPrice: number;
}

interface ViewModel {
  loading: boolean;
  events: EventItem[] | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  events: null,
  error: null,
};

@Injectable()
export class EventsStore extends ComponentStore<ViewModel> {
  private readonly reloadSubject = new BehaviorSubject(null);

  readonly events$ = this.select(({ events }) => events);
  readonly loading$ = this.select(({ loading }) => loading);
  readonly error$ = this.select(({ error }) => error);

  constructor(
    private readonly _eventApiService: FirebaseService,
    private readonly _connectionStore: ConnectionStore
  ) {
    super(initialState);

    this._loadEvents(
      combineLatest([
        // Trigger load events when connection changes
        this._connectionStore.connection$,
        this.reloadSubject.asObservable(),
      ]).pipe(map(([connection]) => connection))
    );
  }

  private readonly _loadEvents = this.effect<Connection | null>(
    switchMap((connection) => {
      // If there's no connection ignore loading call
      if (connection === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._eventApiService.getPublishedEvents().pipe(
        concatMap((events) =>
          from(events).pipe(
            concatMap((event) =>
              forkJoin({
                temporalVault: defer(() =>
                  from(
                    getTokenAccount(connection, event.account.temporalVault!)
                  )
                ),
                gainVault: defer(() =>
                  from(getTokenAccount(connection, event.account.gainVault!))
                ),
                acceptedMint: defer(() =>
                  from(getMint(connection, event.account.acceptedMint!))
                ),
                ticketMint: defer(() =>
                  from(getMint(connection, event.account.ticketMint!))
                ),
              }).pipe(
                map(({ temporalVault, acceptedMint, ticketMint }) => ({
                  ...event,
                  temporalVault,
                  acceptedMint,
                  ticketMint,
                  ticketPrice: event.account.ticketPrice,
                  ticketsSold: event.account.ticketsSold!,
                  salesProgress: Math.floor(
                    (Number(ticketMint.supply) * 100) /
                      event.account.ticketQuantity
                  ),
                  ticketsLeft:
                    event.account.ticketQuantity - Number(ticketMint.supply),
                }))
              )
            ),
            toArray()
          )
        ),
        tapResponse(
          (events) =>
            this.patchState({
              events,
              loading: false,
            }),
          (error) => this.patchState({ error, loading: false })
        )
      );
    })
  );

  reload() {
    this.reloadSubject.next(null);
  }
}
