import { IsNumber, IsString } from 'class-validator';

export class CreateEventDTO {
  @IsString()
  name: string;
  @IsNumber()
  id: number;
  @IsString()
  description: string;
  @IsString()
  banner: string;
  @IsString()
  location: string;
  @IsString()
  startDate: string;
  @IsString()
  endDate: string;
  @IsNumber()
  ticketPrice: number;
  @IsNumber()
  ticketQuantity: number;
  @IsString()
  acceptedMint: string;
  @IsString()
  fId: string;
}
