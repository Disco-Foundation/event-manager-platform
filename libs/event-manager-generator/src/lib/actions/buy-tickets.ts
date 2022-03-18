import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Event } from '../types';
import { getConnection, getEventProgram } from '../utils';
import { getUserWallet } from '../utils/internal';

export const buyTickets = async (
  ticketsAmount: number,
  eventId: string
): Promise<number> => {
  try {
    const program = await getEventProgram();
    const connection = await getConnection();
    const userWallet = getUserWallet();
    const eventAddress = new PublicKey(eventId);

    const event: Event = await program.account['event'].fetch(eventAddress);
    const userAssociatedTokenAccount = await getAssociatedTokenAddress(
      event.acceptedMint,
      userWallet.publicKey
    );

    const [ticketMintAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('ticket_mint', 'utf-8'), eventAddress.toBuffer()],
      program.programId
    );

    const [userTicketVaultAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('ticket_vault', 'utf-8'),
        ticketMintAddress.toBuffer(),
        userWallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    const userVaultAssociatedTokenAccount = await getAssociatedTokenAddress(
      ticketMintAddress,
      userWallet.publicKey
    );

    console.log(
      'TICKET MINT',
      ticketMintAddress.toBase58(),
      userWallet.publicKey.toBase58(),
      eventAddress.toBase58()
    );

    const tx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        userWallet.publicKey,
        userVaultAssociatedTokenAccount,
        userWallet.publicKey,
        ticketMintAddress
      )
    );
    //await sendAndConfirmTransaction(connection, tx, [userWallet]);

    console.log(
      'USER VAULT',
      userTicketVaultAddress.toBase58(),
      userVaultAssociatedTokenAccount.toBase58()
    );

    await program.methods
      .buyTickets(ticketsAmount)
      .accounts({
        event: eventAddress,
        payer: userAssociatedTokenAccount,
        authority: userWallet.publicKey,
      })
      .signers([userWallet])
      .rpc();

    if (!(await getAccount(connection, userTicketVaultAddress))) {
      console.log('should create account...');
    }

    const userTicketVaultAccount = await getAccount(
      connection,
      userTicketVaultAddress
    );

    return Number(userTicketVaultAccount.amount);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
