import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsBoolean, IsUUID } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isDownloadable: boolean;
}
