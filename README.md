# Biblioteca Server API

Backend para sistema de biblioteca digital con autenticación JWT, gestión de libros, comentarios jerárquicos, calificaciones y almacenamiento en MinIO/S3.

## Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación sin Docker](#instalación-sin-docker)
- [Instalación con Docker](#instalación-con-docker)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Modelo de Datos](#modelo-de-datos)
- [Roles y Permisos](#roles-y-permisos)
- [Comandos Útiles](#comandos-útiles)

---

## Descripción del Proyecto

Biblioteca Server es un backend desarrollado en NestJS que proporciona una API completa para la gestión de una biblioteca digital. Permite:

- **Autenticación**: Login/Logout con JWT almacenado en cookies HttpOnly
- **Gestión de Usuarios**: Perfiles de estudiantes y administradores
- **Catálogo de Libros**: CRUD de libros con portadas y archivos PDF
- **Categorías**: Organización de libros por materias
- **Períodos Académicos**: Gestión de ciclos escolares (ej: 2026-I)
- **Matrículas**: Control de acceso de estudiantes a libros
- **Comentarios**: Sistema de reviews jerárquicos (respuestas a respuestas)
- **Calificaciones**: Rating con estrellas (1-5) por libro
- **Dashboard**: Estadísticas para administradores

---

## Tecnologías

| Tecnología     | Propósito                                  |
| -------------- | ------------------------------------------ |
| **NestJS**     | Framework Node.js con TypeScript           |
| **TypeScript** | Tipado estático                            |
| **PostgreSQL** | Base de datos relacional                   |
| **Prisma ORM** | ORM para PostgreSQL                        |
| **MinIO/S3**   | Almacenamiento de archivos (PDF, portadas) |
| **JWT**        | Autenticación basada en tokens             |
| **Jest**       | Framework de testing                       |
| **Docker**     | Contenedores para servicios externos       |

---

## Requisitos

| Requisito      | Versión Mínima | Descripción                              |
| -------------- | -------------- | ---------------------------------------- |
| Node.js        | 20+            | Entorno de ejecución JavaScript          |
| PostgreSQL     | 15+            | Servidor de base de datos                |
| MinIO          | Latest         | Servidor de almacenamiento S3-compatible |
| npm/yarn       | Latest         | Gestor de paquetes                       |
| Docker         | Latest         | Contenedores (opcional)                  |
| Docker Compose | Latest         | Orquestación de contenedores (opcional)  |

---

## Instalación sin Docker

### 1. Instalar Dependencias

```bash
# Clonar el repositorio
git clone <repo-url>
cd biblioteca-server

# Instalar dependencias
npm install
```

### 2. Configurar Base de Datos PostgreSQL

Asegúrate de tener PostgreSQL corriendo y crea la base de datos:

```sql
CREATE DATABASE bibliotecadb;
```

### 3. Configurar MinIO

Instala MinIO o usa un servicio S3 compatible. Necesitarás:

- Endpoint: `http://localhost`
- Puerto API: `9000`
- Console: `9001`
- Bucket: `biblioteca-books`

### 4. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores (ver sección [Variables de Entorno](#variables-de-entorno)).

### 5. Generar Cliente Prisma y Migraciones

```bash
# Generar el cliente Prisma
npx prisma generate

# Ejecutar migraciones (crea las tablas)
npx prisma migrate dev

# (Opcional) Ver UI de Prisma Studio
npx prisma studio
```

### 6. Iniciar el Servidor

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servidor estará disponible en `http://localhost:5000`

---

## Instalación con Docker

### 1. Levantar Servicios de Infraestructura

El proyecto incluye un directorio `biblioteca-db` con Docker Compose para PostgreSQL, pgAdmin y MinIO:

```bash
cd biblioteca-db
docker compose up -d
```

### 2. Servicios Disponibles

| Servicio      | URL                   | Puerto |
| ------------- | --------------------- | ------ |
| PostgreSQL    | localhost             | 6000   |
| pgAdmin       | http://localhost:6001 | 6001   |
| MinIO API     | localhost             | 6002   |
| MinIO Console | http://localhost:6003 | 6003   |

### 3. Credenciales

**PostgreSQL:**

- Usuario: `rem`
- Contraseña: `rem123`
- Base de datos: `bibliotecadb`

**pgAdmin:**

- Email: `haru@rem.com`
- Contraseña: `rem123`

**MinIO:**

- Usuario: `adminbiblioteca`
- Contraseña: `biblio123456`

### 4. Crear Bucket en MinIO

Abre MinIO Console en `http://localhost:6003` y crea el bucket `biblioteca-books`.

### 5. Iniciar la Aplicación

```bash
# Desde el directorio principal
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# ============================================
# BASE DE DATOS
# ============================================
DATABASE_URL="postgresql://rem:rem123@localhost:6000/bibliotecadb?schema=public"

# ============================================
# SERVIDOR
# ============================================
NODE_ENV="development"
PORT=5000
API_PREFIX="api/v1"

# ============================================
# AUTENTICACIÓN JWT
# ============================================
JWT_SECRET="tu_jwt_secret_super_seguro_aqui"

# ============================================
# CORS
# ============================================
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"

# ============================================
# MINIO / S3
# ============================================
S3_ENDPOINT="http://localhost"
S3_PORT=6002
S3_ACCESS_KEY="adminbiblioteca"
S3_SECRET_KEY="biblio123456"
S3_BUCKET="biblioteca-books"
S3_REGION="us-east-1"

# ============================================
# LÍMITES DE SUBIDA
# ============================================
MAX_COVER_SIZE=5242880       # 5MB en bytes
MAX_BOOK_FILE_SIZE=104857600 # 100MB en bytes

# ============================================
# TIPOS DE ARCHIVOS PERMITIDOS
# ============================================
ALLOWED_COVER_TYPES="image/jpeg,image/png,image/webp"
ALLOWED_BOOK_TYPE="application/pdf"

# ============================================
# OTRAS CONFIGURACIONES
# ============================================
PRESIGNED_URL_EXPIRY_MINUTES=15
```

### Descripción de Cada Variable

| Variable                       | Descripción                          | Valor por Defecto |
| ------------------------------ | ------------------------------------ | ----------------- |
| `DATABASE_URL`                 | Connection string de PostgreSQL      | Requerido         |
| `NODE_ENV`                     | Entorno: development/production      | development       |
| `PORT`                         | Puerto del servidor                  | 5000              |
| `API_PREFIX`                   | Prefijo global de la API             | api/v1            |
| `JWT_SECRET`                   | Clave secreta para firmar JWTs       | Requerido         |
| `CORS_ORIGINS`                 | Origins permitidos para CORS         | localhost:5173    |
| `S3_ENDPOINT`                  | URL del servidor S3/MinIO            | http://localhost  |
| `S3_PORT`                      | Puerto del API S3                    | 6002              |
| `S3_ACCESS_KEY`                | Access key de S3                     | Requerido         |
| `S3_SECRET_KEY`                | Secret key de S3                     | Requerido         |
| `S3_BUCKET`                    | Bucket de S3 para archivos           | biblioteca-books  |
| `S3_REGION`                    | Región de S3                         | us-east-1         |
| `MAX_COVER_SIZE`               | Tamaño máximo de portadas            | 5MB               |
| `MAX_BOOK_FILE_SIZE`           | Tamaño máximo de PDFs                | 100MB             |
| `ALLOWED_COVER_TYPES`          | Tipos MIME para portadas             | jpeg, png, webp   |
| `ALLOWED_BOOK_TYPE`            | Tipos MIME para libros               | application/pdf   |
| `PRESIGNED_URL_EXPIRY_MINUTES` | Minutos de vigencia de URLs firmadas | 15                |

---

## Estructura del Proyecto

```
biblioteca-server/
├── src/
│   ├── main.ts                        # Punto de entrada
│   ├── app.module.ts                  # Módulo principal
│   ├── app.controller.ts              # Controlador raíz (health check)
│   ├── core/
│   │   └── prisma/
│   │       ├── prisma.module.ts       # Módulo Prisma
│   │       └── prisma.service.ts      # Servicio Prisma (cliente DB)
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── auth.decorator.ts      # @Auth() - Protege rutas
│   │   │   └── current-user.decorator.ts # @CurrentUser() - Usuario actual
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts      # Valida JWT
│   │   │   └── roles.guard.ts         # Verifica roles
│   │   └── interfaces/
│   │       └── current-user.interface.ts # Tipo CurrentUserI
│   ├── generated/
│   │   └── prisma/                    # Cliente Prisma generado
│   └── modules/
│       ├── auth/                      # Autenticación
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.module.ts
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   └── register.dto.ts
│       │   └── strategies/
│       │       └── jwt.strategy.ts
│       ├── users/                     # Gestión de usuarios
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── users.module.ts
│       │   └── dto/
│       │       ├── student-register.dto.ts
│       │       └── find-users-query.dto.ts
│       ├── categories/                # Categorías de libros
│       │   ├── categories.controller.ts
│       │   ├── categories.service.ts
│       │   ├── categories.module.ts
│       │   └── dto/
│       │       ├── created.dto.ts
│       │       └── find-category-query.dto.ts
│       ├── periods/                   # Períodos académicos
│       │   ├── periods.controller.ts
│       │   ├── periods.service.ts
│       │   ├── periods.module.ts
│       │   └── dto/
│       │       └── created.dto.ts
│       ├── enrollments/               # Matrículas
│       │   ├── enrollments.controller.ts
│       │   ├── enrollments.service.ts
│       │   ├── enrollments.module.ts
│       │   └── dto/
│       │       └── created.dto.ts
│       ├── books/                     # Libros
│       │   ├── books.controller.ts
│       │   ├── books.service.ts
│       │   ├── books.module.ts
│       │   └── dto/
│       │       ├── create-book.dto.ts
│       │       ├── book-response.dto.ts
│       │       └── find-books-query.dto.ts
│       ├── reviews/                   # Comentarios/Reseñas
│       │   ├── reviews.controller.ts
│       │   ├── reviews.service.ts
│       │   ├── reviews.module.ts
│       │   └── dto/
│       │       ├── create-review.dto.ts
│       │       └── review-response.dto.ts
│       ├── ratings/                   # Calificaciones
│       │   ├── ratings.controller.ts
│       │   ├── ratings.service.ts
│       │   ├── ratings.module.ts
│       │   └── dto/
│       │       ├── set-rating.dto.ts
│       │       └── rating-response.dto.ts
│       ├── dashboard/                 # Estadísticas
│       │   ├── dashboard.controller.ts
│       │   ├── dashboard.service.ts
│       │   └── dashboard.module.ts
│       └── storage/                   # Almacenamiento S3
│           ├── storage.service.ts
│           ├── storage.module.ts
│           ├── constants/
│           │   └── file.constants.ts
│           └── dto/
│               └── delete-file.dto.ts
├── prisma/
│   ├── schema.prisma                  # Definición del modelo de datos
│   └── seed.ts                        # Semilla de datos
├── biblioteca-db/
│   └── compose.yml                    # Docker Compose para servicios
├── test/
│   ├── jest-e2e.json                  # Configuración e2e
├── .env                               # Variables de entorno
├── .env.example                       # Ejemplo de .env
├── package.json
├── tsconfig.json
├── nest-cli.json
└── docker-compose.yml                 # Docker Compose alternativo
```

---

## Endpoints de la API

### Prefijo Base

Todos los endpoints tienen el prefijo: `/api/v1`

---

### Módulo: Autenticación

| Método | Endpoint                | Auth  | Descripción             |
| ------ | ----------------------- | ----- | ----------------------- |
| POST   | `/api/v1/auth/register` | ADMIN | Registrar nuevo usuario |
| POST   | `/api/v1/auth/login`    | No    | Iniciar sesión          |
| POST   | `/api/v1/auth/logout`   | JWT   | Cerrar sesión           |
| GET    | `/api/v1/auth/me`       | JWT   | Obtener usuario actual  |

#### Registrar Usuario (ADMIN)

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "dni": "12345678",
  "name": "Juan",
  "lastName": "Perez",
  "password": "password123",
  "role": "STUDENT" // o ADMIN
}
```

#### Iniciar Sesión

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "dni": "12345678",
  "password": "password123"
}
```

**Respuesta:** Cookie `Authentication` establecida (HttpOnly, 12 horas)

---

### Módulo: Usuarios

| Método | Endpoint                          | Auth  | Descripción             |
| ------ | --------------------------------- | ----- | ----------------------- |
| GET    | `/api/v1/users/profile`           | JWT   | Obtener perfil propio   |
| GET    | `/api/v1/users/:role/with-role`   | ADMIN | Listar usuarios por rol |
| POST   | `/api/v1/users/students/register` | ADMIN | Registrar estudiante    |

#### Obtener Perfil Propio

```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

**Respuesta:**

```json
{
  "id": "uuid",
  "dni": "12345678",
  "name": "Juan",
  "lastName": "Perez",
  "fullName": "Juan Perez",
  "role": "STUDENT"
}
```

#### Listar Usuarios por Rol

```http
GET /api/v1/users/STUDENT/with-role?page=1&limit=10
Authorization: Bearer <token_admin>
```

---

### Módulo: Categorías

| Método | Endpoint                 | Auth  | Descripción                  |
| ------ | ------------------------ | ----- | ---------------------------- |
| GET    | `/api/v1/categories`     | JWT   | Listar categorías (paginado) |
| GET    | `/api/v1/categories/all` | JWT   | Listar todas las categorías  |
| POST   | `/api/v1/categories`     | ADMIN | Crear categoría              |

#### Crear Categoría

```http
POST /api/v1/categories
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "name": "Matemáticas"
}
```

**Respuesta:**

```json
{
  "id": "uuid",
  "name": "Matemáticas",
  "slug": "matematicas",
  "createdAt": "2026-01-31T10:00:00Z"
}
```

---

### Módulo: Períodos Académicos

| Método | Endpoint                      | Auth  | Descripción                |
| ------ | ----------------------------- | ----- | -------------------------- |
| POST   | `/api/v1/periods`             | ADMIN | Crear período              |
| GET    | `/api/v1/periods`             | ADMIN | Listar períodos (paginado) |
| PATCH  | `/api/v1/periods/:id/current` | ADMIN | Marcar como actual         |

#### Crear Período

```http
POST /api/v1/periods
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "name": "2026-I",
  "startDate": "2026-01-01",
  "endDate": "2026-06-30"
}
```

#### Marcar Período como Actual

```http
PATCH /api/v1/periods/:id/current
Authorization: Bearer <token_admin>
```

---

### Módulo: Matrículas

| Método | Endpoint              | Auth  | Descripción       |
| ------ | --------------------- | ----- | ----------------- |
| POST   | `/api/v1/enrollments` | ADMIN | Crear matrícula   |
| GET    | `/api/v1/enrollments` | ADMIN | Listar matrículas |

#### Crear Matrícula

```http
POST /api/v1/enrollments
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "userId": "uuid-del-estudiante",
  "periodId": "uuid-del-periodo"
}
```

---

### Módulo: Libros

| Método | Endpoint                 | Auth  | Descripción             |
| ------ | ------------------------ | ----- | ----------------------- |
| GET    | `/api/v1/books`          | JWT   | Listar libros (filtros) |
| GET    | `/api/v1/books/:id`      | JWT   | Obtener libro           |
| POST   | `/api/v1/books`          | ADMIN | Crear libro             |
| DELETE | `/api/v1/books/:id`      | ADMIN | Eliminar libro          |
| GET    | `/api/v1/books/:id/read` | JWT   | URL firmada para leer   |

#### Listar Libros (Filtros)

```http
GET /api/v1/books?page=1&limit=10&categoryId=uuid&search=algebra
Authorization: Bearer <token>
```

#### Crear Libro (Multipart/Form-Data)

```http
POST /api/v1/books
Authorization: Bearer <token_admin>
Content-Type: multipart/form-data

