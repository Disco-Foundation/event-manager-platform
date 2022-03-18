import { IsNumber, IsString } from 'class-validator';

export class RechargeDTO {
  @IsNumber()
  amount: number;
  @IsNumber()
  wearableId: number;
  @IsString()
  eventId: string;
  @IsString()
  payer: string;
}
