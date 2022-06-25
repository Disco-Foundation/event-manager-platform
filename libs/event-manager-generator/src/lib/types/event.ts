import { BN } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';

export interface Event {
  authority: PublicKey;
  certifier: PublicKey;
  name: string;
  description: string;
  banner: string;
  location: string;
  eventStartDate: string;
  eventEndDate: string;
  ticketQuantity: number;
  ticketPrice: string;
  acceptedMint: PublicKey;
  eventMint: PublicKey;
  ticketMint: PublicKey;
  gainVault: PublicKey;
  temporalVault: PublicKey;
  eventId: BN | number;
  eventBump: number;
  eventMintBump: number;
  ticketMintBump: number;
  temporalVaultBump: number;
  gainVaultBump: number;
  publicKey?: PublicKey;
}

export interface CreateEventData {
  name: string;
  id: number;
  description: string;
  banner: string;
  location: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  ticketQuantity: number;
  acceptedMint: string;
}
