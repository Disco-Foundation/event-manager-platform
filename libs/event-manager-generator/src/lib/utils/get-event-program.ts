import { Program, setProvider } from '@project-serum/anchor';
import { Connection } from '@solana/web3.js';
import { EventManager, IDL, PROGRAM_PUBKEY } from '../core';
import { getAuthorityWallet } from './internal';

export const getEventProgram = async (
  connection: Connection
): Promise<Program<EventManager>> => {
  const provider = await getAuthorityWallet(connection);
  setProvider(provider);

  const program = new Program<EventManager>(IDL, PROGRAM_PUBKEY);

  return program;
};
