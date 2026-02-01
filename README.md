# Biblioteca Server API

Backend para sistema de biblioteca digital con autenticación, gestión de libros, comentarios jerárquicos, calificaciones y más.

## Tech Stack

- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Storage:** MinIO/S3 compatible (libros y portadas)
- **Authentication:** JWT en cookies
- **Testing:** Jest

## Requisitos

- Node.js 20+
- PostgreSQL 15+
- MinIO (o cualquier servidor S3 compatible)
- Docker y Docker Compose (para servicios locales)

## Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://rem:rem123@localhost:6000/bibliotecadb?schema=public"

# Server
NODE_ENV="development"
PORT=5000
API_PREFIX="api/v1"

# JWT
JWT_SECRET="tu_jwt_secret_super_seguro_aqui"

# CORS
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"

# MinIO / S3
S3_ENDPOINT="http://localhost"
S3_PORT=6002
S3_ACCESS_KEY="adminbiblioteca"
S3_SECRET_KEY="biblio123456"
S3_BUCKET="biblioteca-books"
S3_REGION="us-east-1"

# Upload Limits (bytes)
MAX_COVER_SIZE=5242880       # 5MB
MAX_BOOK_FILE_SIZE=104857600 # 100MB

# Other
PRESIGNED_URL_EXPIRY_MINUTES=15
```

## Levantar Servicios Locales

### Con Docker Compose (PostgreSQL + pgAdmin + MinIO)

```bash
cd biblioteca-db
docker compose up -d
```

Servicios disponibles:

| Servicio      | URL                   | Puerto |
| ------------- | --------------------- | ------ |
| PostgreSQL    | localhost             | 6000   |
| pgAdmin       | http://localhost:6001 | 6001   |
| MinIO API     | http://localhost:6002 | 6002   |
| MinIO Console | http://localhost:6003 | 6003   |

Credenciales MinIO:

- User: `adminbiblioteca`
- Password: `biblio123456`

## Configuración de Base de Datos

```bash
# Generar cliente Prisma (después de cambios en schema)
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Ver UI de Prisma Studio
npx prisma studio
```

## Ejecutar el Servidor

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod

# Solo lint y format
npm run lint
npm run format
```

## Tests

```bash
# Todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:cov

# Tests e2e
npm run test:e2e
```

## Estructura del Proyecto

```
src/
├── app.module.ts              # Módulo principal
├── main.ts                    # Entry point
├── core/
│   └── prisma/               # PrismaService
├── common/
│   ├── decorators/           # @Auth(), @CurrentUser()
│   ├── guards/               # RolesGuard, JwtAuthGuard
│   └── interfaces/           # CurrentUserI
├── generated/prisma/         # Cliente Prisma generado
└── modules/
    ├── auth/                 # Autenticación (login, register)
    ├── users/                # Perfil de usuario
    ├── categories/           # Categorías de libros
    ├── periods/              # Períodos académicos
    ├── enrollments/          # Matrículas de alumnos
    ├── books/                # Gestión de libros
    ├── storage/              # Subida de archivos (MinIO/S3)
    ├── reviews/              # Comentarios jerárquicos
    └── ratings/              # Calificaciones con estrellas
```

## API Endpoints

### Autenticación

| Método | Endpoint                | Auth | Descripción              |
| ------ | ----------------------- | ---- | ------------------------ |
| POST   | `/api/v1/auth/register` | No   | Registrar usuario        |
| POST   | `/api/v1/auth/login`    | No   | Iniciar sesión           |
| POST   | `/api/v1/auth/logout`   | No   | Cerrar sesión            |
| GET    | `/api/v1/auth/me`       | JWT  | Datos del usuario actual |

**Register:**

```json
{
  "dni": "12345678",
  "name": "Juan",
  "lastName": "Perez",
  "password": "password123",
  "role": "STUDENT" // o ADMIN
}
```

**Login:**

```json
{
  "dni": "12345678",
  "password": "password123"
}
```

---

### Usuarios

| Método | Endpoint                | Auth | Descripción           |
| ------ | ----------------------- | ---- | --------------------- |
| GET    | `/api/v1/users/profile` | JWT  | Obtener perfil propio |

