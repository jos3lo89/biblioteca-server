import { UserRole } from '@/generated/prisma/enums';

export interface JwtPayload {
  id: string;
  dni: string;
  role: UserRole;
}
