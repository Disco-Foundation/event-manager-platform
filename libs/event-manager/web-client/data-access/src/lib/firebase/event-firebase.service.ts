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
import { PublicKey } from '@solana/web3.js';
import { addDoc, runTransaction } from 'firebase/firestore';
import { defer, from, map, Observable, throwError } from 'rxjs';
import {
  CreateEventArguments,
  EventAccount,
  EventItemByOwner,
  LoginStore,
} from './../../';

export interface User {
  id: string;
  name: string;
  lastName: string;
  image: string | null;
  email: string | null;
  discoTokens: number;
}

export interface Ticket {
  eventId: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class EventFirebaseService {
  private readonly _firestore = inject(Firestore);
  private _loggedIn = false;

  constructor(private readonly _loginStore: LoginStore) {
    this._loginStore.connected$.subscribe((connected) => {
      this._loggedIn = connected;
    });
  }

  // get event details by id
  getEvent(eventId: string): Observable<EventAccount> {
    const eventRef = doc(this._firestore, `events/${eventId}`);

    return docData(eventRef).pipe(
      map((event) => ({
        publicKey: this.buildPublicKey(event['publicKey']),
        account: {
          owner: this.buildPublicKey(event['owner']),
          name: event['name'],
          description: event['description'],
          location: event['location'],
          banner: event['banner'],
          eventStartDate: Date.parse(event['startDate']),
          eventEndDate: Date.parse(event['endDate']),
          tickets: event['tickets'],
          acceptedMint: this.buildPublicKey(event['acceptedMint']),
          totalProfit: event['totalProfit'],
          certifierFunds: event['certifierFunds'],
          published: event['published'],
          eventBump: event['eventBump'],
          eventMintBump: event['eventBump'],
          certifier: this.buildPublicKey(event['certifier']),
          authority: this.buildPublicKey(event['authority']),
          eventMint: this.buildPublicKey(event['eventMint']),
          eventId: eventId,
          temporalVault: this.buildPublicKey(event['temporalVault']),
          temporalVaultBump: event['temporalVaultBump'],
          ticketMint: this.buildPublicKey(event['ticketMint']),
          ticketMintBump: event['ticketMintBump'],
          ticketPrice: event['ticketPrice'],
          ticketsSold: event['ticketsSold'],
          ticketQuantity: event['ticketQuantity'],
          gainVault: this.buildPublicKey(event['gainVault']),
          gainVaultBump: event['gainVaultBump'],
          totalDeposited: event['totalDeposited'],
          totalValueLocked: event['totalValueLocked'],
          totalValueLockedInTickets: event['totalValueLockedInTickets'],
          totalValueLockedInRecharges: event['totalValueLockedInRecharges'],
          totalProfitInTickets: event['totalProfitInTickets'],
          totalProfitInPurchases: event['totalProfitInPurchases'],
        },
      }))
    );
  }

  // get all the events for created by certain user
  getUserEvents(owner: string): Observable<EventItemByOwner[]> {
    if (!this._loggedIn) {
      return throwError(() => new Error('No wallet connected'));
    }
    const eventsRef = collection(this._firestore, 'events');

    return collectionData(
      query(eventsRef, where('owner', '==', owner)).withConverter({
        fromFirestore: (snapshot) => {
          const event = snapshot.data();

          return {
            publicKey: this.buildPublicKey(event['publicKey']),
            account: {
              owner: this.buildPublicKey(event['owner']),
              name: event['name'],
              description: event['description'],
              location: event['location'],
              banner: event['banner'],
              eventStartDate: Date.parse(event['startDate']),
              eventEndDate: Date.parse(event['endDate']),
              acceptedMint: this.buildPublicKey(event['acceptedMint']),
              totalProfit: event['totalProfit'],
              certifierFunds: event['certifierFunds'],
              published: event['published'],
              eventBump: event['eventBump'],
              eventMintBump: event['eventBump'],
              certifier: this.buildPublicKey(event['certifier']),
              authority: this.buildPublicKey(event['authority']),
              eventMint: this.buildPublicKey(event['eventMint']),
              eventId: snapshot.id,
              temporalVault: this.buildPublicKey(event['temporalVault']),
              temporalVaultBump: event['temporalVaultBump'],
              ticketMint: this.buildPublicKey(event['ticketMint']),
              ticketMintBump: event['ticketMintBump'],
              ticketPrice: event['ticketPrice'],
              ticketsSold: event['ticketsSold'],
              ticketQuantity: event['ticketQuantity'],
              gainVault: this.buildPublicKey(event['gainVault']),
              gainVaultBump: event['gainVaultBump'],
              totalDeposited: event['totalDeposited'],
              totalValueLocked: event['totalValueLocked'],
              totalValueLockedInTickets: event['totalValueLockedInTickets'],
              totalValueLockedInRecharges: event['totalValueLockedInRecharges'],
              totalProfitInTickets: event['totalProfitInTickets'],
              totalProfitInPurchases: event['totalProfitInPurchases'],
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
              owner: this.buildPublicKey(event['owner']),
              name: event['name'],
              description: event['description'],
              location: event['location'],
              banner: event['banner'],
              eventStartDate: event['startDate'],
              eventEndDate: event['endDate'],
              tickets: event['tickets'],
              acceptedMint: this.buildPublicKey(event['acceptedMint']),
              totalProfit: event['totalProfit'],
              certifierFunds: event['certifierFunds'],
              published: event['published'],
              eventBump: event['eventBump'],
              eventMintBump: event['eventBump'],
              certifier: this.buildPublicKey(event['certifier']),
              authority: this.buildPublicKey(event['authority']),
              eventMint: this.buildPublicKey(event['eventMint']),
              eventId: snapshot.id,
              temporalVault: this.buildPublicKey(event['temporalVault']),
              temporalVaultBump: event['temporalVaultBump'],
              ticketMint: this.buildPublicKey(event['ticketMint']),
              ticketMintBump: event['ticketMintBump'],
              ticketPrice: event['ticketPrice'],
              ticketsSold: event['ticketsSold'],
              ticketQuantity: event['ticketQuantity'],
              gainVault: this.buildPublicKey(event['gainVault']),
              gainVaultBump: event['gainVaultBump'],
              totalDeposited: event['totalDeposited'],
              totalValueLocked: event['totalValueLocked'],
              totalValueLockedInTickets: event['totalValueLockedInTickets'],
              totalValueLockedInRecharges: event['totalValueLockedInRecharges'],
              totalProfitInTickets: event['totalProfitInTickets'],
              totalProfitInPurchases: event['totalProfitInPurchases'],
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

    if (!this._loggedIn) {
      return throwError(() => new Error('No wallet connected'));
    }

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
          totaProfit: 0,
          eventBump: null,
          eventMintBump: null,
          certifierFunds,
          certifier: null,
          authority: null,
          eventMint: null,
          temporalVault: null,
          temporalVaultBump: null,
          publicKey: null,
          gainVault: null,
          gainVaultBump: null,
          totalDeposited: 0,
          totalValueLocked: 0,
          totalValueLockedInTickets: 0,
          totalValueLockedInRecharges: 0,
          totalProfitInTickets: 0,
          totalProfitInPurchases: 0,
        }).catch((error) => {
          return throwError(() => new Error(error));
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
    return defer(() =>
      from(
        updateDoc(eventRef, changes).catch((error) => {
          throwError(() => new Error(error));
        })
      )
    );
  }

  // update event dates info
  updateEventDates(
    eventId: string,
    changes: { startDate: string; endDate: string }
  ) {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() =>
      from(
        updateDoc(eventRef, changes).catch((error) => {
          throwError(() => new Error(error));
        })
      )
    );
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
    return defer(() =>
      from(
        updateDoc(eventRef, changes).catch((error) => {
          throwError(() => new Error(error));
        })
      )
    );
  }

  // update publish status and event info
  setPublishedEvent(event: EventAccount) {
    event.account.published = true;
    const eventRef = doc(this._firestore, `events/${event.account.eventId}`);
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
          publicKey: event.publicKey?.toBase58(),
          temporalVault: event.account.temporalVault?.toBase58(),
          temporalVaultBump: event.account.temporalVaultBump,
          ticketMint: event.account.ticketMint?.toBase58(),
          gainVault: event.account.gainVault?.toBase58(),
          gainVaultBump: event.account.gainVaultBump,
          totalDeposited: event.account.totalDeposited.toNumber(),
          totalValueLocked: event.account.totalValueLocked.toNumber(),
          totalValueLockedInTickets:
            event.account.totalValueLockedInTickets.toNumber(),
          totalValueLockedInRecharges:
            event.account.totalValueLockedInRecharges.toNumber(),
          totalProfit: event.account.totalProfit.toNumber(),
          totalProfitInTickets: event.account.totalProfitInTickets.toNumber(),
          totalProfitInPurchases:
            event.account.totalProfitInPurchases.toNumber(9),
        }).catch((error) => {
          throwError(() => new Error(error));
        })
      )
    );
  }

  // delete draft event
  deleteEvent(eventId: string) {
    const eventRef = doc(this._firestore, `events/${eventId}`);
    return defer(() =>
      from(
        deleteDoc(eventRef).catch((error) => {
          throwError(() => new Error(error));
        })
      )
    );
  }

  // update tickets sold amount
  updateSoldTickets(eventId: string, quantity: number) {
    const eventRef = doc(this._firestore, `events/${eventId}`);

    runTransaction(this._firestore, async (transaction) => {
      return transaction
        .get(eventRef)
        .then((res) => {
          if (!res.exists) {
            throwError(() => new Error('Event does not exist'));
            return;
          }

          const data = res.data();
          if (data === undefined) {
            throwError(() => new Error('Event does not exist'));
            return;
          }
          // Compute new number of soldTickets
          const newTicketsSold = data['ticketsSold'] + quantity;
          const newValueLockedInTickets =
            data['totalValueLockedInTickets'] + data['ticketPrice'] * quantity;
          const newValueLocked =
            data['totalValueLocked'] + newValueLockedInTickets;
          const newValueDeposited =
            data['totalValueDeposited'] + newValueLockedInTickets;

          // Commit to Firestore
          transaction.update(eventRef, {
            ticketsSold: newTicketsSold,
            totalValueLockedInTickets: newValueLockedInTickets,
            totalValueLocked: newValueLocked,
            totalValueDeposited: newValueDeposited,
          });
        })
        .catch((error) => {
          throwError(() => new Error(error));
        });
    });
  }

  // get event details by id
  getUser(userId: string): Observable<User | undefined> {
    if (!this._loggedIn) {
      return throwError(() => new Error('Please connect a wallet'));
    }

    const userRef = doc(this._firestore, `users/${userId}`);
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

  getUserTickets(userId: string): Observable<Ticket[]> {
    const ticketsRef = collection(this._firestore, `users/${userId}/tickets`);

    return collectionData(
      ticketsRef.withConverter({
        fromFirestore: (snapshot) => {
          const ticket = snapshot.data();

          return {
            eventId: ticket['eventId'],
            quantity: ticket['quantity'],
          } as Ticket;
        },
        toFirestore: (it) => it,
      })
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
    return defer(() =>
      from(
        updateDoc(userRef, changes).catch((error) => {
          throwError(() => new Error(error));
        })
      )
    );
  }

  async addUserTickets(userId: string, eventId: string, quantity: number) {
    const ticketsRef = collection(this._firestore, `users/${userId}/tickets`);

    return await addDoc(ticketsRef, {
      eventId,
      quantity,
    })
      .catch((error) => {
        return throwError(() => new Error(error));
      })
      .then(() => {
        this.updateSoldTickets(eventId, quantity);
      });
  }

  buildPublicKey(value: string | null) {
    if (value === null) {
      return null;
    }
    return new PublicKey(value);
  }
}
