import { PrismaService } from '@/core/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatedDto } from './dto/created.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async created(dto: CreatedDto) {
    const period = await this.prisma.period.findUnique({
      where: {
        id: dto.periodId,
      },
    });

    if (!period) {
      throw new NotFoundException('Periodo no encontrado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_periodId: { userId: dto.userId, periodId: dto.periodId },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Ya estas matriculado en este periodo');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: dto.userId,
        periodId: dto.periodId,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
        period: true,
      },
    });
    return enrollment;
  }

  async getAllEnrollments() {
    const allEnrollments = await this.prisma.enrollment.findMany({
      include: {
        user: {
          omit: {
            password: true,
          },
        },
        period: true,
      },
    });

    return allEnrollments;
  }
}