---

### Categorías

| Método | Endpoint                 | Auth  | Descripción        |
| ------ | ------------------------ | ----- | ------------------ |
| GET    | `/api/v1/categories`     | No    | Listar categorías  |
| POST   | `/api/v1/categories`     | ADMIN | Crear categoría    |
| GET    | `/api/v1/categories/:id` | No    | Obtener categoría  |
| DELETE | `/api/v1/categories/:id` | ADMIN | Eliminar categoría |

---

### Períodos

| Método | Endpoint                      | Auth  | Descripción        |
| ------ | ----------------------------- | ----- | ------------------ |
| POST   | `/api/v1/periods`             | ADMIN | Crear período      |
| GET    | `/api/v1/periods`             | No    | Listar períodos    |
| PATCH  | `/api/v1/periods/:id/current` | ADMIN | Marcar como actual |

---

### Matrículas

| Método | Endpoint              | Auth    | Descripción             |
| ------ | --------------------- | ------- | ----------------------- |
| POST   | `/api/v1/enrollments` | STUDENT | Matricularse en período |
| GET    | `/api/v1/enrollments` | ADMIN   | Listar matrículas       |

---

### Libros

| Método | Endpoint                 | Auth  | Descripción                                |
| ------ | ------------------------ | ----- | ------------------------------------------ |
| GET    | `/api/v1/books`          | No    | Listar libros (con filtros)                |
| GET    | `/api/v1/books/:id`      | No    | Obtener libro                              |
| POST   | `/api/v1/books`          | ADMIN | Crear libro (multipart/form-data)          |
| DELETE | `/api/v1/books/:id`      | ADMIN | Eliminar libro                             |
| GET    | `/api/v1/books/:id/read` | JWT   | URL firmada para leer (requiere matrícula) |

**Crear Libro (POST /api/v1/books):**

Content-Type: `multipart/form-data`

| Campo          | Tipo    | Descripción                                 |
| -------------- | ------- | ------------------------------------------- |
| title          | string  | Título del libro                            |
| author         | string  | Autor                                       |
| description    | string  | Descripción (opcional)                      |
| categoryId     | UUID    | ID de categoría                             |
| isDownloadable | boolean | Permitir descarga                           |
| files[cover]   | File    | Imagen de portada (jpg, png, webp, max 5MB) |
| files[file]    | File    | PDF del libro (max 100MB)                   |

**Respuesta:**

```json
{
  "id": "uuid",
  "title": "Algebra Lineal",
  "author": "K. Hoffman",
  "coverUrl": "http://localhost:6002/biblioteca-books/covers/uuid.jpg",
  "isDownloadable": false,
  "categoryId": "uuid"
}
```

---

### Comentarios (Reviews)

| Método | Endpoint                                | Auth | Descripción                |
| ------ | --------------------------------------- | ---- | -------------------------- |
| GET    | `/api/v1/reviews/books/:bookId/reviews` | No   | Listar comentarios (árbol) |
| POST   | `/api/v1/reviews/books/:bookId/reviews` | JWT  | Crear comentario/respuesta |
| DELETE | `/api/v1/reviews/:id`                   | JWT  | Eliminar comentario        |

**Crear Comentario:**

```json
{
  "content": "Excelente libro, muy recomendado",
  "parentId": "uuid" // omitir para comentario raíz, incluir para respuesta
}
```

**Respuesta (árbol):**

```json
{
  "id": "01HV...",
  "content": "Excelente libro",
  "userId": "uuid",
  "userName": "Juan",
  "userLastName": "Perez",
  "initials": "JP",
  "parentId": null,
  "createdAt": "2026-01-31T10:00:00Z",
  "children": [
    {
      "id": "01HW...",
      "content": "Totalmente de acuerdo",
      "userName": "Maria",
      "userLastName": "Gomez",
      "initials": "MG",
      "parentId": "01HV...",
      "children": []
    }
  ]
}
```

---

### Calificaciones (Ratings)

