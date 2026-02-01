import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRole } from '@/generated/prisma/enums';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { type CurrentUserI } from '@/common/interfaces/current-user.interface';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cover', maxCount: 1 },
        { name: 'file', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 100 * 1024 * 1024 },
      },
    ),
  )
  async create(
    @Body() body: CreateBookDto,
    @UploadedFiles()
    files: { cover?: Express.Multer.File[]; file?: Express.Multer.File[] },
  ) {
    if (!files.cover || !files.file) {
      throw new BadRequestException('Se requiere cover y file (PDF)');
    }

    return this.booksService.createBook(body, files.cover[0], files.file[0]);
  }

  @Get()
  async findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory() {
          return new BadRequestException('id no valido');
        },
      }),
    )
    id: string,
  ) {
    return this.booksService.findOne(id);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  async remove(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory() {
          return new BadRequestException('id no valido');
        },
      }),
    )
    id: string,
  ) {
    return this.booksService.remove(id);
  }

  @Get(':id/read')
  readBook(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory() {
          return new BadRequestException('id no valido');
        },
      }),
    )
    bookId: string,
  ) {
    return this.booksService.readBook(bookId);
  }
}
