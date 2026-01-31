import { PrismaService } from '@/core/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(values: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { dni: values.dni },
    });

    if (!user) {
      throw new NotFoundException('Alumno no econtrado');
    }

    const pwdIsMatch = await bcryptjs.compare(values.password, user.password);

    if (!pwdIsMatch) {
      throw new UnauthorizedException('Contraseña invalida');
    }

    const payload = { id: user.id, dni: user.dni, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    const { password, ...result } = user;

    return { token, result };
  }
}