| Método | Endpoint                                  | Auth  | Descripción                  |
| ------ | ----------------------------------------- | ----- | ---------------------------- |
| POST   | `/api/v1/ratings/books/:bookId`           | JWT   | Calificar libro (toggle 1-5) |
| GET    | `/api/v1/ratings/books/:bookId/my-rating` | JWT   | Ver mi calificación          |
| GET    | `/api/v1/ratings/books/:bookId/summary`   | ADMIN | Ver promedio y total         |

**Calificar (POST):**

```json
{
  "rating": 4
}
```

**Toggle behavior:**

- Si ya tiene rating 4 y envía 4 → Elimina rating
- Si ya tiene rating 3 y envía 4 → Actualiza a 4
- Si no tiene rating → Crea nuevo

**Respuesta:**

```json
{
  "action": "created", // o "updated", "removed"
  "rating": 4
}
```

**Resumen (ADMIN):**

```json
{
  "average": 4.2,
  "total": 156
}
```

---

### Storage (Archivos)

| Método | Endpoint                       | Auth  | Descripción   |
| ------ | ------------------------------ | ----- | ------------- |
| POST   | `/api/v1/storage/upload/cover` | ADMIN | Subir portada |
| POST   | `/api/v1/storage/upload/book`  | ADMIN | Subir PDF     |

---

## Modelo de Datos

```prisma
// Usuarios (admin y estudiantes)
model User {
  id          String       @id @default(uuid())
  dni         String       @unique
  name        String
  lastName    String
  fullName    String
  password    String
  role        UserRole     @default(STUDENT)
  isActive    Boolean      @default(true)
  enrollments Enrollment[]
  reviews     Review[]
  ratings     BookRating[]
}

// Períodos académicos
model Period {
  id          String       @id @default(uuid())
  name        String       // "2026-I"
  startDate   DateTime
  endDate     DateTime
  isCurrent   Boolean      @default(false)
  enrollments Enrollment[]
}

// Matrículas (User - Period)
model Enrollment {
  id        String   @id @default(uuid())
  userId    String
  periodId  String
  canAccess Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id])
  period    Period   @relation(fields: [periodId], references: [id])
  @@unique([userId, periodId])
}

// Categorías
model Category {
  id    String @id @default(uuid())
  name  String
  slug  String @unique
  books Book[]
}

// Libros
model Book {
  id             String       @id @default(uuid())
  title          String
  author         String
  description    String?
  coverKey       String?      // Clave en MinIO/S3
  fileKey        String       // Clave en MinIO/S3
  isDownloadable Boolean      @default(false)
  categoryId     String
  category       Category     @relation(fields: [categoryId], references: [id])
  reviews        Review[]
  ratings        BookRating[]
}

// Comentarios
model Review {
  id       String  @id @default(uuid())
  content  String
  userId   String
  bookId   String
  parentId String?
  user     User    @relation(fields: [userId], references: [id])
  book     Book    @relation(fields: [bookId], references: [id])
  parent   Review?  @relation("ReviewReplies", fields: [parentId], references: [id])
  children Review[] @relation("ReviewReplies")
  createdAt DateTime @default(now())
}

// Calificaciones
model BookRating {
  id        String   @id @default(uuid())
  userId    String
  bookId    String
  rating    Int      // 1-5
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  book      Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  @@unique([userId, bookId])
}
```

## Roles de Usuario

| Rol     | Permisos                                                            |
| ------- | ------------------------------------------------------------------- |
| STUDENT | Matrícula, comentar libros, calificar libros, leer libros           |
| ADMIN   | CRUD completo de usuarios, categorías, períodos, matrículas, libros |

## Leer Libro (URL Firmada)

Solo usuarios con matrícula activa pueden leer libros:

```bash
GET /api/v1/books/:id/read
Authorization: Bearer <token>

# Respuesta
{
  "url": "https://...presigned-url...",
  "expiresAt": "2026-01-31T10:15:00Z"
}
```

La URL firmada dura 15 minutos por defecto.

## Depuración

```bash
# Ver logs en desarrollo
npm run start:dev

# Logs detallados (en código)
this.logger.log('Mensaje');
this.logger.error('Error');
this.logger.warn('Warning');
```

## Deployment

```bash
# Build
npm run build

# Production
npm run start:prod
```

## Recursos

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
