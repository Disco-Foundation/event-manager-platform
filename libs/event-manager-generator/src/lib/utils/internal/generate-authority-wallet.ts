import {
  Certifier,
  getCertifier,
} from '@event-manager/event-manager-certifiers';
import { Provider, Wallet } from '@project-serum/anchor';
import { Connection } from '@solana/web3.js';
import { requestAirdrop } from './request-airdrop';

const authority = getCertifier(Certifier.testerUser);

export const getAuthorityWallet = async (connection: Connection) => {
  const provider = new Provider(connection, new Wallet(authority), {});
  return provider;
};

export const generateAuthorityWallet = async (connection: Connection) => {
  const provider = getAuthorityWallet(connection);
  await requestAirdrop(connection, authority);

  return provider;
};

export const getUserWallet = () => {
  return authority;
};
