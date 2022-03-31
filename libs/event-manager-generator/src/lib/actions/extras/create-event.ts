import {
  Certifier,
  getCertifier,
} from '@event-manager/event-manager-certifiers';
import { BN, ProgramError } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { ApiError, ApiErrorType, CreateEventError } from '../../core/errors';
import { CreateEventData, Event } from '../../types';
import { getConnection, getEventProgram } from '../../utils';
import { getUserWallet } from '../../utils/internal';

export const createEvent = async (
  eventData: CreateEventData,
  network: string
): Promise<Event> => {
  try {
    const connection = getConnection(network);
    const program = await getEventProgram(connection);
    const certifier = getCertifier(Certifier.productPayer);
    const userWallet = getUserWallet();

    console.log('DATA', {
      authority: userWallet.publicKey.toBase58(),
      acceptedMint: new PublicKey(eventData.acceptedMint).toBase58(),
      certifier: certifier.publicKey.toBase58(),
    });
    const EVENT_ID = new BN(eventData.id);
    const [eventAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('event', 'utf-8'),
        EVENT_ID.toBuffer('le', 8),
        userWallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Check if the event already exist
    const eventAccount = await connection.getAccountInfo(eventAddress);
    if (eventAccount) throw new CreateEventError('Event already created');

    await program.methods
      .createEvent(
        EVENT_ID,
        eventData.name,
        eventData.description,
        eventData.banner,
        eventData.location,
        new BN(Date.parse(eventData.startDate) * 1000),
        new BN(Date.parse(eventData.endDate) * 1000),
        new BN(eventData.ticketPrice),
        eventData.ticketQuantity
      )
      // .accounts({
      //   authority: userWallet.publicKey,
      //   acceptedMint: new PublicKey(eventData.acceptedMint),
      //   certifier: certifier.publicKey,
      // })
      .signers([userWallet, certifier])
      .rpc();

    const event: Event = await program.account['event'].fetch(eventAddress);
    event.eventId = (event.eventId as BN).toNumber();
    event.publicKey = eventAddress;

    return event;
  } catch (e) {
    const error = new ApiError(e as ProgramError, e as ApiErrorType);
    console.log(error);
    throw error.message;
  }
};
