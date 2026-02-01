import { PrismaService } from '@/core/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async myProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...result } = user;

    return result;
  }

  async getAllStudents(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, students] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: { role: 'STUDENT' },
      }),

      this.prisma.user.findMany({
        where: { role: 'STUDENT' },
        omit: { password: true },
        skip: skip,
        take: limit,
        include: {
          enrollments: {
            include: {
              period: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const lastPage = Math.ceil(total / limit);
    const next = page < lastPage ? page + 1 : null;
    const prev = page > 1 ? page - 1 : null;

    return {
      data: students,
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
}
