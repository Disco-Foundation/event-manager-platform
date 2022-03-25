import { Keypair, PublicKey } from '@solana/web3.js';

export const EVENT_MANAGER_PROGRAM_ID = new PublicKey(
  '915QrkcaL8SVxn3DPnsNXgexddZbiXUhKtJPksEgNjRF'
);

export const ecommerce_keypair = Keypair.generate();
export const event_keypair = Keypair.generate();
