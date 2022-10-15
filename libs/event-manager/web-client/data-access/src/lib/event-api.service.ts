import { Inject, Injectable } from '@angular/core';
import {
  Certifier,
  getCertifier,
} from '@event-manager/event-manager-certifiers';
import { AnchorProvider, BN, Program } from '@heavy-duty/anchor';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import {
  combineLatest,
  concatMap,
  defer,
  from,
  map,
  Observable,
  throwError,
} from 'rxjs';
import { EventManager, IDL } from './event_manager';
import { FirebaseService } from './firebase/firebase.service';
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
  temporalVault: PublicKey | null;
  temporalVaultBump: number | null;
  gainVault: PublicKey | null;
  gainVaultBump: number;
  totalDeposited: BN;
  totalValueLocked: BN;
  totalValueLockedInTickets: BN;
  totalValueLockedInRecharges: BN;
  totalProfit: BN;
  totalProfitInTickets: BN;
  totalProfitInPurchases: BN;
  fId: string;
  published?: boolean;
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
  fId?: string;
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
    private readonly _firebaseService: FirebaseService,

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

  // find all the published event on the blockchain
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

  // find published event by event id
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

  // find published event by firebase id
  findByFId(eventFId: string): Observable<EventAccount | undefined> {
    return defer(() => {
      const reader = this.reader;

      if (reader === null) {
        return throwError(() => new Error('ProgramReaderMissing'));
      }

      return from(
        reader.account.event
          .all()
          .then((events) => events as EventAccount[])
          .then((events: EventAccount[]) =>
            events.find((event) => event.account.fId === eventFId)
          )
      );
    });
  }

  // get all the tickets of the connected user
  findUserTickets() {
    return defer(() => {
      const reader = this.reader;
      const provider = this.provider;

      if (reader === null) {
        return throwError(() => new Error('ProgramReaderMissing'));
      }

      if (provider === null || provider.wallet.publicKey === undefined) {
        return throwError(
          () => new Error('Please connect a wallet to see your tickets')
        );
      }

      return from(
        // get all token accounts from current wallet
        reader.provider.connection
          .getTokenAccountsByOwner(provider.wallet.publicKey, {
            programId: TOKEN_PROGRAM_ID,
          })
          // get the decoded token accounts
          .then((tokenAccounts) =>
            Promise.all(
              tokenAccounts.value.map((tokenAccount) =>
                getAccount(reader.provider.connection, tokenAccount.pubkey)
              )
            )
          )
          // Get all the mints from the current wallet
          .then((accounts) =>
            Promise.all(
              [
                ...new Set(accounts.map((account) => account.mint.toBase58())),
              ].map((mint) =>
                getMint(reader.provider.connection, new PublicKey(mint))
              )
            )
          )
          // Get each of the mint authorities
          .then((mints) =>
            Promise.all(
              [
                ...new Set(
                  mints
                    .map((mint) => mint.mintAuthority?.toBase58() ?? null)
                    .filter(
                      (mintAuthority): mintAuthority is string =>
                        mintAuthority !== null
                    )
                ),
              ].map((mintAuthority) =>
                reader.provider.connection
                  .getAccountInfo(new PublicKey(mintAuthority))
                  .then((account) => ({ pubkey: mintAuthority, account }))
              )
            )
          )
          // Filter the mint authorities by the ones owned by
          // the event manager program. These are supposed to be
          // events.
          .then(async (mintAuthorityOwners) => {
            const eventPublicKeys = [
              ...new Set(
                mintAuthorityOwners
                  .filter((mintAuthorityOwner) =>
                    mintAuthorityOwner.account?.owner.equals(EVENT_PROGRAM_ID)
                  )
                  .map(({ pubkey }) => pubkey)
              ),
            ];
            const eventAccounts = await reader.account.event.fetchMultiple(
              eventPublicKeys
            );
            return eventAccounts
              .map(
                (account, index) =>
                  ({
                    publicKey: new PublicKey(eventPublicKeys[index]),
                    account,
                  } as EventAccount)
              )
              .filter((eventAccount) => eventAccount.account !== null);
          })
      );
    });
  }

  // buy ticket
  buyTickets(args: BuyTicketsArguments) {
    return defer(() => {
      const provider = this.provider;
      const writer = this.writer;

      if (provider === null || provider.wallet.publicKey === undefined) {
        return throwError(
          () => new Error('Please connect a wallet to buy tickets')
        );
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
              event: new PublicKey(args.event),
              authority: provider.wallet.publicKey,
            })
            .rpc()
        )
      );
    });
  }

  // create new draft event
  createEvent(args: CreateEventArguments) {
    return defer(() => {
      const provider = this.provider;

      if (provider === null || provider.wallet.publicKey === undefined) {
        return throwError(
          () => new Error('Please connect a wallet to create events')
        );
      }

      return from(
        this._firebaseService.createEvent(
          provider.wallet.publicKey.toBase58(),
          false,
          args
        )
      );
    });
  }

  // get all the events created by the connected user
  findUserEvents() {
    return defer(() => {
      const provider = this.provider;

      if (provider === null || provider.wallet.publicKey === undefined) {
        return throwError(
          () => new Error('Please connect a wallet to view your events')
        );
      }

      return from(
        this._firebaseService.getUserEvents(
          provider.wallet.publicKey.toBase58()
        )
      );
    });
  }

  // publish event to the blockchain
  publish(args: CreateEventArguments): Observable<EventAccount | undefined> {
    return defer(() => {
      const writer = this.writer;
      const provider = this.provider;
      const certifierKeypair = getCertifier(Certifier.productPayer);

      if (provider === null || provider.wallet.publicKey === undefined) {
        return throwError(
          () => new Error('Please connect a wallet to publish events')
        );
      }

      if (writer === null) {
        return throwError(() => new Error('ProgramWriterMissing'));
      }

      if (args.fId === null) {
        return throwError(() => new Error('EventNotFound'));
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
            args.ticketQuantity,
            args.fId!
          )
          .accounts({
            authority: provider.wallet.publicKey,
            //acceptedMint: new PublicKey(args.acceptedMint),
            acceptedMint: new PublicKey(
              this.environment.acceptedMint.publicKey
            ), // fixed for now
            certifier: certifierKeypair.publicKey,
          })
          .signers([certifierKeypair])
          .rpc()
      ).pipe(
        concatMap(() =>
          this.findByFId(args.fId!).pipe(
            concatMap((event) =>
              this._firebaseService
                .setPublishedEvent(event!)
                .pipe(
                  concatMap(() =>
                    this._firebaseService
                      .getEvent(args.fId!)
                      .pipe(map((evnt) => evnt!))
                  )
                )
            )
          )
        )
      );
    });
  }

  // update tickets sold quantity
  updateSold(eventId: string, ticketQuantity: number) {
    return from(
      this._firebaseService.updateSoldTickets(eventId, ticketQuantity)
    );
  }
}
