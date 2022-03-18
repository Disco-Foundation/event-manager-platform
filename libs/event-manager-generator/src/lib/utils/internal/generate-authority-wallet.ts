import * as anchor from '@project-serum/anchor';
import { Connection, Keypair } from '@solana/web3.js';
import { requestAirdrop } from './request-airdrop';

// Refact: read from file
const SECRET_KEY = new Uint8Array([
  20, 11, 198, 199, 185, 171, 184, 92, 31, 189, 160, 13, 131, 14, 83, 158, 218,
  176, 161, 41, 208, 67, 79, 175, 135, 71, 77, 254, 228, 99, 12, 14, 38, 229,
  26, 161, 41, 83, 131, 163, 105, 55, 109, 251, 57, 223, 240, 251, 117, 98, 212,
  235, 4, 138, 232, 143, 77, 47, 17, 39, 225, 116, 6, 5,
]); // 3cq7a3wFecykY9C9Qt5E23HEwHfGVZTzhczgg11XEdoa
const authority = Keypair.fromSecretKey(SECRET_KEY);

export const getAuthorityWallet = async (connection: Connection) => {
  const provider = new anchor.Provider(
    connection,
    new anchor.Wallet(authority),
    {}
  );
  return provider;
};

export const generateAuthorityWallet = async (connection: Connection) => {
  const provider = getAuthorityWallet(connection);
  await requestAirdrop(connection, authority);

  return provider;
};

export const getUserWallet = () => {
  return Keypair.fromSecretKey(SECRET_KEY);
};
