import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  CreateReviewResponse,
  ReviewTreeNode,
} from './dto/review-response.dto';

interface UserBasicInfo {
  id: string;
  name: string;
  lastName: string;
}

interface ReviewWithUser {
  id: string;
  content: string;
  userId: string;
  bookId: string;
  parentId: string | null;
  createdAt: Date;
  user: UserBasicInfo | null;
  children?: ReviewWithUser[];
}

@Injectable()
export class ReviewsService {
  private readonly maxDepth = 3;

  constructor(private readonly prisma: PrismaService) {}

  async create(bookId: string, userId: string, dto: CreateReviewDto) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    if (dto.parentId) {
      const parent = await this.prisma.review.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent || parent.bookId !== bookId) {
        throw new BadRequestException('Comentario padre invalido');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, lastName: true },
    });

    const review = await this.prisma.review.create({
      data: {
        content: dto.content,
        userId,
        bookId,
        parentId: dto.parentId ?? null,
      },
    });

    return {
      id: review.id,
      content: review.content,
      userId: review.userId,
      userName: user?.name ?? '',
      userLastName: user?.lastName ?? '',
      initials: this.getInitials(user?.name, user?.lastName),
      parentId: review.parentId,
      createdAt: review.createdAt,
    };
  }

  async findByBook(bookId: string): Promise<ReviewTreeNode[]> {
    const rootReviews = await this.prisma.review.findMany({
      where: { bookId, parentId: null },
      include: {
        user: { select: { id: true, name: true, lastName: true } },
        children: {
          include: {
            user: { select: { id: true, name: true, lastName: true } },
            children: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rootReviews.map((r) =>
      this.buildTree(r as unknown as ReviewWithUser, 1),
    );
  }

  async remove(reviewId: string, userId: string): Promise<{ message: string }> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('No puedes eliminar este comentario');
    }

    await this.prisma.$transaction([
      this.prisma.review.deleteMany({
        where: { OR: [{ id: reviewId }, { parentId: reviewId }] },
      }),
    ]);

    return { message: 'Comentario eliminado' };
  }

  private buildTree(review: ReviewWithUser, depth: number): ReviewTreeNode {
    const user = review.user;
    const initials = this.getInitials(user?.name, user?.lastName);

    if (depth >= this.maxDepth) {
      return {
        id: review.id,
        content: review.content,
        userId: review.userId,
        userName: user?.name ?? '',
        userLastName: user?.lastName ?? '',
        initials,
        parentId: review.parentId,
        createdAt: review.createdAt,
        children: [],
      };
    }

    const children = review.children ?? [];

    return {
      id: review.id,
      content: review.content,
      userId: review.userId,
      userName: user?.name ?? '',
      userLastName: user?.lastName ?? '',
      initials,
      parentId: review.parentId,
      createdAt: review.createdAt,
      children: children.map((child) =>
        this.buildTree(child as unknown as ReviewWithUser, depth + 1),
      ),
    };
  }

  private getInitials(name?: string | null, lastName?: string | null): string {
    const first = name?.charAt(0)?.toUpperCase() ?? '';
    const last = lastName?.charAt(0)?.toUpperCase() ?? '';
    return `${first}${last}`;
  }
}
