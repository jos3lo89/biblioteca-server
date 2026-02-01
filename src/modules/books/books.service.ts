import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { StorageService } from '@/modules/storage/storage.service';
import { CreateBookDto } from './dto/create-book.dto';

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

      const book = await this.prisma.$transaction(async (tx) => {
        return tx.book.create({
          data: {
            title: dto.title,
            author: dto.author,
            description: dto.description,
            categoryId: dto.categoryId,
            isDownloadable: dto.isDownloadable,
            coverUrl: coverResult.url,
            fileKey: bookResult.key,
          },
        });
      });

      this.logger.log(`Libro creado: ${book.id} - ${book.title}`);

      return book;
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

  async findAll() {
    return this.prisma.book.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    return book;
  }

  async remove(id: string) {
    const book = await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.book.delete({ where: { id } });
    });

    try {
      await this.storageService.deleteFile(book.fileKey);
      if (book.coverUrl) {
        const coverKey = book.coverUrl.split('/').pop();
        if (coverKey) {
          await this.storageService.deleteFile(coverKey);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error eliminando archivos del storage: ${error.message}`,
      );
    }

    return { message: 'Libro eliminado' };
  }
}
