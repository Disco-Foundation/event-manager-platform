import { web3 } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

import { generateAuthorityWallet, createMint } from './internal';
import { createUserAndAssociatedWallet } from './create-associated-token-account-to-wallet';

export const createAcceptedMintAndTestUser = async (
  connection: Connection,
  amount: number,
  mint?: PublicKey
): Promise<[web3.Keypair, web3.PublicKey | undefined, web3.PublicKey]> => {
  const provider = await generateAuthorityWallet(connection);
  let acceptedMintPublicKey: PublicKey;

  // if mint not provided, create a new one, else, return the same mint.
  if (!mint) {
    acceptedMintPublicKey = await createMint(provider);
  } else {
    acceptedMintPublicKey = mint;
  }

  const [userWallet, userWalletMintAddress] =
    await createUserAndAssociatedWallet(
      connection,
      provider,
      acceptedMintPublicKey,
      amount
    );
  return [userWallet, userWalletMintAddress, acceptedMintPublicKey];
};
