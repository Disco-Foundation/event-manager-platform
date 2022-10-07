import { Injectable } from '@angular/core';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  EMPTY,
  from,
  map,
  switchMap,
  toArray,
} from 'rxjs';
import { EventAccount, EventApiService } from './event-api.service';

export interface EventItemByOwner extends EventAccount {
  published: boolean;
}

interface ViewModel {
  loading: boolean;
  owner: PublicKey | null;
  events: EventItemByOwner[] | null;
  tickets: EventItemByOwner[] | null;
  draftEvents: EventItemByOwner[] | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  owner: null,
  events: null,
  tickets: null,
  draftEvents: null,
  error: null,
};

@Injectable()
export class EventsByOwnerStore extends ComponentStore<ViewModel> {
  private readonly reloadSubject = new BehaviorSubject(null);

  readonly owner$ = this.select(({ owner }) => owner);
  readonly events$ = this.select(({ events }) => events);
  readonly draftEvents$ = this.select(({ draftEvents }) => draftEvents);
  readonly tickets$ = this.select(({ tickets }) => tickets);
  readonly loading$ = this.select(({ loading }) => loading);
  readonly error$ = this.select(({ error }) => error);

  constructor(
    private readonly _eventApiService: EventApiService,
    private readonly _connectionStore: ConnectionStore
  ) {
    super(initialState);

    this._loadEvents(
      combineLatest([
        // Trigger load events when connection changes
        this.select(
          this._connectionStore.connection$,
          this.owner$,
          (connection, owner) => ({ connection, owner }),
          { debounce: true }
        ),
        this.reloadSubject.asObservable(),
      ]).pipe(map(([data]) => data))
    );
  }

  readonly setOwner = this.updater<PublicKey | null>((state, owner) => ({
    ...state,
    owner,
  }));

  /*private readonly _loadEvents = this.effect<{
    connection: Connection | null;
    owner: PublicKey | null;
  }>(
    switchMap(({ connection, owner }) => {
      // If there's no connection ignore loading call
      if (connection === null || owner === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._eventApiService.findByTicketOwner(owner).pipe(
        concatMap((events) =>
          from(events).pipe(
            concatMap((event) =>
              forkJoin({
                ticketMint: getMint(connection, event.account.ticketMint),
                acceptedMint: getMint(connection, event.account.acceptedMint),
                ticketVault: PublicKey.findProgramAddress(
                  [
                    Buffer.from('ticket_vault', 'utf-8'),
                    event.account.ticketMint.toBuffer(),
                    owner.toBuffer(),
                  ],
                  EVENT_PROGRAM_ID
                ).then(([vaultAddress]) =>
                  getAccount(connection, vaultAddress)
                ),
              }).pipe(
                map(({ ticketMint, ticketVault, acceptedMint }) => ({
                  ...event,
                  acceptedMint,
                  ticketVault,
                  ticketMint,
                  ticketPrice: event.account.ticketPrice
                    .div(new BN(10).pow(new BN(acceptedMint.decimals)))
                    .toNumber(),
                  ticketsLeft:
                    event.account.ticketQuantity - Number(ticketMint.supply),
                  ticketQuantity: Number(ticketVault.amount),
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
  );*/

  private readonly _loadEvents = this.effect<{
    connection: Connection | null;
    owner: PublicKey | null;
  }>(
    switchMap(({ connection, owner }) => {
      // If there's no connection ignore loading call
      if (connection === null || owner === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._eventApiService.findEventByTicketOwner(owner).pipe(
        concatMap((events) => from(events).pipe(toArray())),
        tapResponse(
          (events) =>
            this.patchState({
              events: events.filter((event) => event.published === true),
              draftEvents: events.filter((event) => event.published === false),
              tickets: events,
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
