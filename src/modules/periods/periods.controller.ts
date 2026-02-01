import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { UserRole } from '@/generated/prisma/enums';
import { CreatedDto } from './dto/created.dto';

@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodService: PeriodsService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  created(@Body() body: CreatedDto) {
    return this.periodService.created(body);
  }

  @Get()
  @Auth(UserRole.ADMIN)
  getAllPeriods(
    @Query(
      'page',
      new DefaultValuePipe(1),
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory() {
          return new BadRequestException('Formato de pagina incorrecta');
        },
      }),
    )
    page: number,
    @Query(
      'limit',
      new DefaultValuePipe(5),
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory() {
          return new BadRequestException('Formato de limite incorrecta');
        },
      }),
    )
    limit: number,
  ) {
    console.log({
      page,
      limit,
    });

    return this.periodService.getAllPeriods(page, limit);
  }

  @Patch(':id/current')
  @Auth(UserRole.ADMIN)
  setCurrentPeriod(
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
    return this.periodService.setCurrentPeriod(id);
  }
}