Campos del formulario:
- title: string (requerido)
- author: string (requerido)
- description: string (opcional)
- categoryId: UUID (requerido)
- isDownloadable: boolean (opcional, default: false)
- cover: File (jpg, png, webp, max 5MB)
- file: File (PDF, max 100MB)
```

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

#### Leer Libro (URL Firmada)

```http
GET /api/v1/books/:id/read
Authorization: Bearer <token>

# Requiere matrícula activa en el período actual
```

**Respuesta:**

```json
{
  "url": "https://...presigned-url...",
  "expiresAt": "2026-01-31T10:15:00Z"
}
```

---

### Módulo: Comentarios (Reviews)

| Método | Endpoint                        | Auth | Descripción                |
| ------ | ------------------------------- | ---- | -------------------------- |
| GET    | `/api/v1/reviews/:bookId/books` | JWT  | Listar comentarios (árbol) |
| POST   | `/api/v1/reviews/:bookId/books` | JWT  | Crear comentario/respuesta |
| DELETE | `/api/v1/reviews/:id`           | JWT  | Eliminar comentario        |

#### Listar Comentarios (Estructura Jerárquica)

```http
GET /api/v1/reviews/:bookId/books
Authorization: Bearer <token>
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

#### Crear Comentario

```http
POST /api/v1/reviews/:bookId/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Excelente libro, muy recomendado",
  "parentId": "uuid" // omitir para comentario raíz, incluir para respuesta
}
```

