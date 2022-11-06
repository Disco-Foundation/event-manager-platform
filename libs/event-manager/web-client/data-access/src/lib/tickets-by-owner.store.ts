import { Injectable } from '@angular/core';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  Account as TokenAccount,
  getAccount,
  getMint,
  Mint,
} from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  EMPTY,
  forkJoin,
  from,
  map,
  switchMap,
  toArray,
} from 'rxjs';
import {
  EventAccount,
  EventProgramService,
  EVENT_PROGRAM_ID,
} from './event-program.service';
import { EventFirebaseService } from './firebase/event-firebase.service';

export interface TicketByOwner extends EventAccount {
  ticketVault: TokenAccount;
  acceptedMint: Mint;
  ticketMint: Mint;
  ticketsLeft: number;
  ticketQuantity: number;
  ticketPrice: number;
}

interface ViewModel {
  loading: boolean;
  owner: PublicKey | null;
  tickets: TicketByOwner[] | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  owner: null,
  tickets: null,
  error: null,
};

@Injectable()
export class TicketsByOwnerStore extends ComponentStore<ViewModel> {
  private readonly reloadSubject = new BehaviorSubject(null);

  readonly owner$ = this.select(({ owner }) => owner);
  readonly tickets$ = this.select(({ tickets }) => {
    console.log('TICKETS', tickets);
    return tickets;
  });
  readonly loading$ = this.select(({ loading }) => loading);
  readonly error$ = this.select(({ error }) => error);

  constructor(
    private readonly _eventProgramService: EventProgramService,
    private readonly _eventFirebaseService: EventFirebaseService,
    private readonly _connectionStore: ConnectionStore
  ) {
    super(initialState);

    this._loadTickets(
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

  private readonly _loadTickets = this.effect<{
    connection: Connection | null;
    owner: PublicKey | null;
  }>(
    switchMap(({ connection, owner }) => {
      // If there's no connection ignore loading call
      if (connection === null || owner === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._eventFirebaseService.getUserTickets(owner.toBase58()).pipe(
        concatMap((tickets) => {
          console.log('TICKETS:', tickets);
          return from(tickets).pipe(
            concatMap((ticket) => {
              console.log('TICKET:', ticket);
              return this._eventFirebaseService.getEvent(ticket.eventId).pipe(
                concatMap((event) => {
                  console.log('EVENT:', event);
                  return this.buildTicket(event, connection, owner);
                })
              );
            }),
            toArray()
          );
        }),
        tapResponse(
          (tickets) => {
            console.log(tickets);
            this.patchState({
              tickets: tickets,
              loading: false,
            });
          },
          (error) => {
            console.log(error);
            this.patchState({ error, loading: false });
          }
        )
      );
    })
  );

  // private readonly _loadTickets2 = this.effect<{
  //   connection: Connection | null;
  //   owner: PublicKey | null;
  // }>(
  //   switchMap(({ connection, owner }) => {
  //     // If there's no connection ignore loading call
  //     if (connection === null || owner === null) {
  //       return EMPTY;
  //     }

  //     this.patchState({ loading: true });

  //     return this._eventProgramService.findUserTickets().pipe(
  //       concatMap((events) =>
  //         from(events).pipe(
  //           concatMap((event) =>
  //             this.buildTicket(event, connection, owner)
  //           ),
  //           toArray()
  //         )
  //       ),
  //       tapResponse(
  //         (tickets) =>
  //           this.patchState({
  //             tickets: tickets,
  //             loading: false,
  //           }),
  //         (error) => this.patchState({ error, loading: false })
  //       )
  //     );
  //   })
  // );

  buildTicket(event: EventAccount, connection: Connection, owner: PublicKey) {
    return forkJoin({
      ticketMint: getMint(connection, event.account.ticketMint!),
      acceptedMint: getMint(connection, event.account.acceptedMint!),
      ticketVault: PublicKey.findProgramAddress(
        [
          Buffer.from('ticket_vault', 'utf-8'),
          event.account.ticketMint!.toBuffer(),
          owner.toBuffer(),
        ],
        EVENT_PROGRAM_ID
      ).then(([vaultAddress]) => getAccount(connection, vaultAddress)),
    }).pipe(
      map(({ ticketMint, ticketVault, acceptedMint }) => ({
        ...event,
        acceptedMint,
        ticketVault,
        ticketMint,
        ticketPrice: event.account.ticketPrice,
        /*.div(new BN(10).pow(new BN(acceptedMint.decimals)))
              .toNumber(),*/ ticketsLeft:
          event.account.ticketQuantity - Number(ticketMint.supply),
        ticketQuantity: Number(ticketVault.amount),
      }))
    );
  }

  reload() {
    this.reloadSubject.next(null);
  }
}
