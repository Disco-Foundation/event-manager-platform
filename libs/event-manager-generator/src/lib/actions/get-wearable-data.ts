import { BN } from '@heavy-duty/anchor';
import { getAccount } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { LAMPORTS_PER_EVENT_MINT } from '../core/constants';
import { GetWearableData, WearableData } from '../types';
import { getConnection, getEventProgram } from '../utils';

export const getWearableData = async (
  getWearableData: GetWearableData,
  network: string
) => {
  const connection = getConnection(network);
  const program = await getEventProgram(connection);

  const EVENT_ID = new PublicKey(getWearableData.eventId);
  const WEARABLE_ID = new BN(getWearableData.id);
  const [wearableAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('wearable', 'utf-8'),
      WEARABLE_ID.toBuffer('le', 8),
      EVENT_ID.toBuffer(),
    ],
    program.programId
  );

  console.log('WEARABLE ADDRESS', wearableAddress.toBase58());

  // Check if the wearable already exist
  try {
    const wearableAccount = await program.account.wearable.fetch(
      wearableAddress
    );

    const wearableVaultAccount = await getAccount(
      connection,
      wearableAccount.wearableVault
    );

    const wearableData: WearableData = {
      pubKey: wearableAddress.toBase58(),
      wearableVaultPubKey: wearableAccount.wearableVault.toBase58(),
      balance:
        Number(wearableVaultAccount.amount.toString()) /
        LAMPORTS_PER_EVENT_MINT,
    };

    return wearableData;
  } catch (error) {
    console.log(error);
    return false;
  }
};
