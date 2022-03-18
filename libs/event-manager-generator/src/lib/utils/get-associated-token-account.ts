import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

export const getAssociatedTokenAccount = async (
  mint: PublicKey,
  wallet: PublicKey
): Promise<PublicKey> => {
  const walletAssociatedTokenAccount = await getAssociatedTokenAddress(
    mint,
    wallet
  );

  return walletAssociatedTokenAccount;
};
