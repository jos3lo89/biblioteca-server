# AGENTS.md - Biblioteca Server Development Guide

## Project Overview

This is a NestJS-based backend for a library management system using TypeScript, Prisma ORM with PostgreSQL, and JWT authentication.

## Important Notes for Agents

### Tests

- **DO NOT execute tests** - Tests are managed by the user
- **DO NOT modify existing test files** - Only create new test files if explicitly requested
- **DO NOT run `npm run test`** or any test-related commands
- Focus on implementation code only

### Commits

When creating commits (only when explicitly requested by the user):

1. Follow the commit message convention:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `refactor`: Code refactoring
   - `test`: Adding/modifying tests
   - `chore`: Maintenance tasks

2. Format: `<type>: <description>`
   - Example: `feat(auth): add login endpoint`
   - Example: `fix(books): resolve cover upload issue`

3. Keep commits atomic (one purpose per commit)

## Build, Lint, and Test Commands

### Build Commands

```bash
npm run build              # Compile TypeScript to JavaScript (outputs to dist/src)
npm run start              # Start the application
npm run start:dev          # Start with hot-reload (watch mode)
npm run start:debug        # Start with debug and watch mode
npm run start:prod         # Run compiled production build (node dist/main)
```

### Lint Commands

```bash
npm run lint               # Run ESLint and auto-fix issues
npm run format             # Format all TypeScript files with Prettier
```

### Test Commands

```bash
npm run test               # Run all unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage report
npm run test:e2e           # Run end-to-end tests (uses test/jest-e2e.json)
npm run test:debug         # Debug tests with Node inspector

# Run a single test file
npm run test -- src/modules/auth/auth.service.spec.ts

# Run a single test (by test name)
npm run test -t "should be defined"

# Run tests with coverage for a specific file
npm run test -- --coverage --testPathPattern=auth.service
```

## Code Style Guidelines

### Formatting

- **Single quotes** for all strings (`'string'` not `"string"`)
- **Trailing commas** enabled for multi-line objects/arrays
- **Line endings**: Auto-detected (LF or CRLF)

### Imports

- Use **path aliases** (`@/*`) for imports from `src/`:
  ```typescript
  import { PrismaService } from '@/core/prisma/prisma.service';
  import { Auth } from '@/common/decorators/auth.decorator';
  ```
- **Relative imports** only when necessary (e.g., sibling files in same module):
  ```typescript
  import { LoginDto } from './dto/login.dto';
  ```
- **Group imports** in this order:
  1. NestJS core imports (`@nestjs/common`, `@nestjs/core`, etc.)
  2. Third-party library imports
  3. Path alias imports (`@/*`)
  4. Relative imports (`./*` or `../*`)

### TypeScript Configuration

- Target: **ES2023**
- Module: **NodeNext**
- **strictNullChecks**: Enabled
- Decorators: Enabled (for NestJS)

### Naming Conventions

| Element             | Convention                     | Example                                        |
| ------------------- | ------------------------------ | ---------------------------------------------- |
| Classes             | PascalCase                     | `AuthService`, `UsersController`               |
| Interfaces          | PascalCase                     | `CurrentUserI`                                 |
| Variables/functions | camelCase                      | `userFound`, `myProfile()`                     |
| Constants           | UPPER_SNAKE_CASE               | `API_PREFIX`                                   |
| DTOs                | PascalCase, ends with `Dto`    | `RegisterDto`, `LoginDto`                      |
| Modules             | PascalCase, ends with `Module` | `AuthModule`, `UsersModule`                    |
| Files               | kebab-case                     | `auth.service.ts`, `current-user.decorator.ts` |
| Database models     | PascalCase (Prisma)            | `User`, `Book`, `Enrollment`                   |

### Error Handling

- Use **NestJS built-in exceptions**:

  ```typescript
  import {
    NotFoundException,
    ConflictException,
    UnauthorizedException,
  } from '@nestjs/common';

  throw new NotFoundException('Alumno no encontrado');
  throw new ConflictException('DNI ya esta registrado');
  ```

- **Spanish error messages** for user-facing errors
- Use `Logger` from `@nestjs/common` for server logs:

  ```typescript
  private readonly logger = new Logger(AuthService.name);

  this.logger.log('🔌 Conectando Prisma...');
  this.logger.warn('🔌 Desconectando Prisma...');
  ```

### DTOs and Validation

- Use **class-validator** decorators for validation:

  ```typescript
  import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

  export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    dni: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
  }
  ```

- Configure `ValidationPipe` globally in `main.ts` with:
  ```typescript
  new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error on unknown properties
    transform: true, // Transform payloads to DTO instances
  });
  ```

### Prisma Patterns

- Use **PrismaService** for all database operations:
  ```typescript
  constructor(private readonly prisma: PrismaService) {}
  ```
- Use **omit** to exclude fields from responses:
  ```typescript
  omit: {
    password: true,
  }
  ```
- Generated Prisma client is in `src/generated/prisma/`
- Import enums from `@/generated/prisma/enums`

### Guards and Decorators

- Use `@Auth()` decorator for protected routes
- Use `@CurrentUser()` decorator to access current user:
  ```typescript
  @Get('profile')
  @Auth()
  myProfile(@CurrentUser() user: CurrentUserI) {
    return this.userService.myProfile(user.id);
  }
  ```

### Testing Patterns

- Test files: `*.spec.ts` in same directory as source
- Use NestJS Testing module:

  ```typescript
  import { Test, TestingModule } from '@nestjs/testing';

  describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [AuthService],
      }).compile();

      service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
  ```

### Module Structure

Each feature module follows this structure:

```
modules/{feature}/
├── {feature}.controller.ts     # HTTP handlers
├── {feature}.controller.spec.ts # Controller tests
├── {feature}.service.ts        # Business logic
├── {feature}.service.spec.ts   # Service tests
├── {feature}.module.ts         # NestJS module
└── dto/
    ├── created.dto.ts          # Response DTOs
    ├── {feature}.dto.ts        # Input DTOs
```

### Global Configuration (main.ts)

- API prefix: `api/v1` (configurable via `API_PREFIX`)
- CORS: Enabled (with credentials support)
- Cors origins: Configurable via `CORS_ORIGINS` env var
- Cookie parser: Enabled
- Shutdown hooks: Enabled

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `API_PREFIX`: Global API prefix (default: `api/v1`)
- `PORT`: Server port (default: `5000`)
- `NODE_ENV`: `development` or `production`

## Common Tasks

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Database Migrations

```bash
npx prisma migrate dev
```

### Seed Database

```bash
npx tsx prisma/seed.ts
```
