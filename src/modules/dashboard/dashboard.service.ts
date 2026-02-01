import { PrismaService } from '@/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    // Ejecutamos solo lo estrictamente necesario en paralelo
    const [
      totalStudents,
      totalBooks,
      totalPeriods,
      totalCategories,
      currentPeriodData,
    ] = await Promise.all([
      // 1. Total Estudiantes
      this.prisma.user.count({
        where: { role: 'STUDENT' },
      }),

      // 2. Total Libros
      this.prisma.book.count(),

      // 3. Total Periodos
      this.prisma.period.count(),

      // 4. Total Categorías
      this.prisma.category.count(),

      // 5. Datos del Periodo Actual (Solo nombre y conteo)
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

    // Retornamos la estructura exacta que tu Frontend espera
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
