import { IsNotEmpty, IsString, Min } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsNotEmpty()
  @Min(6)
  password: string;
}
