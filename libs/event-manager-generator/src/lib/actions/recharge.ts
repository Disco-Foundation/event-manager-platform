import { ProgramError } from '@project-serum/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ApiError, ApiErrorType } from '../core';
import { Event } from '../types';
import { getAssociatedTokenAccount, getEventProgram } from '../utils';
import { LAMPORTS_PER_ACCEPTED_MINT } from '../utils/internal/create-mint';
import BN = require('bn.js');

export const recharge = async (
  amountToTransfer: number,
  wearableId: number,
  eventId: string,
  payer: string
): Promise<Transaction> => {
  try {
    const program = await getEventProgram();

    const EVENT_ID = new PublicKey(eventId);
    const WEARABLE_ID = new BN(wearableId);

    const event: Event = await program.account['event'].fetch(EVENT_ID);

    const payerAddress = new PublicKey(payer);
    const payerAssociatedTokenAccount = await getAssociatedTokenAccount(
      new PublicKey(event.acceptedMint),
      payerAddress
    );

    const tx = await program.methods
      .recharge(
        WEARABLE_ID,
        new BN(amountToTransfer * LAMPORTS_PER_ACCEPTED_MINT)
      )
      .accounts({
        payer: payerAssociatedTokenAccount,
        event: EVENT_ID,
        authority: payerAddress,
      })
      .transaction();

    return tx;
  } catch (e) {
    const error = new ApiError(e as ProgramError, e as ApiErrorType);
    console.log(error);
    throw error;
  }
};
