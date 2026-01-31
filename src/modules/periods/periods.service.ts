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

    const newPeriod = await this.prisma.period.create({
      data: {
        ...values,
        startDate,
        endDate,
      },
    });

    return newPeriod;
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
