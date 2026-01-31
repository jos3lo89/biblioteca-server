import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatedDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  periodId: string;

  @IsBoolean()
  @IsNotEmpty()
  canAccess: boolean;
}
