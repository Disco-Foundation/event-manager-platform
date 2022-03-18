import { Program, setProvider } from '@project-serum/anchor';
import { getConnection } from '.';
import { EventManager, IDL, PROGRAM_PUBKEY } from '../core';
import { getAuthorityWallet } from './internal';

export const getEventProgram = async (): Promise<Program<EventManager>> => {
  const connection = getConnection();
  const provider = await getAuthorityWallet(connection);
  setProvider(provider);

  const program = new Program<EventManager>(IDL, PROGRAM_PUBKEY);

  return program;
};
