import {
  Certifier,
  getCertifier,
} from '@event-manager/event-manager-certifiers';
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { DISCO_MINT, LAMPORTS_PER_DISCO_MINT } from '../core/constants';
import { getConnection } from '../utils';

export const doAirdropTo = async (
  amount: number,
  toWallet: string
): Promise<{ status: boolean; error?: string }> => {
  try {
    const airdroperCertifier = getCertifier(Certifier.airdroper);
    const connection = getConnection();

    const toWalletDiscoAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      airdroperCertifier,
      DISCO_MINT,
      new PublicKey(toWallet)
    );
    await mintTo(
      connection,
      airdroperCertifier,
      DISCO_MINT,
      toWalletDiscoAccount.address,
      airdroperCertifier,
      amount * LAMPORTS_PER_DISCO_MINT
    );
    return { status: true };
  } catch (e: any) {
    return { status: false, error: e.message };
  }
};
