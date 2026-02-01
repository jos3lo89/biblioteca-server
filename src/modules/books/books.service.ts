import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { StorageService } from '@/modules/storage/storage.service';
import { CreateBookDto } from './dto/create-book.dto';
import { FindBooksQueryDto } from './dto/find-books-query.dto';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async createBook(
    dto: CreateBookDto,
    coverFile: Express.Multer.File,
    bookFile: Express.Multer.File,
  ) {
    let coverKey: string | null = null;
    let bookKey: string | null = null;

    try {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoria no encontrada');
      }

      const coverResult = await this.storageService.uploadCover(coverFile);
      coverKey = coverResult.key;

      const bookResult = await this.storageService.uploadBook(bookFile);
      bookKey = bookResult.key;

      const validatedCoverKey = coverKey!;
      const validatedBookKey = bookKey!;

      const book = await this.prisma.$transaction(async (tx) => {
        return tx.book.create({
          data: {
            title: dto.title,
            author: dto.author,
            description: dto.description,
            categoryId: dto.categoryId,
            isDownloadable: dto.isDownloadable,
            coverKey: validatedCoverKey,
            fileKey: validatedBookKey,
          },
        });
      });

      this.logger.log(`Libro creado: ${book.id} - ${book.title}`);

      console.log('libro creado wadafa: ', book);

      return {
        ...book,
        coverUrl: book.coverKey
          ? await this.storageService.getCoverPresignedUrl(book.coverKey)
          : null,
      };
    } catch (error) {
      this.logger.error(
        `Error creando libro, realizando rollback: ${error.message}`,
      );

      if (coverKey) {
        try {
          await this.storageService.deleteFile(coverKey);
          this.logger.log(`Eliminado cover: ${coverKey}`);
        } catch (e) {
          this.logger.error(`Error eliminando cover: ${e.message}`);
        }
      }

      if (bookKey) {
        try {
          await this.storageService.deleteFile(bookKey);
          this.logger.log(`Eliminado libro: ${bookKey}`);
        } catch (e) {
          this.logger.error(`Error eliminando libro: ${e.message}`);
        }
      }

      throw error;
    }
  }

  async findAll(query: FindBooksQueryDto) {
    const { page = 1, limit = 5, search, category } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {};
    // A. Si hay búsqueda por texto (Título o Autor)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    // B. Si hay filtro por categoría (Slug)
    if (category) {
      where.category = {
        slug: category, // Prisma filtrará por la relación category -> slug
      };
    }

    // const where: Prisma.BookWhereInput = search
    //   ? {
    //       OR: [
    //         { title: { contains: search, mode: 'insensitive' } },
    //         { author: { contains: search, mode: 'insensitive' } },
    //       ],
    //     }
    //   : {};

    const [total, books] = await this.prisma.$transaction([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          _count: {
            select: {
              reviews: true,
              ratings: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const lastPage = Math.ceil(total / limit);
    const next = page < lastPage ? page + 1 : null;
    const prev = page > 1 ? page - 1 : null;

    const data = await Promise.all(
      books.map(async (book) => ({
        ...book,
        coverUrl: book.coverKey
          ? await this.storageService.getCoverPresignedUrl(book.coverKey)
          : null,
      })),
    );

    return {
      data,
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

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    return {
      ...book,
      coverUrl: book.coverKey
        ? await this.storageService.getCoverPresignedUrl(book.coverKey)
        : null,
    };
  }

  async remove(id: string) {
    const book = await this.prisma.book.findUnique({
      where: {
        id,
      },
    });

    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    try {
      const bookDelete = await this.prisma.book.delete({
        where: { id },
      });

      await this.storageService.deleteFile(bookDelete.fileKey);
      if (bookDelete.coverKey) {
        await this.storageService.deleteFile(bookDelete.coverKey);
      }
    } catch (error) {
      this.logger.error(
        `Error eliminando archivos del storage: ${error.message}`,
      );
    }

    return { message: 'Libro eliminado' };
  }

  async readBook(bookId: string) {
    const book = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    const saveUrl = await this.storageService.generateReadPresignedUrl(
      book.fileKey,
    );

    return saveUrl;
  }
}
