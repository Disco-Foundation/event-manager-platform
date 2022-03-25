import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export interface Wearable {
  authority: PublicKey;
  pin: string;
  wearableId: BN | number;
  wearableVault: PublicKey;
  wearableBump: number;
  wearableVaultBump: number;
  publicKey?: PublicKey;
}

export interface WearableData {
  pubKey: string;
  wearableVaultPubKey: string;
  balance: number;
}
