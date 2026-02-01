import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { memoryStorage } from 'multer';
import { DeleteFileDto } from './dto/delete-file.dto';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload/cover')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: memoryStorage(),
    }),
  )
  async uploadCover(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.storageService.uploadCover(file);
    return result;
  }

  @Post('upload/book')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadBook(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /pdf$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.storageService.uploadBook(file);
    return result;
  }

  @Delete()
  async deleteFile(@Body() dto: DeleteFileDto) {
    await this.storageService.deleteFile(dto.key);
    return { message: 'Archivo eliminado' };
  }
}