---

### Módulo: Calificaciones (Ratings)

| Método | Endpoint                            | Auth  | Descripción              |
| ------ | ----------------------------------- | ----- | ------------------------ |
| POST   | `/api/v1/ratings/:bookId/books`     | JWT   | Calificar libro (toggle) |
| GET    | `/api/v1/ratings/:bookId/my-rating` | JWT   | Ver mi calificación      |
| GET    | `/api/v1/ratings/:bookId/summary`   | ADMIN | Ver promedio y total     |

#### Calificar Libro (Toggle)

```http
POST /api/v1/ratings/:bookId/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4
}
```

**Comportamiento Toggle:**

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

#### Ver Resumen (ADMIN)

```http
GET /api/v1/ratings/:bookId/summary
Authorization: Bearer <token_admin>
```

**Respuesta:**

```json
{
  "average": 4.2,
  "total": 156
}
```

---

### Módulo: Dashboard

| Método | Endpoint                  | Auth  | Descripción          |
| ------ | ------------------------- | ----- | -------------------- |
| GET    | `/api/v1/dashboard/stats` | ADMIN | Obtener estadísticas |

#### Estadísticas del Dashboard

```http
GET /api/v1/dashboard/stats
Authorization: Bearer <token_admin>
```

**Respuesta:**

