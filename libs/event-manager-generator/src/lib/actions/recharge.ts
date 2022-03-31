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

    const eventAddress = new PublicKey(rechargeData.eventId);
    const wearableId = new BN(rechargeData.wearableId);

    const event: Event = await program.account['event'].fetch(eventAddress);

    const payerAddress = new PublicKey(rechargeData.payer);
    const payerAssociatedTokenAccount = await getAssociatedTokenAccount(
      new PublicKey(event.acceptedMint),
      payerAddress
    );

    const tx = await program.methods
      .recharge(
        wearableId,
        new BN(rechargeData.amount * LAMPORTS_PER_EVENT_MINT)
      )
      .accounts({
        payer: payerAssociatedTokenAccount,
        event: eventAddress,
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
