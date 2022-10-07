import { Inject, Injectable } from '@angular/core';
import {
  Certifier,
  getCertifier,
} from '@event-manager/event-manager-certifiers';
import { AnchorProvider, BN, Program } from '@heavy-duty/anchor';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { Keypair, PublicKey, TransactionSignature } from '@solana/web3.js';
import { combineLatest, defer, from, map, Observable, throwError } from 'rxjs';
import { EventManager, IDL } from './event_manager';
import { EventService } from './firebase/event.service';
import { EnvironmentConfig, ENVIRONMENT_CONFIG } from './types/environment';

export interface EventAccountInfo {
  acceptedMint: PublicKey | null;
  authority: PublicKey | null;
  banner: string;
  certifier: PublicKey | null;
  description: string;
  eventBump: number | null;
  eventEndDate: BN;
  eventId: BN;
  eventMint: PublicKey | null;
  eventMintBump: number | null;
  eventStartDate: BN;
  location: string;
  name: string;
  ticketMint: PublicKey | null;
  ticketMintBump: number | null;
  ticketPrice: BN;
  ticketsSold: number;
  ticketQuantity: number;
  totalProfit: BN;
  temporalVault: PublicKey | null;
  temporalVaultBump: number | null;
}

export interface EventAccount {
  publicKey: PublicKey | null;
  account: EventAccountInfo;
}

export interface CreateEventArguments {
  name: string;
  description: string;
  location: string;
  banner: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  ticketQuantity: number;
  certifierFunds: number;
}

export interface BuyTicketsArguments {
  event: PublicKey;
  acceptedMint: PublicKey;
  ticketQuantity: number;
}

export const EVENT_PROGRAM_ID = new PublicKey(
  '915QrkcaL8SVxn3DPnsNXgexddZbiXUhKtJPksEgNjRF'
);

@Injectable({ providedIn: 'root' })
export class EventApiService {
  reader: Program<EventManager> | null = null;
  writer: Program<EventManager> | null = null;
  provider: AnchorProvider | null = null;

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,

    //FIREBASE
    private readonly _eventService: EventService,

