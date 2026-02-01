import { PrismaService } from '@/core/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreatedDto } from './dto/created.dto';
import { FindCategoryQueryDto } from './dto/find-category-query.dto';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async created(values: CreatedDto) {
    const categoryFound = await this.prisma.category.findUnique({
      where: { slug: values.slug },
    });

    if (categoryFound) {
      throw new ConflictException('el Slug ya esta en uso');
    }

    const categoryNew = await this.prisma.category.create({
      data: values,
    });

    return categoryNew;
  }

  async getCategories(query: FindCategoryQueryDto) {
    const { page = 1, limit = 5, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, categories] = await this.prisma.$transaction([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              books: true,
            },
          },
        },
      }),
    ]);

    const lastPage = Math.ceil(total / limit);
    const next = page < lastPage ? page + 1 : null;
    const prev = page > 1 ? page - 1 : null;

    return {
      data: categories,
      meta: {
        total,
        page,
        lastPage,
        hasNext: page < lastPage,
        hasPrev: page > 1,
        nextPage: next,
        prevPage: prev,
      },
    };
  }

  async getAllCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            books: true,
          },
        },
      },
    });
    return categories;
  }
}
