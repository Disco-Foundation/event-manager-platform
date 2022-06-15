import {
  BuyTicketsData,
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
  Query
} from '@nestjs/common';
import { AppService } from './app.service';
import { AirdropDTO } from './dto/airdrop.dto';
import { BuyTicketsDTO } from './dto/buy-tickets.dto';
import { CheckInDTO } from './dto/check-in.dto';
import { CreateEventDTO } from './dto/create-event.dto';
import { PurchaseDTO } from './dto/purchase.dto';
import { RechargeDTO } from './dto/recharge.dto';

@Injectable()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Get('/')
  get(){
    console.log("entro GET 1")
    return {
      label: "Disco Protocol",
      icon: "https://arweave.net/za2HnCvR2t9uog3IrsAxRQhbt5DXCHgyv20l3pu26V4"
    }
  }

  @Get('/check-in')
  get2(){
    console.log("entro GET 2")
    return {
      label: "Disco Protocol",
      icon: "https://arweave.net/za2HnCvR2t9uog3IrsAxRQhbt5DXCHgyv20l3pu26V4"
    }
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
  checkIn(@Query() query: Record<string, any>,@Body() body: Record<string, any>) { // 
    try {
      console.log(query)
      const createWearableData: CheckInWearableData = {
        //...body,
        wearableId: query.wearableId,
        eventId: query.eventId,
        payer: query.payer,
        wearablePin: query.PIN,
      };

      const result = this.appService.checkIn(createWearableData);
      
      //const base64Transaction = result.toString('base64');
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @Post('/recharge')
  recharge(@Body() body: RechargeDTO) {
    const rechargeData: RechargeWearableData = {
      ...body,
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

  @Get('/get-event-metadata')
  getTestData() {
    return this.appService.getMetadata();
  }

  @Post('/airdrop')
  doAirdropTo(@Body() body: AirdropDTO) {
    return this.appService.doAirdropTo(body.amount, body.publicKey);
  }
}
