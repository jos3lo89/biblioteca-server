import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatedDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsBoolean()
  @IsNotEmpty()
  isCurrent: boolean;
}
