import {
  Certifier,
  getCertifier,
} from '@event-manager/event-manager-certifiers';
import { BN, ProgramError } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { ApiError, ApiErrorType } from '../core';
import { LAMPORTS_PER_EVENT_MINT } from '../core/constants';
import { PurchaseWearableData } from '../types';
import { getConnection, getEventProgram } from '../utils';
import { checkWearablePin } from '../utils/internal';

export const purchase = async (
  purchaseData: PurchaseWearableData,
  network: string
): Promise<boolean> => {
  try {
    const connection = getConnection(network);
    const program = await getEventProgram(connection);
    const certifier = getCertifier(Certifier.productPayer);
    const EVENT_ID = new PublicKey(purchaseData.eventId);
    const WEARABLE_ID = new BN(purchaseData.wearableId);

    // if transaction is not completed, wearable is not created, so it will replace the json data with the new pin
    const isValidPin = await checkWearablePin(
      purchaseData.wearableId,
      purchaseData.userPin
    );

    if (!isValidPin) throw new Error('Invalid PIN');

    await program.methods
      .purchase(
        WEARABLE_ID,
        new BN(purchaseData.amount * LAMPORTS_PER_EVENT_MINT)
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