```json
{
  "totalUsers": 150,
  "totalBooks": 45,
  "totalPeriods": 3,
  "totalEnrollments": 120
}
```

---

## Modelo de Datos

### Usuarios (Admin y Estudiantes)

```prisma
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
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum UserRole {
  ADMIN
  STUDENT
}
```

### Períodos Académicos

```prisma
model Period {
  id          String       @id @default(uuid())
  name        String       // "2026-I"
  startDate   DateTime
  endDate     DateTime
  isCurrent   Boolean      @default(false)
  enrollments Enrollment[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
```

### Matrículas (User - Period)

```prisma
model Enrollment {
  id        String   @id @default(uuid())
  userId    String
  periodId  String
  canAccess Boolean  @default(false) // false si debe dinero
  user      User     @relation(fields: [userId], references: [id])
  period    Period   @relation(fields: [periodId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, periodId]) // Un alumno solo una matrícula por período
}
```

### Categorías

```prisma
model Category {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  books     Book[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Libros

```prisma
model Book {
  id             String       @id @default(uuid())
  title          String
  author         String
  description    String?      @db.Text
  coverKey       String?      // Clave en MinIO/S3
  fileKey        String       // Clave en MinIO/S3
  isDownloadable Boolean      @default(false)
  categoryId     String
  category       Category     @relation(fields: [categoryId], references: [id])
  reviews        Review[]
  ratings        BookRating[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

### Comentarios (Reviews - Jerárquicos)

```prisma
model Review {
  id       String  @id @default(uuid())
  content  String
  userId   String
  bookId   String
  parentId String?

  user   User    @relation(fields: [userId], references: [id])
  book   Book    @relation(fields: [bookId], references: [id])
  parent Review?  @relation("ReviewReplies", fields: [parentId], references: [id])
  children Review[] @relation("ReviewReplies")

  createdAt DateTime @default(now())
}
```

### Calificaciones

```prisma
model BookRating {
  id        String   @id @default(uuid())
  userId    String
  bookId    String
  rating    Int      // 1-5
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  book Book @relation(fields: [bookId], references: [id], onDelete: Cascade)

  @@unique([userId, bookId]) // Un usuario solo puede calificar una vez por libro
}
```

---

## Roles y Permisos

| Rol         | Permisos                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| **STUDENT** | Ver perfil, matricularse en períodos, comentar libros, calificar libros, leer libros (con matrícula activa)     |
| **ADMIN**   | CRUD completo de usuarios, categorías, períodos, matrículas, libros, ver estadísticas, ver resúmenes de ratings |

---

## Comandos Útiles

### Desarrollo

```bash
# Iniciar con hot-reload
npm run start:dev

# Iniciar en modo debug
npm run start:debug

# Ver logs detallados
npm run start:dev
```

### Producción

```bash
# Compilar TypeScript
npm run build

# Iniciar producción
npm run start:prod
```

### Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Revertir última migración
npx prisma migrate rollback

# Ver UI de Prisma Studio
npx prisma studio

# Resetear base de datos (borra todo)
npx prisma migrate reset
```

### Testing

```bash
# Todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:cov

# Tests e2e
npm run test:e2e

# Test archivo específico
npm run test -- src/modules/auth/auth.service.spec.ts

# Test por nombre
npm run test -t "should be defined"
```

### Linting y Formato

```bash
# ESLint con auto-fix
npm run lint

# Prettier
npm run format
```

### Docker

```bash
# Levantar servicios (PostgreSQL, pgAdmin, MinIO)
cd biblioteca-db
docker compose up -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Detener y borrar volúmenes
docker compose down -v
```

---

## Recursos

- [Documentación NestJS](https://docs.nestjs.com)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación TypeScript](https://www.typescriptlang.org/docs)
- [Documentación MinIO](https://min.io/docs)
- [Documentación JWT](https://jwt.io)
