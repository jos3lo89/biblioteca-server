import { PrismaService } from '@/core/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreatedDto } from './dto/created.dto';

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
}
