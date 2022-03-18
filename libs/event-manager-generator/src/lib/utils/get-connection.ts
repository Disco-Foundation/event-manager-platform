import { Connection } from '@solana/web3.js';
import { SELECTED_NETWORK } from '../core';

const connection = new Connection(SELECTED_NETWORK);

export const getConnection = () => {
  return connection;
};
