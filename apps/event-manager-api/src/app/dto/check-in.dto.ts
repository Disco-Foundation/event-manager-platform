import { IsNumber, IsString } from 'class-validator';

export class CheckInDTO {
  @IsNumber()
  wearableId: number;
  @IsString()
  eventId: string;
  @IsString()
  payer: string;
  @IsString()
  PIN: string;
}
