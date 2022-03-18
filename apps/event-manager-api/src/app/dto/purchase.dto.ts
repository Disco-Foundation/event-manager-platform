import { IsNumber, IsString } from 'class-validator';

export class PurchaseDTO {
  @IsNumber()
  amount: number;
  @IsString()
  PIN: string;
  @IsNumber()
  wearableId: number;
  @IsString()
  eventId: string;
}
