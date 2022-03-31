import { BN } from '@project-serum/anchor';
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

  const eventAddress = new PublicKey(getWearableData.eventId);
  const wearableId = new BN(getWearableData.id);
  const [wearableAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('wearable', 'utf-8'),
      wearableId.toBuffer('le', 8),
      eventAddress.toBuffer(),
    ],
    program.programId
  );

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
    return false;
  }
};
