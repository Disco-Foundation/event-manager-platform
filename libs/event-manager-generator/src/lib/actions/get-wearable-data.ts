import { BN } from '@project-serum/anchor';
import { getAccount } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { LAMPORTS_PER_EVENT_MINT } from '../core/constants';
import { WearableData } from '../types';
import { getConnection, getEventProgram } from '../utils';

export const getWearableData = async (id: number, eventId: number) => {
  const program = await getEventProgram();
  const connection = await getConnection();

  const EVENT_ID = new PublicKey(eventId);
  const WEARABLE_ID = new BN(id);
  const [wearableAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('wearable', 'utf-8'),
      WEARABLE_ID.toBuffer('le', 8),
      EVENT_ID.toBuffer(),
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
