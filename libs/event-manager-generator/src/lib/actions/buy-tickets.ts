import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';
import { BuyTicketsData, BuyTicketsQRData, Event } from '../types';
import { getConnection, getEventProgram } from '../utils';
import { getUserWallet } from '../utils/internal';

export const buyTickets = async (
  buyTicketsData: BuyTicketsData,
  network: string
): Promise<number> => {
  try {
    const connection = getConnection(network);
    const program = await getEventProgram(connection);
    const userWallet = getUserWallet();
    const eventAddress = new PublicKey(buyTicketsData.eventId);

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
      .buyTickets(buyTicketsData.ticketsAmount)
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


export const buyTicketsQR = async (
  buyTicketsData: BuyTicketsQRData,
  network: string
): Promise<Transaction> => {
  try {
    const connection = getConnection(network);
    const program = await getEventProgram(connection);
    const eventAddress = new PublicKey(buyTicketsData.eventId);
    console.log(buyTicketsData.account);
    const userPublicKey = new PublicKey(buyTicketsData.account);

    const event: Event = await program.account['event'].fetch(eventAddress);
    const userAssociatedTokenAccount = await getAssociatedTokenAddress(
      event.acceptedMint,
      userPublicKey
    );

    const [ticketMintAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('ticket_mint', 'utf-8'), eventAddress.toBuffer()],
      program.programId
    );

    const [userTicketVaultAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('ticket_vault', 'utf-8'),
        ticketMintAddress.toBuffer(),
        userPublicKey.toBuffer(),
      ],
      program.programId
    );
    const userVaultAssociatedTokenAccount = await getAssociatedTokenAddress(
      ticketMintAddress,
      userPublicKey
    );

    console.log(
      'TICKET MINT',
      ticketMintAddress.toBase58(),
      userPublicKey.toBase58(),
      eventAddress.toBase58()
    );

    console.log(
      'USER VAULT',
      userTicketVaultAddress.toBase58(),
      userVaultAssociatedTokenAccount.toBase58()
    );

    const tx  = await program.methods
      .buyTickets(buyTicketsData.ticketsAmount)
      .accounts({
        event: eventAddress,
        payer: userAssociatedTokenAccount,
        authority: userPublicKey,
      })
      .transaction();

    return tx;
  } catch (error) {
    console.log(error);
    throw error;
  }
};