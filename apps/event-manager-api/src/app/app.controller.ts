import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AirdropDTO } from './dto/airdrop.dto';
import { BuyTicketsDTO } from './dto/buy-tickets.dto';
import { CheckInDTO } from './dto/check-in.dto';
import { CreateEventDTO } from './dto/create-event.dto';
import { PurchaseDTO } from './dto/purchase.dto';
import { RechargeDTO } from './dto/recharge.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('/test')
  test() {
    return { message: 'Hello Solana' };
  }

  @Get('/wearable/:id/:eventId')
  getWearable(@Param() params) {
    return this.appService.getWearableData(params.id, params.eventId);
  }

  @Post('/create-event')
  createEvent(@Body() body: CreateEventDTO) {
    try {
      return this.appService.createEvent(
        body.name,
        body.id,
        body.description,
        body.banner,
        body.location,
        body.startDate,
        body.endDate,
        body.ticketPrice,
        body.ticketQuantity,
        body.acceptedMint
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @Post('/check-in')
  checkIn(@Body() body: CheckInDTO) {
    return this.appService.checkIn(
      body.PIN,
      body.wearableId,
      body.eventId,
      body.payer
    );
  }

  @Post('/recharge')
  recharge(@Body() body: RechargeDTO) {
    return this.appService.recharge(
      body.amount,
      body.wearableId,
      body.eventId,
      body.payer
    );
  }

  @Post('/purchase')
  purchase(@Body() body: PurchaseDTO) {
    return this.appService.purchase(
      body.PIN,
      body.amount,
      body.wearableId,
      body.eventId
    );
  }

  @Post('/buy-tickets')
  buyTickets(@Body() body: BuyTicketsDTO) {
    return this.appService.buyTickets(body.ticketsAmount, body.eventId);
  }

  @Get('/get-event-metadata')
  getTestData() {
    return this.appService.getMetadata();
  }

  @Post('/airdrop')
  doAirdropTo(@Body() body: AirdropDTO) {
    return this.appService.doAirdropTo(body.amount, body.publicKey);
  }
}
