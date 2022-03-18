import { getAccount } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { WearableData } from '../types';
import { getConnection, getEventProgram } from '../utils';
import { LAMPORTS_PER_ACCEPTED_MINT } from '../utils/internal';

import BN = require('bn.js');

// TESTING JSON Certifier
const test = async (data: any) => {
  console.log(data);
};
// END TESTING

export const getWearableData = async (id: number, eventId: number) => {
  await test(id);
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
        LAMPORTS_PER_ACCEPTED_MINT,
    };

    return wearableData;
  } catch (error) {
    return false;
  }
};
