# AGENTS.md - Biblioteca Server Development Guide

## Project Overview

NestJS backend for library management using TypeScript, Prisma ORM with PostgreSQL, and JWT authentication.

## Important Notes

### Tests

- **DO NOT execute or modify tests** - Tests are managed by the user
- Focus on implementation code only

### Commits

When requested, follow `<type>: <description>` format:

- `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Example: `feat(auth): add login endpoint`

## Build, Lint, and Test Commands

```bash
npm run build              # Compile TypeScript to dist/src
npm run start              # Start application
npm run start:dev          # Hot-reload mode
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting

npm run test               # All unit tests
npm run test:watch         # Watch mode
npm run test -- src/modules/auth/auth.service.spec.ts  # Single file
npm run test -t "should be defined"                    # Single test
npm run test -- --coverage --testPathPattern=auth.service
```

## Code Style

### Formatting

- Single quotes for all strings
- Trailing commas enabled
- Editor handles line endings

### Imports

Order: NestJS core → Third-party → `@/*` aliases → Relative

```typescript
import { Controller, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/core/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
```

### Naming Conventions

| Element             | Convention            | Example           |
| ------------------- | --------------------- | ----------------- |
| Classes             | PascalCase            | `AuthService`     |
| Interfaces          | PascalCase            | `CurrentUserI`    |
| Variables/functions | camelCase             | `userFound`       |
| Constants           | UPPER_SNAKE_CASE      | `API_PREFIX`      |
| DTOs                | PascalCase + `Dto`    | `RegisterDto`     |
| Modules             | PascalCase + `Module` | `AuthModule`      |
| Files               | kebab-case            | `auth.service.ts` |
| Prisma models       | PascalCase            | `User`, `Book`    |

### Error Handling

Use NestJS exceptions with Spanish messages:

```typescript
import { NotFoundException, ConflictException } from '@nestjs/common';

throw new NotFoundException('Alumno no encontrado');
throw new ConflictException('DNI ya esta registrado');
```

Use Logger for server logs:

```typescript
private readonly logger = new Logger(AuthService.name);
this.logger.log('Conectando Prisma...');
```

### DTOs and Validation

```typescript
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsString() @IsNotEmpty() dni: string;
  @IsEnum(UserRole) @IsNotEmpty() role: UserRole;
}
```

### Prisma

- Use `PrismaService` for all DB operations
- Use `omit` to exclude sensitive fields
- Generated client in `src/generated/prisma/`
- Import enums from `@/generated/prisma/enums`

### Guards and Decorators

- `@Auth()` for protected routes
- `@CurrentUser()` for current user context

### Module Structure

```
modules/{feature}/
├── {feature}.controller.ts
├── {feature}.service.ts
├── {feature}.module.ts
└── dto/
    ├── created.dto.ts
    └── {feature}.dto.ts
```

## Global Configuration (main.ts)

- API prefix: `api/v1`
- CORS enabled with credentials
- ValidationPipe: `whitelist`, `forbidNonWhitelisted`, `transform`

## Environment Variables

```
DATABASE_URL  - PostgreSQL connection
JWT_SECRET    - JWT signing secret
CORS_ORIGINS  - Allowed origins
API_PREFIX    - API prefix (default: api/v1)
PORT          - Server port (default: 5000)
```

## Common Tasks

```bash
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx tsx prisma/seed.ts   # Seed database
```
