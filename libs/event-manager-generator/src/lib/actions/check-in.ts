import { BN, ProgramError } from '@project-serum/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ApiError, ApiErrorType, CreateWearableError } from '../core/errors';
import { getConnection, getEventProgram } from '../utils';
import { hashAndStorePin } from '../utils/internal';

export const checkInEvent = async (
  wearablePin: string,
  wearableId: number,
  eventId: string,
  payerAddress: PublicKey
): Promise<Transaction> => {
  try {
    const program = await getEventProgram();
    const connection = getConnection();

    const EVENT_ID = new PublicKey(eventId);
    const WEARABLE_ID = new BN(wearableId);
    const [wearableAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('wearable', 'utf-8'),
        WEARABLE_ID.toBuffer('le', 8),
        EVENT_ID.toBuffer(),
      ],
      program.programId
    );

    // Check if the wearable already exist
    const wearableAccount = await connection.getAccountInfo(wearableAddress);
    if (wearableAccount)
      throw new CreateWearableError('Wearable already exist');

    // if transaction is not completed, wearable is not created, so it will replace the json data with the new pin
    await hashAndStorePin(wearableId, wearablePin);

    const tx = await program.methods
      .checkIn(WEARABLE_ID)
      .accounts({
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
