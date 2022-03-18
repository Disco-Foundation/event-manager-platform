import { Keypair } from '@solana/web3.js';

// Refact: read from file
const secretKey = new Uint8Array([
  60, 102, 88, 60, 29, 185, 28, 117, 255, 27, 18, 14, 64, 145, 15, 41, 19, 145,
  79, 242, 64, 31, 3, 88, 227, 253, 39, 59, 98, 3, 80, 7, 220, 189, 7, 78, 28,
  156, 115, 140, 23, 66, 0, 36, 128, 159, 16, 129, 178, 22, 78, 24, 171, 103, 4,
  125, 110, 11, 89, 202, 129, 32, 148, 22,
]);

export const getCertifier = () => {
  return Keypair.fromSecretKey(secretKey);
};
