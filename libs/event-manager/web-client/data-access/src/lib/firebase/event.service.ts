import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { CreateEventArguments } from '@event-manager-web-client/data-access';
import { defer, from, map, Observable } from 'rxjs';
import { Entity, EventDto } from './types';

export type CreateEventDto = Entity<{
  name: string;
  description: string;
  location: string;
  banner: string;
  startDate: Date;
  endDate: Date;
  published: boolean;
}>;

export type UpdateEventDto = Partial<{
  name: string;
}>;

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly _firestore = inject(Firestore);

  // get event details by id
  getEvent(eventId: string): Observable<EventDto> {
    const eventRef = doc(this._firestore, `events/${eventId}`);

    return docData(eventRef).pipe(
      map((event) => ({
        id: eventId,
        owner: event['owner'],
        name: event['name'],
        description: event['description'],
        location: event['location'],
        banner: event['banner'],
        startDate: event['startDate'],
        endDate: event['endDate'],
        tickets: event['tickets'].map((ticket: { [x: string]: any }) => {
          ticket['ticketPrice'],
            ticket['ticketQuantity'],
            ticket['ticketsSold'],
            ticket['ticketsMint'];
        }),
        treasury: event['treasury'],
        certifierFunds: event['certifierFunds'],
        published: event['publisehd'],
      }))
    );
  }

  // get all the events for certain user
  getUserEvents(owner: string): Observable<EventDto[]> {
    const eventsRef = collection(this._firestore, 'events');

    return collectionData(
      query(eventsRef, where('owner', '==', owner)).withConverter({
        fromFirestore: (snapshot) => {
          const event = snapshot.data();

          return {
            id: snapshot.id,
            owner: event['owner'],
            name: event['name'],
            description: event['description'],
            location: event['location'],
            banner: event['banner'],
            startDate: event['startDate'],
            endDate: event['endDate'],
            tickets: event['tickets'],
            treasury: event['treasury'],
            certifierFunds: event['certifierFunds'],
            published: event['published'],
          };
        },
        toFirestore: (it) => it,
      })
    );
  }

  // get all the published (on blockchain) events
  getPublishedEvents() {
    const eventsRef = collection(this._firestore, 'events');

    return collectionData(
      query(eventsRef, where('published', '==', true)).withConverter({
        fromFirestore: (snapshot) => {
          const event = snapshot.data();

          return {
            id: snapshot.id,
            owner: event['owner'],
            name: event['name'],
            description: event['description'],
            location: event['location'],
            banner: event['banner'],
            startDate: event['startDate'],
            endDate: event['endDate'],
            tickets: event['tickets'],
            treasury: {
              acceptedMint: '',
              valueLocked: 0,
              valueDeposited: 0,
              profit: 0,
            },
            certifierFunds: event['certifierFunds'],
            published: event['published'],
          };
        },
        toFirestore: (it) => it,
      })
    );
  }

  createEvent(
    owner: string,
    published = false,
    {
      name,
      description,
      location,
      banner,
      startDate,
      endDate,
      ticketPrice,
      ticketQuantity,
      certifierFunds = 0,
    }: CreateEventArguments
  ) {
    // new event with auto-generated id
    const newEventRef = doc(collection(this._firestore, 'events'));

    return defer(() =>
      from(
        setDoc(newEventRef, {
          owner,
          name,
          description,
          location,
          banner,
          startDate,
          endDate,
          tickets: [
            { ticketPrice, ticketQuantity, ticketsSold: 0, ticketMint: null },
          ],
          treasury: {
            acceptedMint: null,
            valueLocked: 0,
            valueDeposited: 0,
            profit: 0,
          },
          certifierFunds,
          published,
        })
      )
    );
  }

  //------ only for unpublished events-------- //

  updateEvent(eventId: string, changes: UpdateEventDto) {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() => from(updateDoc(eventRef, changes)));
  }

  setPublishedEvent(eventId: string) {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() => from(updateDoc(eventRef, { published: true })));
  }

  deleteEvent(eventId: string) {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() => from(deleteDoc(eventRef)));
  }
}
