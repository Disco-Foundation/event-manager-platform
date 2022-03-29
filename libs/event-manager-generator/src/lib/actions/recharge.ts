import { BN, ProgramError } from '@project-serum/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ApiError, ApiErrorType } from '../core';
import { LAMPORTS_PER_EVENT_MINT } from '../core/constants';
import { Event, RechargeWearableData } from '../types';
import {
  getAssociatedTokenAccount,
  getConnection,
  getEventProgram,
} from '../utils';

export const recharge = async (
  rechargeData: RechargeWearableData,
  network: string
): Promise<Transaction> => {
  try {
    const connection = getConnection(network);
    const program = await getEventProgram(connection);

    const EVENT_ID = new PublicKey(rechargeData.eventId);
    const WEARABLE_ID = new BN(rechargeData.wearableId);

    const event: Event = await program.account['event'].fetch(EVENT_ID);

    const payerAddress = new PublicKey(rechargeData.payer);
    const payerAssociatedTokenAccount = await getAssociatedTokenAccount(
      new PublicKey(event.acceptedMint),
      payerAddress
    );

    const tx = await program.methods
      .recharge(
        WEARABLE_ID,
        new BN(rechargeData.amount * LAMPORTS_PER_EVENT_MINT)
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
