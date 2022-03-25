import { Provider, web3 } from '@project-serum/anchor';
import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { LAMPORTS_PER_EVENT_MINT } from '../core/constants';
import { getAssociatedTokenAccount } from './get-associated-token-account';
import { requestAirdrop } from './internal';

export const createUserAndAssociatedWallet = async (
  connection: Connection,
  provider: Provider,
  mint: web3.PublicKey,
  amount: number
): Promise<[web3.Keypair, web3.PublicKey | undefined]> => {
  const user = new web3.Keypair();
  const userAssociatedTokenAccount = await getAssociatedTokenAccount(
    mint,
    user.publicKey
  );

  // TEMPORAL
  const testWebPubKey = new PublicKey(
    '3cq7a3wFecykY9C9Qt5E23HEwHfGVZTzhczgg11XEdoa' // hardcore wallet to test pay 'USDC' from nodejs
  );
  const testWebAssociatedTokenAccount = await getAssociatedTokenAccount(
    mint,
    testWebPubKey
  );

  const testMobileWallet = new PublicKey(
    '2MFa1aiV69Ctk5YMyAdLA3iWnQW4eaZwUSiY2RLzEjYh' // hardcore wallet to test pay 'USDC' from kotlin
  );
  const testMobileAssociatedTokenAccount = await getAssociatedTokenAccount(
    mint,
    testMobileWallet
  );
  // END TEMPORAL

  // Request 1 SOL
  await requestAirdrop(connection, user);

  // Create a token account for the user and mint some tokens
  await provider.send(
    new web3.Transaction()
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
          amount * LAMPORTS_PER_EVENT_MINT
        )
      )
      // THIS IS TEMPORAL - ERASE LATER
      .add(
        createAssociatedTokenAccountInstruction(
          user.publicKey,
          testWebAssociatedTokenAccount,
          testWebPubKey,
          mint
        )
      )
      .add(
        createMintToInstruction(
          mint,
          testWebAssociatedTokenAccount,
          provider.wallet.publicKey,
          1000 * LAMPORTS_PER_EVENT_MINT
        )
      )
      .add(
        createAssociatedTokenAccountInstruction(
          user.publicKey,
          testMobileAssociatedTokenAccount,
          testMobileWallet,
          mint
        )
      )
      .add(
        createMintToInstruction(
          mint,
          testMobileAssociatedTokenAccount,
          provider.wallet.publicKey,
          1000 * LAMPORTS_PER_EVENT_MINT
        )
      ),
    // END TEMPORAL
    [user]
  );

  return [user, userAssociatedTokenAccount];
};
