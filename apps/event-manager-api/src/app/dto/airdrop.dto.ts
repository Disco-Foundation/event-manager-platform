import { IsNumber, IsString } from 'class-validator';

export class AirdropDTO {
  @IsNumber()
  amount: number;
  @IsString()
  publicKey: string;
}
