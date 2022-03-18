import { Keypair, PublicKey } from '@solana/web3.js';

export const EVENT_MANAGER_PROGRAM_ID = new PublicKey(
  'FYMHu78S37EpfuBFcQ6XyCqaQLhtTqkVxZbuKm8CY6A6'
);

export const ecommerce_keypair = Keypair.generate();
export const event_keypair = Keypair.generate();