    @Inject(ENVIRONMENT_CONFIG) private environment: EnvironmentConfig
  ) {
    combineLatest([
      this._connectionStore.connection$,
      this._walletStore.anchorWallet$,
    ]).subscribe(([connection, anchorWallet]) => {
      if (connection === null) {
        this.reader = null;
        this.writer = null;
        this.provider = null;
      } else {
        if (anchorWallet === undefined) {
          this.provider = new AnchorProvider(
            connection,
            {} as never,
            AnchorProvider.defaultOptions()
          );
          this.reader = new Program<EventManager>(
            IDL,
            EVENT_PROGRAM_ID,
            this.provider
          );
          this.writer = null;
        } else {
          this.provider = new AnchorProvider(
            connection,
            anchorWallet,
            AnchorProvider.defaultOptions()
          );
          this.reader = new Program<EventManager>(
            IDL,
            EVENT_PROGRAM_ID,
            new AnchorProvider(
              connection,
              anchorWallet,
              AnchorProvider.defaultOptions()
            )
          );
          this.writer = new Program<EventManager>(
            IDL,
            EVENT_PROGRAM_ID,
            new AnchorProvider(
              connection,
              anchorWallet,
              AnchorProvider.defaultOptions()
            )
          );
        }
      }
    });
  }

  findAll(): Observable<EventAccount[]> {
    return defer(() => {
      const reader = this.reader;

      if (reader === null) {
        return throwError(() => new Error('ProgramReaderMissing'));
      }

      return from(reader.account.event.all()).pipe(
        map((events) => events as EventAccount[])
      );
    });
  }

  findById(eventId: string): Observable<EventAccount | null> {
    return defer(() => {
      const reader = this.reader;

      if (reader === null) {
        return throwError(() => new Error('ProgramReaderMissing'));
      }

      return from(
        reader.account.event.fetchNullable(new PublicKey(eventId))
      ).pipe(
        map((event) =>
          event
            ? ({
                publicKey: new PublicKey(eventId),
                account: event,
              } as EventAccount)
            : null
        )
      );
    });
  }

  create(
    args: CreateEventArguments
  ): Observable<{ signature: TransactionSignature; certifier: Keypair }> {
    return defer(() => {
      const writer = this.writer;
      const provider = this.provider;
      const certifierKeypair = getCertifier(Certifier.productPayer);

      if (provider === null) {
        return throwError(() => new Error('ProviderMissing'));
      }

      if (writer === null) {
        return throwError(() => new Error('ProgramWriterMissing'));
      }

      return from(
        writer.methods
          .createEvent(
            new BN(Date.now()),
            args.name,
            args.description,
            args.banner,
            args.location,
            new BN(new Date(args.startDate).getTime()),
            new BN(new Date(args.endDate).getTime()),
            new BN(args.ticketPrice),
            args.ticketQuantity
          )
          .accounts({
            authority: provider.wallet.publicKey,
            //acceptedMint: new PublicKey(args.acceptedMint),
            acceptedMint: new PublicKey(
              this.environment.acceptedMint.publicKey
            ), // fixed for now
            certifier: certifierKeypair.publicKey,
          })
          /* .preInstructions([
            SystemProgram.transfer({
              fromPubkey: provider.wallet.publicKey,
              toPubkey: certifierKeypair.publicKey,
              lamports: args.certifierFunds * LAMPORTS_PER_SOL,
            }),
          ]) */
          .signers([certifierKeypair])
          .rpc()
      ).pipe(
        map((signature) => ({
          signature,
          certifier: certifierKeypair,
        }))
      );
    });
  }

  buyTickets(args: BuyTicketsArguments): Observable<TransactionSignature> {
    return defer(() => {
      const provider = this.provider;
      const writer = this.writer;

      if (provider === null) {
        return throwError(() => new Error('ProviderMissing'));
      }

      if (writer === null) {
        return throwError(() => new Error('ProgramWriterMissing'));
      }

      return from(
        getAssociatedTokenAddress(
          args.acceptedMint,
          provider.wallet.publicKey
        ).then((payer) =>
          writer.methods
            .buyTickets(args.ticketQuantity)
            .accounts({
              payer,
              event: args.event,
              authority: provider.wallet.publicKey,
            })
            .rpc()
        )
      );
    });
  }

  createEvent(args: CreateEventArguments) {
    return defer(() => {
      const provider = this.provider;

      if (provider === null) {
        return throwError(() => new Error('ProviderMissing'));
      }

      return from(
        this._eventService.createEvent(
          provider.wallet.publicKey.toBase58(),
          false,
          args
        )
      );
    });
  }

  findEventByTicketOwner(owner: PublicKey) {
    return defer(() => {
      const provider = this.provider;

      if (provider === null) {
        return throwError(() => new Error('ProviderMissing'));
      }

      return from(
        this._eventService.getUserEvents(provider.wallet.publicKey.toBase58())
      );
    });
  }

  findAllEvents() {
    return defer(() => {
      const provider = this.provider;

      if (provider === null) {
        return throwError(() => new Error('ProviderMissing'));
      }

      return from(this._eventService.getPublishedEvents());
    });
  }

  publishEvent(event: EventAccount) {
    return this.create({
      name: event.account.name,
      description: event.account.description,
      location: event.account.location,
      banner: event.account.banner,
      startDate: event.account.eventStartDate.toString(),
      endDate: event.account.eventEndDate.toString(),
      ticketPrice: event.account.ticketPrice,
      ticketQuantity: event.account.ticketQuantity,
      certifierFunds: 0,
    }).subscribe(() => {
      console.log('ENTRAAA');
      this._eventService.setPublishedEvent(event.account.eventId);
    });
  }

  findEventById(eventId: string): Observable<EventAccount | null> {
    return defer(() => {
      const provider = this.provider;

      if (provider === null) {
        return throwError(() => new Error('ProviderMissing'));
      }
      return from(this._eventService.getEvent(eventId));
    });
  }

  updateEventTickets(
    eventId: string,
    args: { ticketPrice: number; ticketQuantity: number }
  ) {
    return defer(() => {
      const provider = this.provider;

      if (provider === null) {
        return throwError(() => new Error('ProviderMissing'));
      }

      return from(this._eventService.updateEventTickets(eventId, args));
    });
  }

  updateEventDates(
    eventId: string,
    args: { startDate: string; endDate: string }
  ) {
    return defer(() => {
      const provider = this.provider;

      if (provider === null) {
        return throwError(() => new Error('ProviderMissing'));
      }

      return from(this._eventService.updateEventDates(eventId, args));
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
      const provider = this.provider;

      if (provider === null) {
        return throwError(() => new Error('ProviderMissing'));
      }

      return from(this._eventService.updateEventInfo(eventId, args));
    });
  }
}
