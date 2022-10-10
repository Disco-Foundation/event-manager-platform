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
import { runTransaction } from 'firebase/firestore';
import { defer, from, map, Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  lastName: string;
  image: string | null;
  email: string | null;
  discoTokens: number;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
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
          fId: eventId,
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

  // get all the events for created by certain user
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
              fId: snapshot.id,
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
              eventId: event['eventId'],
              fId: snapshot.id,
              temporalVault: new PublicKey(event['temporalVault']),
              temporalVaultBump: event['temporalVaultBump'],
              ticketMint: new PublicKey(event['ticketMint']),
              ticketMintBump: event['ticketMintBump'],
              ticketPrice: event['ticketPrice'],
              ticketsSold: event['ticketsSold'],
              ticketQuantity: event['ticketQuantity'],
            },
          };
        },
        toFirestore: (it) => it,
      })
    );
  }

  // create new draft event
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
          eventId: null, //newEventRef.id,
          temporalVault: null,
          temporalVaultBump: null,
          publicKey: null,
        })
      )
    );
  }

  // update event ticket info
  updateEventTickets(
    eventId: string,
    changes: { ticketPrice: number; ticketQuantity: number }
  ) {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() => from(updateDoc(eventRef, changes)));
  }

  // update event dates info
  updateEventDates(
    eventId: string,
    changes: { startDate: string; endDate: string }
  ) {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() => from(updateDoc(eventRef, changes)));
  }

  // update event basic info
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

  // update publish status and event info
  setPublishedEvent(event: EventAccount) {
    event.account.published = true;
    const eventRef = doc(this._firestore, `events/${event.account.fId}`);
    return defer(() =>
      from(
        updateDoc(eventRef, {
          published: true,
          acceptedMint: event.account.acceptedMint?.toBase58(),
          authority: event.account.authority?.toBase58(),
          certifier: event.account.certifier?.toBase58(),
          eventBump: event.account.eventBump,
          eventMint: event.account.eventMint?.toBase58(),
          eventMintBump: event.account.eventMintBump,
          eventId: event.account.eventId.toNumber(),
          publicKey: event.publicKey?.toBase58(),
          temporalVault: event.account.temporalVault?.toBase58(),
          temporalVaultBump: event.account.temporalVaultBump,
          ticketMint: event.account.ticketMint?.toBase58(),
        })
      )
    );
  }

  // delete draft event
  deleteEvent(eventId: string) {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() => from(deleteDoc(eventRef)));
  }

  // update tickets sold amount
  updateSoldTickets(eventId: string, quantity: number): Observable<void> {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() =>
      from(
        runTransaction(this._firestore, async (transaction) => {
          return transaction.get(eventRef).then((res) => {
            if (!res.exists) {
              throw 'Document does not exist!';
            }

            // Compute new number of soldTickets
            var newTicketsSold = res.data()!['ticketsSold'] + quantity;

            // Commit to Firestore
            transaction.update(eventRef, {
              ticketsSold: newTicketsSold,
            });
          });
        })
      )
    );
  }

  // get event details by id
  getUser(userId: string): Observable<User> {
    const userRef = doc(this._firestore, `users/${userId}`);
    console.log(userRef);

    return docData(userRef).pipe(
      map((user) => ({
        id: userRef.id,
        name: user['name'],
        lastName: user['lastName'],
        image: user['image'],
        email: user['email'],
        discoTokens: user['discoTokens'],
      }))
    );
  }

  updateUser(
    userId: string,
    changes: {
      name: string;
      lastName: string;
      email: string;
      image: string;
    }
  ) {
    const userRef = doc(this._firestore, `users/${userId}`);
    return defer(() => from(updateDoc(userRef, changes)));
  }
}
