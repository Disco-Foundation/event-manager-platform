import { IsNumber, IsString } from 'class-validator';

export class BuyTicketsDTO {
  @IsNumber()
  ticketsAmount: number;
  @IsString()
  eventId: string;
}
