import {
  actions as EventManagerActions,
  Event,
  getMetadata,
} from '@event-manager/event-manager-generator';
import { Injectable } from '@nestjs/common';
import { PublicKey, Transaction } from '@solana/web3.js';

@Injectable()
export class AppService {
  async createEvent(
    name: string,
    id: number,
    description: string,
    banner: string,
    location: string,
    startDate: string,
    endDate: string,
    ticketPrice: number,
    ticketQuantity: number,
    acceptedMint: string
  ): Promise<{ event: Event }> {
    try {
      const event = await EventManagerActions.createEvent(
        name,
        id,
        description,
        banner,
        location,
        startDate,
        endDate,
        ticketPrice,
        ticketQuantity,
        acceptedMint
      );
      return { event: event };
    } catch (e) {
      console.log('ERROR DEL API', e);
      throw e;
    }
  }

  async checkIn(
    wearablePin: string,
    wearableId: number,
    eventId: string,
    payer: string
  ): Promise<{ transaction: Transaction }> {
    try {
      const payerAddress = new PublicKey(payer);
      const tx = await EventManagerActions.checkInEvent(
        wearablePin,
        wearableId,
        eventId,
        payerAddress
      );
      return { transaction: tx };
    } catch (e) {
      console.log('ERROR DEL API', e);
    }
  }

  async recharge(
    amount: number,
    wearableId: number,
    eventId: string,
    payer: string
  ): Promise<{ transaction: Transaction }> {
    try {
      const transaction = await EventManagerActions.recharge(
        amount,
        wearableId,
        eventId,
        payer
      );

      return { transaction: transaction };
    } catch (e) {
      console.log('ERROR DEL API', e);
    }
  }

  async purchase(
    userPin: string,
    amount: number,
    wearableId: number,
    eventId: string
  ): Promise<{ status: boolean } | { status: boolean; error: string }> {
    try {
      const status = await EventManagerActions.purchase(
        userPin,
        amount,
        wearableId,
        eventId
      );

      return { status: status };
    } catch (e) {
      console.log('ERROR DEL API', e);
      return { status: false, error: e.message };
    }
  }

  async getWearableData(id: number, eventId: number) {
    const wearable = await EventManagerActions.getWearableData(id, eventId);
    return { wearable };
  }

  async buyTickets(ticketsAmount: number, eventId: string) {
    const balance = await EventManagerActions.buyTickets(
      ticketsAmount,
      eventId
    );

    return { currentBalance: balance };
  }

  getMetadata() {
    return getMetadata();
  }
}
