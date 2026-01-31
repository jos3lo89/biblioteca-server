import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
    console.log(id);
  }
}
