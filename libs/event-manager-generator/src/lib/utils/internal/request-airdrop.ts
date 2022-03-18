import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const requestAirdrop = async (
  connection: Connection,
  wallet: Keypair,
  amount = 1
) => {
  const signature = await connection.requestAirdrop(
    wallet.publicKey,
    amount * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature);
};
