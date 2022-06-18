import {
  actions as EventManagerActions,
  BuyTicketsData,
  BuyTicketsQRData,
  CheckInWearableData,
  CreateEventData,
  Event,
  getConnection,
  getMetadata,
  GetWearableData,
  PurchaseWearableData,
  RechargeWearableData,
} from '@event-manager/event-manager-generator';
import { Inject, Injectable } from '@nestjs/common';
import { PublicKey, Transaction } from '@solana/web3.js';
import { EnvironmentProvider } from './app.module';

@Injectable()
export class AppService {
  constructor(
    @Inject('ENVIRONMENT') private readonly environment: EnvironmentProvider
  ) {}

  async createEvent(
    createEventData: CreateEventData
  ): Promise<{ event: Event }> {
    try {
      const event = await EventManagerActions.createEvent(
        createEventData,
        this.environment.network
      );
      return { event: event };
    } catch (e) {
      console.log('ERROR DEL API', e);
      throw e;
    }
  }

  async checkIn(
    checkInData: CheckInWearableData
  ): Promise<{ transaction: String, message: String, label: String }> {
    try {
      const tx = await EventManagerActions.checkInEvent(
        checkInData,
        this.environment.network
      );

      let blockhash = await (await getConnection(this.environment.network).getLatestBlockhash('finalized')).blockhash;
      tx.recentBlockhash = blockhash;
      tx.feePayer = new PublicKey(checkInData.payer)

      const serializedTransaction = tx.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
      });

      return { 
        transaction: serializedTransaction.toString('base64'),
        message: "Check In",
        label: "Action" };
    } catch (e) {
      console.log('ERROR DEL API', e);
    }
  }

  async recharge(
    rechargeWearableData: RechargeWearableData
  ): Promise<{ transaction: Transaction }> {
    try {
      const transaction = await EventManagerActions.recharge(
        rechargeWearableData,
        this.environment.network
      );

      return { transaction: transaction };
    } catch (e) {
      console.log('ERROR DEL API', e);
    }
  }

  async purchase(
    purchaseWearableData: PurchaseWearableData
  ): Promise<{ status: boolean } | { status: boolean; error: string }> {
    try {
      const status = await EventManagerActions.purchase(
        purchaseWearableData,
        this.environment.network
      );

      return { status: status };
    } catch (e) {
      console.log('ERROR DEL API', e);
      return { status: false, error: e.message };
    }
  }

  async getWearableData(getWearableData: GetWearableData) {
    const wearable = await EventManagerActions.getWearableData(
      getWearableData,
      this.environment.network
    );
    return { wearable };
  }

  async buyTickets(buyTicketsData: BuyTicketsData) {
    const balance = await EventManagerActions.buyTickets(
      buyTicketsData,
      this.environment.network
    );

    return { currentBalance: balance };
  }

  async buyTicketsQR(buyTicketsData: BuyTicketsQRData): 
  Promise<{ transaction: String, message: String, label: String }>  {
    const tx = await EventManagerActions.buyTicketsQR(
      buyTicketsData,
      this.environment.network
    );

    let blockhash = await (await getConnection(this.environment.network).getLatestBlockhash('finalized')).blockhash;
    tx.recentBlockhash = blockhash;
    tx.feePayer = new PublicKey(buyTicketsData.account)

    const serializedTransaction = tx.serialize({
      verifySignatures: false,
      requireAllSignatures: false,
    });

    return { 
      transaction: serializedTransaction.toString('base64'),
      message: "Buy Ticket",
      label: "Action" };
  }

  async doAirdropTo(amount: number, publicKey: string) {
    try {
      await EventManagerActions.doAirdropTo(
        amount,
        publicKey,
        this.environment.network
      );
      return { status: true };
    } catch (e) {
      console.log('ERROR DEL API', e);
      return { status: false, error: e.message };
    }
  }

  getMetadata() {
    return getMetadata();
  }
}
