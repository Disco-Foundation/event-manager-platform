import {
  BuyTicketsData,
  BuyTicketsQRData,
  CheckInWearableData,
  CreateEventData,
  GetWearableData,
  PurchaseWearableData,
  RechargeWearableData,
} from '@event-manager/event-manager-generator';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AirdropDTO } from './dto/airdrop.dto';
import { BuyTicketsDTO } from './dto/buy-tickets.dto';
import { CheckInDTO } from './dto/check-in.dto';
import { CreateEventDTO } from './dto/create-event.dto';
import { PurchaseDTO } from './dto/purchase.dto';

@Injectable()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  get() {
    return {
      label: 'Disco Protocol',
      icon: 'https://arweave.net/za2HnCvR2t9uog3IrsAxRQhbt5DXCHgyv20l3pu26V4',
    };
  }

  @Get('/check-in-new')
  getCheckIn() {
    console.log('entro GET CheckIn');
    return {
      label: 'Disco Protocol',
      icon: 'https://cdn.discordapp.com/attachments/756601921166639165/986724936431317072/round_logo_2.png',
    };
  }

  @Get('/buy-tickets-qr')
  getBuyTickets() {
    console.log('entro GET Buy Tickets QR');
    return {
      label: 'Disco Protocol',
      icon: 'https://cdn.discordapp.com/attachments/756601921166639165/986724936431317072/round_logo_2.png',
    };
  }

  @Get('/recharge')
  getRecharge() {
    console.log('entro GET Recharge');
    return {
      label: 'Disco Protocol',
      icon: 'https://cdn.discordapp.com/attachments/756601921166639165/986724936431317072/round_logo_2.png',
    };
  }

  @Get('/test')
  test() {
    return { message: 'Hello Solana' };
  }

  @Get('/wearable/:id/:eventId')
  getWearable(@Param() params) {
    const getWearableData: GetWearableData = {
      ...params,
    };
    return this.appService.getWearableData(getWearableData);
  }

  @Post('/create-event')
  createEvent(@Body() body: CreateEventDTO) {
    try {
      const eventData: CreateEventData = {
        ...body,
      };
      return this.appService.createEvent(eventData);
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @Post('/check-in')
  checkIn(@Body() body: CheckInDTO) {
    try {
      const createWearableData: CheckInWearableData = {
        ...body,
        reference: '',
        wearablePin: body.PIN,
      };

      const result = this.appService.checkIn(createWearableData);

      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @Post('/check-in-new')
  checkInNew(
    @Query() query: Record<string, any>,
    @Body() body: Record<string, any>
  ) {
    //
    try {
      console.log('QUERY: ', query);

      const createWearableData: CheckInWearableData = {
        wearableId: Number(query.wearableId),
        eventId: query.eventId,
        payer: body.account,
        wearablePin: query.PIN,
        reference: query.reference,
      };

      console.log('CHECKIN DATA: ', createWearableData);

      const result = this.appService.checkInNew(createWearableData);

      //const base64Transaction = result.toString('base64');
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @Post('/recharge')
  recharge(
    @Query() query: Record<string, any>,
    @Body() body: Record<string, any>
  ) {
    const rechargeData: RechargeWearableData = {
      amount: query.amount,
      wearableId: query.wearableId,
      eventId: query.eventId,
      reference: query.reference,
      payer: body.account,
    };
    return this.appService.recharge(rechargeData);
  }

  @Post('/purchase')
  purchase(@Body() body: PurchaseDTO) {
    const purchaseWearableData: PurchaseWearableData = {
      ...body,
      userPin: body.PIN,
    };
    return this.appService.purchase(purchaseWearableData);
  }

  @Post('/buy-tickets')
  buyTickets(@Body() body: BuyTicketsDTO) {
    const buyTicketsData: BuyTicketsData = {
      ...body,
    };
    return this.appService.buyTickets(buyTicketsData);
  }

  @Post('/buy-tickets-qr')
  buyTicketsQR(
    @Query() query: Record<string, any>,
    @Body() body: Record<string, any>
  ) {
    const buyTicketsData: BuyTicketsQRData = {
      ticketsAmount: Number(query.ticketsAmount),
      eventId: query.eventId,
      account: body.account,
    };

    return this.appService.buyTicketsQR(buyTicketsData);
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
