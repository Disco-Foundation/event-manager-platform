import { Provider } from '@project-serum/anchor';
import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

export const createUserAndAssociatedWallet = async (
  provider: Provider,
  mint: PublicKey,
  amount: number | bigint,
  user: Keypair
): Promise<PublicKey | undefined> => {
  const userAssociatedTokenAccount = await getAssociatedTokenAddress(
    mint,
    user.publicKey
  );

  // Create a token account for the user and mint some tokens
  await provider.send(
    new Transaction()
      .add(
        createAssociatedTokenAccountInstruction(
          user.publicKey,
          userAssociatedTokenAccount,
          user.publicKey,
          mint
        )
      )
      .add(
        createMintToInstruction(
          mint,
          userAssociatedTokenAccount,
          provider.wallet.publicKey,
          amount
        )
      ),
    [user]
  );

  return userAssociatedTokenAccount;
};
