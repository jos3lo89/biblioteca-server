import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { SetRatingDto } from './dto/set-rating.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/generated/prisma/enums';
import type { CurrentUserI } from '@/common/interfaces/current-user.interface';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':bookId/books')
  @Auth()
  async setRating(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @CurrentUser() user: CurrentUserI,
    @Body() dto: SetRatingDto,
  ) {
    return this.ratingsService.setRating(bookId, user.id, dto);
  }

  @Get(':bookId/my-rating')
  @Auth()
  async getMyRating(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.ratingsService.getMyRating(bookId, user.id);
  }

  @Get(':bookId/summary')
  @Auth(UserRole.ADMIN)
  async getSummary(@Param('bookId', ParseUUIDPipe) bookId: string) {
    return this.ratingsService.getSummary(bookId);
  }
}
