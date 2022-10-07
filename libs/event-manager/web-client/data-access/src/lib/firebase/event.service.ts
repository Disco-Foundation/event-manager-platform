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
import {
  CreateEventArguments,
  EventAccount,
  EventItemByOwner,
} from '@event-manager-web-client/data-access';
import { PublicKey } from '@solana/web3.js';
import { defer, from, map, Observable } from 'rxjs';
import { Entity } from './types';

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
  getEvent(eventId: string): Observable<EventAccount> {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    console.log(eventRef);

    return docData(eventRef).pipe(
      map((event) => ({
        publicKey:
          event['publicKey'] != null ? new PublicKey(event['publicKey']) : null,
        account: {
          owner: new PublicKey(event['owner']),
          name: event['name'],
          description: event['description'],
          location: event['location'],
          banner: event['banner'],
          eventStartDate: event['startDate'],
          eventEndDate: event['endDate'],
          tickets: event['tickets'],
          acceptedMint:
            event['acceptedMint'] != null
              ? new PublicKey(event['acceptedMint'])
              : null,
          totalProfit: event['profit'],
          certifierFunds: event['certifierFunds'],
          published: event['published'],
          eventBump: event['eventBump'],
          eventMintBump: event['eventBump'],
          certifier:
            event['certifier'] != null
              ? new PublicKey(event['certifier'])
              : null,
          authority:
            event['authority'] != null
              ? new PublicKey(event['authority'])
              : null,
          eventMint:
            event['eventMint'] != null
              ? new PublicKey(event['eventMint'])
              : null,
          eventId: event['eventId'],
          temporalVault:
            event['temporalVault'] != null
              ? new PublicKey(event['temporalVault'])
              : null,
          temporalVaultBump: event['temporalVaultBump'],
          ticketMint:
            event['ticketMint'] != null
              ? new PublicKey(event['ticketMint'])
              : null,
          ticketMintBump: event['ticketMintBump'],
          ticketPrice: event['ticketPrice'],
          ticketsSold: event['ticketsSold'],
          ticketQuantity: event['ticketQuantity'],
        },
      }))
    );
  }

  // get all the events for certain user
  getUserEvents(owner: string): Observable<EventItemByOwner[]> {
    const eventsRef = collection(this._firestore, 'events');

    return collectionData(
      query(eventsRef, where('owner', '==', owner)).withConverter({
        fromFirestore: (snapshot) => {
          const event = snapshot.data();
          console.log(event);

          return {
            publicKey:
              event['publicKey'] != null
                ? new PublicKey(event['publicKey'])
                : null,
            account: {
              owner: new PublicKey(event['owner']),
              name: event['name'],
              description: event['description'],
              location: event['location'],
              banner: event['banner'],
              eventStartDate: event['startDate'],
              eventEndDate: event['endDate'],
              acceptedMint:
                event['acceptedMint'] != null
                  ? new PublicKey(event['acceptedMint'])
                  : null,
              totalProfit: event['profit'],
              certifierFunds: event['certifierFunds'],
              published: event['published'],
              eventBump: event['eventBump'],
              eventMintBump: event['eventBump'],
              certifier:
                event['certifier'] != null
                  ? new PublicKey(event['certifier'])
                  : null,
              authority:
                event['authority'] != null
                  ? new PublicKey(event['authority'])
                  : null,
              eventMint:
                event['eventMint'] != null
                  ? new PublicKey(event['eventMint'])
                  : null,
              eventId: snapshot.id,
              temporalVault:
                event['temporalVault'] != null
                  ? new PublicKey(event['temporalVault'])
                  : null,
              temporalVaultBump: event['temporalVaultBump'],
              ticketMint:
                event['ticketMint'] != null
                  ? new PublicKey(event['ticketMint'])
                  : null,
              ticketMintBump: event['ticketMintBump'],
              ticketPrice: event['ticketPrice'],
              ticketsSold: event['ticketsSold'],
              ticketQuantity: event['ticketQuantity'],
            },
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
            publicKey: event['publicKey'],
            account: {
              owner: new PublicKey(event['owner']),
              name: event['name'],
              description: event['description'],
              location: event['location'],
              banner: event['banner'],
              eventStartDate: event['startDate'],
              eventEndDate: event['endDate'],
              tickets: event['tickets'],
              acceptedMint: new PublicKey(event['acceptedMint']),
              totalProfit: event['profit'],
              certifierFunds: event['certifierFunds'],
              published: event['published'],
              eventBump: event['eventBump'],
              eventMintBump: event['eventBump'],
              certifier: new PublicKey(event['certifier']),
              authority: new PublicKey(event['authority']),
              eventMint: new PublicKey(event['eventMint']),
              eventId: snapshot.id,
              temporalVault: new PublicKey(event['temporalVault']),
              temporalVaultBump: event['temporalVaultBump'],
              ticketMint: new PublicKey(event['ticketMint']),
              ticketMintBump: event['ticketMintBump'],
              ticketPrice: event['ticketPrice'],
              ticketsSold: event['ticketsSold'],
              ticketQuantity: event['ticketsQuantity'],
            },
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
          published,
          ticketPrice,
          ticketQuantity,
          ticketsSold: 0,
          ticketMint: null,
          acceptedMint: null,
          profit: 0,
          eventBump: null,
          eventMintBump: null,
          certifierFunds,
          certifier: null,
          authority: null,
          eventMint: null,
          eventId: newEventRef.id,
          temporalVault: null,
          temporalVaultBump: null,
          publicKey: null,
        })
      )
    );
  }

  //------ only for unpublished events-------- //

  updateEventTickets(
    eventId: string,
    changes: { ticketPrice: number; ticketQuantity: number }
  ) {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() => from(updateDoc(eventRef, changes)));
  }

  updateEventDates(
    eventId: string,
    changes: { startDate: string; endDate: string }
  ) {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() => from(updateDoc(eventRef, changes)));
  }

  updateEventInfo(
    eventId: string,
    changes: {
      name: string;
      description: string;
      location: string;
      banner: string;
    }
  ) {
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
