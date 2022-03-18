import { PublicKey } from '@solana/web3.js';
import BN = require('bn.js');

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
