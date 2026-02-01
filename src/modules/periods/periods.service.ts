import { PrismaService } from '@/core/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatedDto } from './dto/created.dto';

@Injectable()
export class PeriodsService {
  private readonly logger = new Logger(PeriodsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async created(values: CreatedDto) {
    const startDate = new Date(values.startDate);
    const endDate = new Date(values.endDate);

    // ESCENARIO 1: El usuario quiere que este sea el PERIODO ACTUAL
    if (values.isCurrent) {
      // Usamos una transacción para garantizar que no queden dos activos a la vez
      return this.prisma.$transaction(async (tx) => {
        // 1. Desactivar cualquier otro periodo que esté como 'current'
        await tx.period.updateMany({
          where: { isCurrent: true },
          data: { isCurrent: false },
        });

        // 2. Crear el nuevo periodo (que será el único true)
        return tx.period.create({
          data: {
            ...values,
            startDate,
            endDate,
          },
        });
      });
    }

    // ESCENARIO 2: Es un periodo pasado o futuro (NO actual)
    // Simplemente lo creamos sin tocar los demás registros
    return this.prisma.period.create({
      data: {
        ...values,
        startDate,
        endDate,
      },
    });
  }

  async getAllPeriods(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, periods] = await this.prisma.$transaction([
      this.prisma.period.count(),

      this.prisma.period.findMany({
        skip: skip,
        take: limit,
        include: {
          _count: {
            select: {
              enrollments: true,
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
      data: periods,
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

  async setCurrentPeriod(periodId: string) {
    const periodFound = await this.prisma.period.findUnique({
      where: { id: periodId },
    });

    if (!periodFound) {
      throw new NotFoundException('Periodo no encontrado');
    }

    const currentPeriod = await this.prisma.period.findFirst({
      where: {
        isCurrent: true,
      },
    });

    if (currentPeriod) {
      this.logger.warn(
        `Ya existe un periodo como actual: ${currentPeriod.name} (${currentPeriod.id})`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.period.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      }),
      this.prisma.period.update({
        where: {
          id: periodId,
        },
        data: { isCurrent: true },
      }),
    ]);

    const newCurrentPeriod = await this.prisma.period.findUnique({
      where: { id: periodId },
    });

    return newCurrentPeriod;
  }
}
