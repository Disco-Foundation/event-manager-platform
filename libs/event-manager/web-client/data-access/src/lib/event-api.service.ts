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
import { Keypair, PublicKey, TransactionSignature } from '@solana/web3.js';
import { combineLatest, defer, from, map, Observable, throwError } from 'rxjs';
import { EventManager, IDL } from './event_manager';
import { CreateEventDto, EventService } from './firebase/event.service';
import { EnvironmentConfig, ENVIRONMENT_CONFIG } from './types/environment';

export interface EventAccountInfo {
  acceptedMint: PublicKey;
  authority: PublicKey;
  banner: string;
  certifier: PublicKey;
  description: string;
  eventBump: number;
  eventEndDate: BN;
  eventId: BN;
  eventMint: PublicKey;
  eventMintBump: number;
  eventStartDate: BN;
  gainVault: PublicKey;
  gainVaultBump: number;
  location: string;
  name: string;
  temporalVault: PublicKey;
  temporalVaultBump: number;
  ticketMint: PublicKey;
  ticketMintBump: number;
  ticketPrice: BN;
  ticketsSold: number;
  ticketQuantity: number;
  totalDeposited: BN;
  totalValueLocked: BN;
  totalValueLockedInTickets: BN;
  totalValueLockedInRecharges: BN;
  totalProfit: BN;
  totalProfitInTickets: BN;
  totalProfitInPurchases: BN;
}

export interface EventAccount {
  publicKey: PublicKey;
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

  findByTicketOwner(owner: PublicKey) {
    return defer(() => {
      const reader = this.reader;

      if (reader === null) {
        return throwError(() => new Error('ProgramReaderMissing'));
      }

      return from(
        // get all token accounts from current wallet
        reader.provider.connection
          .getTokenAccountsByOwner(owner, {
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
              .map((account, index) => ({
                publicKey: new PublicKey(eventPublicKeys[index]),
                account,
              }))
              .filter(
                (eventAccount): eventAccount is EventAccount =>
                  eventAccount.account !== null
              );
          })
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

  createEvent(args: CreateEventDto) {
    return defer(() => {
      const provider = this.provider;

      if (provider === null) {
        return throwError(() => new Error('ProviderMissing'));
      }

      return from(
        this._eventService.createEvent(
          provider.wallet.publicKey.toBase58(),
          args
        )
      );
    });
  }
}
