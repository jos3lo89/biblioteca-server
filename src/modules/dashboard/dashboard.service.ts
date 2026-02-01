import { PrismaService } from '@/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalStudents,
      totalBooks,
      totalPeriods,
      totalCategories,
      currentPeriodData,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { role: 'STUDENT' },
      }),

      this.prisma.book.count(),

      this.prisma.period.count(),

      this.prisma.category.count(),

      this.prisma.period.findFirst({
        where: { isCurrent: true },
        select: {
          name: true,
          _count: {
            select: { enrollments: true },
          },
        },
      }),
    ]);

    return {
      users: {
        students: totalStudents,
      },
      books: {
        total: totalBooks,
      },
      periods: {
        total: totalPeriods,
        current: currentPeriodData
          ? {
              name: currentPeriodData.name,
              enrollmentsCount: currentPeriodData._count.enrollments,
            }
          : null,
      },
      categories: {
        total: totalCategories,
      },
    };
  }
}
