import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
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
import {
  CreateEventArguments,
  EventAccount,
  EventProgramService,
} from './event-program.service';

export interface EventItemByOwner extends EventAccount {
  published: boolean;
}

interface ViewModel {
  loading: boolean;
  owner: PublicKey | null;
  events: EventItemByOwner[] | null;
  draftEvents: EventItemByOwner[] | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  owner: null,
  events: null,
  draftEvents: null,
  error: null,
};

@Injectable()
export class EventsByOwnerStore extends ComponentStore<ViewModel> {
  private readonly reloadSubject = new BehaviorSubject(null);

  readonly owner$ = this.select(({ owner }) => owner);
  readonly events$ = this.select(({ events }) => events);
  readonly draftEvents$ = this.select(({ draftEvents }) => draftEvents);
  readonly loading$ = this.select(({ loading }) => loading);
  readonly error$ = this.select(({ error }) => error);

  constructor(private readonly _eventProgramService: EventProgramService) {
    super(initialState);

    this._loadEvents(
      combineLatest([
        // Trigger load events when connection changes
        this.select(this.owner$, (owner) => ({ owner }), { debounce: true }),
        this.reloadSubject.asObservable(),
      ]).pipe(map(([data]) => data))
    );
  }

  readonly setOwner = this.updater<PublicKey | null>((state, owner) => ({
    ...state,
    owner,
  }));

  private readonly _loadEvents = this.effect<{
    owner: PublicKey | null;
  }>(
    switchMap(({ owner }) => {
      // If there's no connection ignore loading call
      if (owner === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._eventProgramService.findUserEvents().pipe(
        concatMap((events) => from(events).pipe(toArray())),
        tapResponse(
          (events) =>
            this.patchState({
              events: events.filter((event) => event.published === true),
              draftEvents: events.filter((event) => event.published === false),
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

  publishDraft(event: EventAccount) {
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
      eventId: event.account.eventId,
    };
    return this._eventProgramService.publish(args as CreateEventArguments);
  }
}
