import { PrismaService } from '@/core/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StudentRegisterDto } from './dto/student-register.dto';

import bcryptjs from 'bcryptjs';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { Prisma } from '@/generated/prisma/client';

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

  async getAllStudents(query: FindUsersQueryDto) {
    const { page = 1, limit = 5, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: 'STUDENT',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { dni: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, students] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
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

  async registerStudent(dto: StudentRegisterDto) {
    const studentFound = await this.prisma.user.findUnique({
      where: { dni: dto.dni },
    });

    if (studentFound) {
      throw new ConflictException('El DNI ya está registrado');
    }

    const periodExists = await this.prisma.period.findUnique({
      where: { id: dto.periodId },
    });

    if (!periodExists) {
      throw new NotFoundException('El período no existe');
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPwd = await bcryptjs.hash(dto.dni, salt);

    try {
      const newStudent = await this.prisma.user.create({
        data: {
          dni: dto.dni,
          name: dto.name,
          lastName: dto.lastName,
          fullName: `${dto.name} ${dto.lastName}`,
          role: 'STUDENT',
          password: hashedPwd,
          enrollments: {
            create: {
              periodId: dto.periodId,
              canAccess: false,
            },
          },
        },
        omit: {
          password: true,
        },
        include: {
          enrollments: {
            include: {
              period: true,
            },
          },
        },
      });

      return newStudent;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al registrar al estudiante y su matrícula',
      );
    }
  }
}
