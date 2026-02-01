import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { CurrentUserI } from '@/common/interfaces/current-user.interface';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':bookId/books')
  @Auth()
  async getByBook(@Param('bookId', ParseUUIDPipe) bookId: string) {
    return this.reviewsService.findByBook(bookId);
  }

  @Post(':bookId/books')
  @Auth()
  async create(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @CurrentUser() user: CurrentUserI,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(bookId, user.id, dto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserI,
  ) {
    return this.reviewsService.remove(id, user.id);
  }
}
