import { PublicKey } from '@solana/web3.js';

export const PROGRAM_PUBKEY = new PublicKey(
  '915QrkcaL8SVxn3DPnsNXgexddZbiXUhKtJPksEgNjRF'
);
export const DISCO_MINT = new PublicKey(
  'GpkezdzsMoerjxCviax6rSPN6suTpSTg9eFzaRBGwLtf'
);

export const LAMPORTS_PER_DISCO_MINT = 1_000_000;
export const LAMPORTS_PER_EVENT_MINT = LAMPORTS_PER_DISCO_MINT;
export const ACCEPTED_MINT_DECIMALS = 6;

//export const SELECTED_NETWORK = 'http://localhost:8899';
export const SELECTED_NETWORK = 'https://api.devnet.solana.com';

export const SECURE_DATA_PATH = 'libs/event-manager-generator/src/lib/data';
