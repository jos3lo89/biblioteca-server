import { Injectable } from '@nestjs/common';
import { PrismaService } from './core/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  getHello() {
    return {
      message: 'Hello 👋',
    };
  }

  async getHealth() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      server: 'ok',
      database: 'up',
      time: new Date().toLocaleString('es-PE', {
        formatMatcher: 'basic',
      }),
    };
  }
}
