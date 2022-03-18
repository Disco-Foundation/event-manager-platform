import { ProgramError } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { ApiError, ApiErrorType, CreateEventError } from '../core/errors';
import { Event } from '../types';
import { getCertifier, getConnection, getEventProgram } from '../utils';
import { getUserWallet } from '../utils/internal';
import BN = require('bn.js');

export const createEvent = async (
  name: string,
  id: number,
  description: string,
  banner: string,
  location: string,
  startDate: string,
  endDate: string,
  ticketPrice: number,
  ticketQuantity: number,
  acceptedMint: string
): Promise<Event> => {
  try {
    const program = await getEventProgram();
    const connection = getConnection();
    const certifier = getCertifier();
    const userWallet = getUserWallet();

    console.log('DATA', {
      authority: userWallet.publicKey.toBase58(),
      acceptedMint: new PublicKey(acceptedMint).toBase58(),
      certifier: certifier.publicKey.toBase58(),
    });
    const EVENT_ID = new BN(id);
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
        name,
        description,
        banner,
        location,
        new BN(Date.parse(startDate) * 1000),
        new BN(Date.parse(endDate) * 1000),
        new BN(ticketPrice),
        ticketQuantity
      )
      .accounts({
        authority: userWallet.publicKey,
        acceptedMint: new PublicKey(acceptedMint),
        certifier: certifier.publicKey,
      })
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
