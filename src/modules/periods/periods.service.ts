import { PrismaService } from '@/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreatedDto } from './dto/created.dto';

@Injectable()
export class PeriodsService {
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

  async setCurrentPeriod(periodId: string) {}
}
