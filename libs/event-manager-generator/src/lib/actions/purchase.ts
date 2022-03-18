import { ProgramError } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { ApiError, ApiErrorType } from '../core';
import { getCertifier, getEventProgram } from '../utils';
import { LAMPORTS_PER_ACCEPTED_MINT } from '../utils/internal';
import { checkWearablePin } from '../utils/internal/check-wearable-pin';
import BN = require('bn.js');

export const purchase = async (
  userPin: string,
  amountToCharge: number,
  wearableId: number,
  eventId: string
): Promise<boolean> => {
  try {
    const program = await getEventProgram();
    const certifier = getCertifier();
    const EVENT_ID = new PublicKey(eventId);
    const WEARABLE_ID = new BN(wearableId);

    // if transaction is not completed, wearable is not created, so it will replace the json data with the new pin
    const isValidPin = await checkWearablePin(wearableId, userPin);

    if (!isValidPin) throw new Error('Invalid PIN');

    await program.methods
      .purchase(
        WEARABLE_ID,
        new BN(amountToCharge * LAMPORTS_PER_ACCEPTED_MINT)
      )
      .accounts({
        event: EVENT_ID,
        certifier: certifier.publicKey,
      })
      .signers([certifier])
      .rpc();

    return true;
  } catch (e) {
    console.log(e);
    const error = new ApiError(e as ProgramError, e as ApiErrorType);

    throw error;
  }
};
