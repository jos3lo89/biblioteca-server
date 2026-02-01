import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '@/core/prisma/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prismaService: PrismaService;

  const mockPrisma = {
    book: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if book does not exist', async () => {
      mockPrisma.book.findUnique.mockResolvedValue(null);

      await expect(
        service.create('book-id', 'user-id', { content: 'Test comment' }),
      ).rejects.toThrow('Libro no encontrado');
    });

    it('should throw BadRequestException if parent comment is invalid', async () => {
      mockPrisma.book.findUnique.mockResolvedValue({ id: 'book-id' });
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.create('book-id', 'user-id', {
          content: 'Test comment',
          parentId: 'parent-id',
        }),
      ).rejects.toThrow('Comentario padre invalido');
    });

    it('should create a root comment successfully', async () => {
      mockPrisma.book.findUnique.mockResolvedValue({ id: 'book-id' });
      mockPrisma.user.findUnique.mockResolvedValue({
        name: 'Juan',
        lastName: 'Perez',
      });
      mockPrisma.review.create.mockResolvedValue({
        id: 'review-id',
        content: 'Test comment',
        userId: 'user-id',
        bookId: 'book-id',
        parentId: null,
        createdAt: new Date(),
      });

      const result = await service.create('book-id', 'user-id', {
        content: 'Test comment',
      });

      expect(result).toEqual({
        id: 'review-id',
        content: 'Test comment',
        userId: 'user-id',
        userName: 'Juan',
        userLastName: 'Perez',
        initials: 'JP',
        parentId: null,
        createdAt: expect.any(Date),
      });
    });

    it('should create a reply comment successfully', async () => {
      mockPrisma.book.findUnique.mockResolvedValue({ id: 'book-id' });
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'parent-id',
        bookId: 'book-id',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        name: 'Maria',
        lastName: 'Gomez',
      });
      mockPrisma.review.create.mockResolvedValue({
        id: 'review-id',
        content: 'Reply comment',
        userId: 'user-id',
        bookId: 'book-id',
        parentId: 'parent-id',
        createdAt: new Date(),
      });

      const result = await service.create('book-id', 'user-id', {
        content: 'Reply comment',
        parentId: 'parent-id',
      });

      expect(result.parentId).toBe('parent-id');
      expect(result.initials).toBe('MG');
    });
  });

  describe('findByBook', () => {
    it('should return reviews with tree structure', async () => {
      const mockReviews = [
        {
          id: 'root-id',
          content: 'Root comment',
          userId: 'user-id',
          bookId: 'book-id',
          parentId: null,
          createdAt: new Date(),
          user: { id: 'user-id', name: 'Juan', lastName: 'Perez' },
          children: [
            {
              id: 'child-id',
              content: 'Child comment',
              userId: 'user-id-2',
              bookId: 'book-id',
              parentId: 'root-id',
              createdAt: new Date(),
              user: { id: 'user-id-2', name: 'Maria', lastName: 'Gomez' },
              children: [],
            },
          ],
        },
      ];

      mockPrisma.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.findByBook('book-id');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('root-id');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].id).toBe('child-id');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if review does not exist', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(service.remove('review-id', 'user-id')).rejects.toThrow(
        'Comentario no encontrado',
      );
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-id',
        userId: 'other-user-id',
      });

      await expect(service.remove('review-id', 'user-id')).rejects.toThrow(
        'No puedes eliminar este comentario',
      );
    });

    it('should delete review successfully', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-id',
        userId: 'user-id',
      });
      mockPrisma.$transaction.mockResolvedValue([]);

      const result = await service.remove('review-id', 'user-id');

      expect(result).toEqual({ message: 'Comentario eliminado' });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
