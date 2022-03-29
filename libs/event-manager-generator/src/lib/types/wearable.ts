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

export interface CheckInWearableData {
  wearablePin: string;
  wearableId: number;
  eventId: string;
  payer: string;
}

export interface WearableData {
  pubKey: string;
  wearableVaultPubKey: string;
  balance: number;
}

export interface GetWearableData {
  id: number;
  eventId: number;
}
