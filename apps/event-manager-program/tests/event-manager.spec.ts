import { BN, Program, ProgramError, Provider } from '@project-serum/anchor';
import { getAccount, getMint } from '@solana/spl-token';
import { Keypair, PublicKey } from '@solana/web3.js';
import { assert } from 'chai';
import { EventManager, IDL } from '../target/types/event_manager';
import {
  createFundedWallet,
  createMint,
  createUserAndAssociatedWallet,
  EVENT_MANAGER_PROGRAM_ID,
} from './utils';

describe('New Solana X Party Reloaded', () => {
  const provider = Provider.env();
  const eventProgram = new Program<EventManager>(
    IDL,
    EVENT_MANAGER_PROGRAM_ID,
    provider
  );

  const acceptedMintDecimals = 8;
  const wearableId = new BN(1);
  const eventId = new BN(5);
  const eventDescription = 'A super event';
  const eventBanner = 'http://image.com';
  const eventLocation = 'Metaverse';
  const eventStartDate = new BN(Date.now() * 1000);
  const eventEndDate = new BN(Date.now() * 1000);
  const uiAmountToTransfer = new BN(420);
  const amountToTransfer = uiAmountToTransfer.mul(
    new BN(10).pow(new BN(acceptedMintDecimals))
  );
  const uiAmountToCharge = new BN(69);
  const amountToCharge = uiAmountToCharge.mul(
    new BN(10).pow(new BN(acceptedMintDecimals))
  );
  const aliceUiBalance = new BN(1000);
  const aliceBalance = aliceUiBalance.mul(
    new BN(10).pow(new BN(acceptedMintDecimals))
  );
  const aliceTickets = 3;
  const ticketQuantity = 500;
  const ticketUiPrice = new BN(1);
  const ticketPrice = ticketUiPrice.mul(
    new BN(10).pow(new BN(acceptedMintDecimals))
  );

  let eventAddress: PublicKey;
  let eventMintAddress: PublicKey;
  let ticketMintAddress: PublicKey;
  let gainVaultAddress: PublicKey;
  let temporalVaultAddress: PublicKey;
  let wearableAddress: PublicKey;
  let wearableVaultAddress: PublicKey;
  let aliceTicketVaultAddress: PublicKey;
  let acceptedMintAddress: PublicKey;
  let alice: Keypair, aliceWallet: PublicKey;
  let certifier: Keypair;

  before(async () => {
    [eventAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('event', 'utf-8'),
        eventId.toBuffer('le', 8),
        eventProgram.provider.wallet.publicKey.toBuffer(),
      ],
      eventProgram.programId
    );
    [gainVaultAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('gain_vault', 'utf-8'), eventAddress.toBuffer()],
      eventProgram.programId
    );
    [temporalVaultAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('temporal_vault', 'utf-8'), eventAddress.toBuffer()],
      eventProgram.programId
    );
    [eventMintAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('event_mint', 'utf-8'), eventAddress.toBuffer()],
      eventProgram.programId
    );
    [ticketMintAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('ticket_mint', 'utf-8'), eventAddress.toBuffer()],
      eventProgram.programId
    );
    [wearableAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('wearable', 'utf-8'),
        wearableId.toBuffer('le', 8),
        eventAddress.toBuffer(),
      ],
      eventProgram.programId
    );
    [wearableVaultAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('wearable_vault', 'utf-8'),
        eventMintAddress.toBuffer(),
        wearableAddress.toBuffer(),
      ],
      eventProgram.programId
    );

    acceptedMintAddress = await createMint(provider, acceptedMintDecimals);
    alice = await createFundedWallet(provider);
    aliceWallet = await createUserAndAssociatedWallet(
      provider,
      acceptedMintAddress,
      BigInt(`0x${aliceBalance.toString('hex')}`),
      alice
    );
    [aliceTicketVaultAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('ticket_vault', 'utf-8'),
        ticketMintAddress.toBuffer(),
        alice.publicKey.toBuffer(),
      ],
      eventProgram.programId
    );
    certifier = await createFundedWallet(provider);
  });

  it('should create new event', async () => {
    // arrange
    const eventName = 'Solana';
    // act
    await eventProgram.methods
      .createEvent(
        eventId,
        eventName,
        eventDescription,
        eventBanner,
        eventLocation,
        eventStartDate,
        eventEndDate,
        ticketUiPrice,
        ticketQuantity
      )
      .accounts({
        authority: eventProgram.provider.wallet.publicKey,
        acceptedMint: acceptedMintAddress,
        certifier: certifier.publicKey,
      })
      .signers([certifier])
      .rpc();
    // assert
    const eventAccount = await eventProgram.account.event.fetch(eventAddress);
    const acceptedMintAccount = await getMint(
      provider.connection,
      acceptedMintAddress
    );
    const eventMintAccount = await getMint(
      provider.connection,
      eventMintAddress
    );
    const ticketMintAccount = await getMint(
      provider.connection,
      ticketMintAddress
    );
    assert.equal(eventAccount.name, eventName);
    assert.equal(eventAccount.description, eventDescription);
    assert.equal(eventAccount.banner, eventBanner);
    assert.equal(eventAccount.location, eventLocation);
    assert.ok(eventAccount.eventStartDate.eq(eventStartDate));
    assert.ok(eventAccount.eventEndDate.eq(eventEndDate));
    assert.equal(eventAccount.eventId.toString(), eventId.toString());
    assert.ok(eventAccount.totalValueLocked.eq(new BN(0)));
    assert.ok(eventAccount.totalValueLockedInTickets.eq(new BN(0)));
    assert.ok(eventAccount.totalValueLockedInRecharges.eq(new BN(0)));
    assert.ok(eventAccount.totalProfit.eq(new BN(0)));
    assert.ok(eventAccount.totalProfitInTickets.eq(new BN(0)));
    assert.ok(eventAccount.totalProfitInPurchases.eq(new BN(0)));
    assert.ok(eventAccount.totalDeposited.eq(new BN(0)));
    assert.ok(
      new BN(Number(acceptedMintAccount.decimals)).eq(
        new BN(Number(eventMintAccount.decimals))
      )
    );
    assert.ok(new BN(Number(ticketMintAccount.decimals)).eq(new BN(0)));
  });

  it('should buy (3) tickets', async () => {
    // arrange
    const ticketTotal = ticketPrice.mul(new BN(aliceTickets));
    // act
    await eventProgram.methods
      .buyTickets(aliceTickets)
      .accounts({
        payer: aliceWallet,
        event: eventAddress,
        authority: alice.publicKey,
      })
      .signers([alice])
      .rpc();
    // assert
    const aliceTicketVaultAccount = await getAccount(
      provider.connection,
      aliceTicketVaultAddress
    );
    const ticketMintAccount = await getMint(
      provider.connection,
      ticketMintAddress
    );
    const temporalVaultAccount = await getAccount(
      provider.connection,
      temporalVaultAddress
    );
    const eventAccount = await eventProgram.account.event.fetch(eventAddress);
    assert.equal(aliceTicketVaultAccount.amount, BigInt(aliceTickets));
    assert.equal(ticketMintAccount.supply, BigInt(aliceTickets));
    assert.equal(
      temporalVaultAccount.amount,
      BigInt(`0x${ticketTotal.toString('hex')}`)
    );
    assert.ok(eventAccount.totalValueLocked.eq(ticketTotal));
    assert.ok(eventAccount.totalDeposited.eq(ticketTotal));
    assert.ok(eventAccount.totalValueLockedInTickets.eq(ticketTotal));
  });

  it('should create PDA using wearable id', async () => {
    // arrange
    // .mul(BN(1)) for demo purposes, in the future it might be possible to check in multiple wearables at once
    const ticketTotal = ticketPrice.mul(new BN(1));
    // act
    await eventProgram.methods
      .checkIn(wearableId)
      .accounts({
        event: eventAddress,
        authority: alice.publicKey,
      })
      .signers([alice])
      .rpc();
    // assert
    const wearableAccount = await eventProgram.account.wearable.fetch(
      wearableAddress
    );
    const gainVaultAccount = await getAccount(
      provider.connection,
      gainVaultAddress
    );
    const ticketMintAccount = await getMint(
      provider.connection,
      ticketMintAddress
    );
    const aliceTicketVaultAccount = await getAccount(
      provider.connection,
      aliceTicketVaultAddress
    );
    const eventAccount = await eventProgram.account.event.fetch(eventAddress);
    assert.equal(wearableAccount.wearableId.toString(), wearableId.toString());
    assert.ok(eventAccount.totalProfit.eq(ticketTotal));
    assert.ok(eventAccount.totalProfitInTickets.eq(ticketTotal));
    assert.equal(aliceTicketVaultAccount.amount, BigInt(aliceTickets - 1));
    assert.equal(ticketMintAccount.supply, BigInt(aliceTickets - 1));
    assert.equal(
      gainVaultAccount.amount,
      BigInt(`0x${ticketTotal.toString('hex')}`)
    );
    assert.equal(
      gainVaultAccount.amount,
      BigInt(`0x${ticketTotal.toString('hex')}`)
    );
  });

  it('should recharge the wearable PDA', async () => {
    // arrange
    const ticketTotalSpent = ticketPrice.mul(new BN(aliceTickets));
    const ticketTotalProfit = ticketPrice.mul(new BN(1));
    const ticketTotalLocked = ticketTotalSpent.sub(ticketTotalProfit);
    // act
    await eventProgram.methods
      .recharge(wearableId, new BN(amountToTransfer))
      .accounts({
        payer: aliceWallet,
        event: eventAddress,
        authority: alice.publicKey,
      })
      .signers([alice])
      .rpc();
    // assert
    const wearableVaultAccount = await getAccount(
      provider.connection,
      wearableVaultAddress
    );
    const aliceAccount = await getAccount(provider.connection, aliceWallet);
    const temporalVaultAccount = await getAccount(
      provider.connection,
      temporalVaultAddress
    );
    const eventAccount = await eventProgram.account.event.fetch(eventAddress);
    wearableVaultAccount.amount,
      assert.equal(
        wearableVaultAccount.amount,
        BigInt(`0x${amountToTransfer.toString('hex')}`)
      );
    assert.equal(
      aliceAccount.amount,
      BigInt(
        `0x${aliceBalance
          .sub(amountToTransfer.add(ticketTotalSpent))
          .toString('hex')}`
      )
    );
    assert.equal(
      temporalVaultAccount.amount,
      BigInt(`0x${amountToTransfer.add(ticketTotalLocked).toString('hex')}`)
    );
    assert.ok(
      eventAccount.totalValueLocked.eq(amountToTransfer.add(ticketTotalLocked))
    );
    assert.ok(
      eventAccount.totalDeposited.eq(amountToTransfer.add(ticketTotalSpent))
    );
    assert.ok(eventAccount.totalValueLockedInRecharges.eq(amountToTransfer));
    assert.ok(eventAccount.totalValueLockedInTickets.eq(ticketTotalLocked));
  });

  it('should purchase using the wearable PDA', async () => {
    // arrange
    const totalProfit = amountToCharge.add(ticketPrice.mul(new BN(1)));
    const totalLocked = amountToTransfer
      .add(ticketPrice.mul(new BN(aliceTickets - 1)))
      .sub(amountToCharge);
    // act
    await eventProgram.methods
      .purchase(wearableId, new BN(amountToCharge))
      .accounts({
        event: eventAddress,
        certifier: certifier.publicKey,
      })
      .signers([certifier])
      .rpc();
    // assert
    const wearableVaultAccount = await getAccount(
      provider.connection,
      wearableVaultAddress
    );
    const temporalVaultAccount = await getAccount(
      provider.connection,
      temporalVaultAddress
    );
    const gainVaultAccount = await getAccount(
      provider.connection,
      gainVaultAddress
    );
    const eventAccount = await eventProgram.account.event.fetch(eventAddress);
    assert.equal(
      gainVaultAccount.amount,
      BigInt(`0x${totalProfit.toString('hex')}`)
    );
    assert.equal(
      wearableVaultAccount.amount,
      BigInt(`0x${amountToTransfer.sub(amountToCharge).toString('hex')}`)
    );
    assert.equal(
      temporalVaultAccount.amount,
      BigInt(`0x${totalLocked.toString('hex')}`)
    );
    assert.ok(eventAccount.totalValueLocked.eq(totalLocked));
    assert.ok(eventAccount.totalProfit.eq(totalProfit));
    assert.ok(eventAccount.totalProfitInPurchases.eq(new BN(amountToCharge)));
  });

  it('should fail when certifier didnt sign', async () => {
    // arrange
    let error: ProgramError;
    // act
    try {
      await eventProgram.methods
        .purchase(wearableId, new BN(amountToCharge))
        .accounts({
          event: eventAddress,
          certifier: certifier.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error.message, 'Signature verification failed');
  });
});
