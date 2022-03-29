import { Connection } from '@solana/web3.js';

// const connection = new Connection(SELECTED_NETWORK);

export const getConnection = (network: string) => {
  return new Connection(network);
};
