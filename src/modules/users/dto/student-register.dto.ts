import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class StudentRegisterDto {
  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsUUID()
  @IsNotEmpty()
  periodId: string;
}
