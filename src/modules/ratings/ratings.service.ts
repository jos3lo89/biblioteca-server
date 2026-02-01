import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { SetRatingDto } from './dto/set-rating.dto';
import {
  MyRatingResponse,
  RatingSummaryResponse,
  SetRatingResponse,
} from './dto/rating-response.dto';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async setRating(bookId: string, userId: string, dto: SetRatingDto) {
    const existing = await this.prisma.bookRating.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existing?.rating === dto.rating) {
      await this.prisma.bookRating.delete({ where: { id: existing.id } });
      this.logger.log(
        `Rating removed: user=${userId}, book=${bookId}, rating=${dto.rating}`,
      );
      return { action: 'removed', rating: 0 };
    }

    if (existing) {
      const updated = await this.prisma.bookRating.update({
        where: { id: existing.id },
        data: { rating: dto.rating },
      });
      this.logger.log(
        `Rating updated: user=${userId}, book=${bookId}, rating=${dto.rating}`,
      );
      return { action: 'updated', rating: updated.rating };
    }

    const newRating = await this.prisma.bookRating.create({
      data: { userId, bookId, rating: dto.rating },
    });
    this.logger.log(
      `Rating created: user=${userId}, book=${bookId}, rating=${dto.rating}`,
    );
    return { action: 'created', rating: newRating.rating };
  }

  async getMyRating(bookId: string, userId: string) {
    const rating = await this.prisma.bookRating.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
    return { rating: rating?.rating ?? null };
  }

  async getSummary(bookId: string) {
    const aggregate = await this.prisma.bookRating.aggregate({
      where: { bookId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      average: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      total: aggregate._count.rating,
    };
  }
}
