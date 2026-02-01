import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { PrismaService } from '@/core/prisma/prisma.service';

describe('RatingsService', () => {
  let service: RatingsService;
  let prismaService: PrismaService;

  const mockPrisma = {
    bookRating: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setRating', () => {
    it('should create a new rating', async () => {
      mockPrisma.bookRating.findUnique.mockResolvedValue(null);
      mockPrisma.bookRating.create.mockResolvedValue({
        id: 'rating-id',
        userId: 'user-id',
        bookId: 'book-id',
        rating: 4,
        createdAt: new Date(),
      });

      const result = await service.setRating('book-id', 'user-id', {
        rating: 4,
      });

      expect(result).toEqual({ action: 'created', rating: 4 });
      expect(mockPrisma.bookRating.create).toHaveBeenCalledWith({
        data: { userId: 'user-id', bookId: 'book-id', rating: 4 },
      });
    });

    it('should remove rating if same rating is given', async () => {
      mockPrisma.bookRating.findUnique.mockResolvedValue({
        id: 'rating-id',
        rating: 4,
      });

      const result = await service.setRating('book-id', 'user-id', {
        rating: 4,
      });

      expect(result).toEqual({ action: 'removed', rating: 0 });
      expect(mockPrisma.bookRating.delete).toHaveBeenCalledWith({
        where: { id: 'rating-id' },
      });
    });

    it('should update rating if different rating is given', async () => {
      mockPrisma.bookRating.findUnique.mockResolvedValue({
        id: 'rating-id',
        rating: 3,
      });
      mockPrisma.bookRating.update.mockResolvedValue({
        id: 'rating-id',
        rating: 5,
      });

      const result = await service.setRating('book-id', 'user-id', {
        rating: 5,
      });

      expect(result).toEqual({ action: 'updated', rating: 5 });
      expect(mockPrisma.bookRating.update).toHaveBeenCalledWith({
        where: { id: 'rating-id' },
        data: { rating: 5 },
      });
    });
  });

  describe('getMyRating', () => {
    it('should return null if no rating exists', async () => {
      mockPrisma.bookRating.findUnique.mockResolvedValue(null);

      const result = await service.getMyRating('book-id', 'user-id');

      expect(result).toEqual({ rating: null });
    });

    it('should return rating if it exists', async () => {
      mockPrisma.bookRating.findUnique.mockResolvedValue({
        rating: 4,
      });

      const result = await service.getMyRating('book-id', 'user-id');

      expect(result).toEqual({ rating: 4 });
    });
  });

  describe('getSummary', () => {
    it('should return average and total ratings', async () => {
      mockPrisma.bookRating.aggregate.mockResolvedValue({
        _avg: { rating: 4.2 },
        _count: { rating: 156 },
      });

      const result = await service.getSummary('book-id');

      expect(result).toEqual({ average: 4.2, total: 156 });
    });

    it('should return zero values if no ratings', async () => {
      mockPrisma.bookRating.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { rating: 0 },
      });

      const result = await service.getSummary('book-id');

      expect(result).toEqual({ average: 0, total: 0 });
    });
  });
});
