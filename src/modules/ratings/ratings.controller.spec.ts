import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

describe('RatingsController', () => {
  let controller: RatingsController;
  let ratingsService: RatingsService;

  const mockRatingsService = {
    setRating: jest.fn(),
    getMyRating: jest.fn(),
    getSummary: jest.fn(),
  };

  const mockUser = {
    id: 'user-id',
    dni: '12345678',
    role: 'STUDENT',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [
        {
          provide: RatingsService,
          useValue: mockRatingsService,
        },
      ],
    }).compile();

    controller = module.get<RatingsController>(RatingsController);
    ratingsService = module.get<RatingsService>(RatingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('setRating', () => {
    it('should call ratingsService.setRating', async () => {
      mockRatingsService.setRating.mockResolvedValue({
        action: 'created',
        rating: 4,
      });

      const result = await controller.setRating('book-id', mockUser as any, {
        rating: 4,
      });

      expect(result).toEqual({ action: 'created', rating: 4 });
      expect(mockRatingsService.setRating).toHaveBeenCalledWith(
        'book-id',
        'user-id',
        { rating: 4 },
      );
    });
  });

  describe('getMyRating', () => {
    it('should call ratingsService.getMyRating', async () => {
      mockRatingsService.getMyRating.mockResolvedValue({ rating: 4 });

      const result = await controller.getMyRating('book-id', mockUser as any);

      expect(result).toEqual({ rating: 4 });
      expect(mockRatingsService.getMyRating).toHaveBeenCalledWith(
        'book-id',
        'user-id',
      );
    });
  });

  describe('getSummary', () => {
    it('should call ratingsService.getSummary', async () => {
      mockRatingsService.getSummary.mockResolvedValue({
        average: 4.2,
        total: 156,
      });

      const result = await controller.getSummary('book-id');

      expect(result).toEqual({ average: 4.2, total: 156 });
      expect(mockRatingsService.getSummary).toHaveBeenCalledWith('book-id');
    });
  });
});
