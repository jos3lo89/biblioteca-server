import { UserRole } from '@/generated/prisma/enums';

export interface CurrentUserI {
  id: string;
  dni: string;
  role: UserRole;
}
