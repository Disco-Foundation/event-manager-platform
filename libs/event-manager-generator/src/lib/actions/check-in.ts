import { BN, ProgramError } from '@project-serum/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ApiError, ApiErrorType, CreateWearableError } from '../core/errors';
import { CheckInWearableData } from '../types';
import { getConnection, getEventProgram } from '../utils';
import { hashAndStorePin } from '../utils/internal';

export const checkInEvent = async (
  checkInData: CheckInWearableData,
  network: string
): Promise<Transaction> => {
  try {
    const connection = getConnection(network);
    const program = await getEventProgram(connection);

    const EVENT_ID = new PublicKey(checkInData.eventId);
    const WEARABLE_ID = new BN(checkInData.wearableId);
    const [wearableAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('wearable', 'utf-8'),
        WEARABLE_ID.toBuffer('le', 8),
        EVENT_ID.toBuffer(),
      ],
      program.programId
    );
    const payerAddress = new PublicKey(checkInData.payer);

    // Check if the wearable already exist
    const wearableAccount = await connection.getAccountInfo(wearableAddress);
    console.log("WEARABLE ACCOUNT: ", wearableAccount);
    if (wearableAccount)
      throw new CreateWearableError('Wearable already exist');

    // if transaction is not completed, wearable is not created, so it will replace the json data with the new pin
    await hashAndStorePin(checkInData.wearableId, checkInData.wearablePin);

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
