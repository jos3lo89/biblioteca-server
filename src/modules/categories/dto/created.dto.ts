import { IsNotEmpty, IsString } from 'class-validator';

export class CreatedDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}
