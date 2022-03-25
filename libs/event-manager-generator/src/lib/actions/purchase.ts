import {
  Certifier,
  getCertifier,
} from '@event-manager/event-manager-certifiers';
import { BN, ProgramError } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { ApiError, ApiErrorType } from '../core';
import { LAMPORTS_PER_EVENT_MINT } from '../core/constants';
import { getEventProgram } from '../utils';
import { checkWearablePin } from '../utils/internal';

export const purchase = async (
  userPin: string,
  amountToCharge: number,
  wearableId: number,
  eventId: string
): Promise<boolean> => {
  try {
    const program = await getEventProgram();
    const certifier = getCertifier(Certifier.productPayer);
    const EVENT_ID = new PublicKey(eventId);
    const WEARABLE_ID = new BN(wearableId);

    // if transaction is not completed, wearable is not created, so it will replace the json data with the new pin
    const isValidPin = await checkWearablePin(wearableId, userPin);

    if (!isValidPin) throw new Error('Invalid PIN');

    await program.methods
      .purchase(WEARABLE_ID, new BN(amountToCharge * LAMPORTS_PER_EVENT_MINT))
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
