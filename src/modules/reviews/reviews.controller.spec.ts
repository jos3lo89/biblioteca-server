import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: ReviewsService;

  const mockReviewsService = {
    create: jest.fn(),
    findByBook: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: 'user-id',
    dni: '12345678',
    role: 'STUDENT',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    reviewsService = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getByBook', () => {
    it('should return reviews for a book', async () => {
      const mockReviews = [
        {
          id: 'review-id',
          content: 'Great book',
          userId: 'user-id',
          userName: 'Juan',
          userLastName: 'Perez',
          initials: 'JP',
          parentId: null,
          createdAt: new Date(),
          children: [],
        },
      ];

      mockReviewsService.findByBook.mockResolvedValue(mockReviews);

      const result = await controller.getByBook('book-id');

      expect(result).toEqual(mockReviews);
      expect(mockReviewsService.findByBook).toHaveBeenCalledWith('book-id');
    });
  });

  describe('create', () => {
    it('should create a new review', async () => {
      const mockReview = {
        id: 'review-id',
        content: 'Test comment',
        userId: 'user-id',
        userName: 'Juan',
        userLastName: 'Perez',
        initials: 'JP',
        parentId: null,
        createdAt: new Date(),
      };

      mockReviewsService.create.mockResolvedValue(mockReview);

      const result = await controller.create('book-id', mockUser as any, {
        content: 'Test comment',
      });

      expect(result).toEqual(mockReview);
      expect(mockReviewsService.create).toHaveBeenCalledWith(
        'book-id',
        'user-id',
        { content: 'Test comment' },
      );
    });

    it('should create a reply to a comment', async () => {
      const mockReply = {
        id: 'reply-id',
        content: 'Reply comment',
        userId: 'user-id',
        userName: 'Maria',
        userLastName: 'Gomez',
        initials: 'MG',
        parentId: 'parent-id',
        createdAt: new Date(),
      };

      mockReviewsService.create.mockResolvedValue(mockReply);

      const result = await controller.create('book-id', mockUser as any, {
        content: 'Reply comment',
        parentId: 'parent-id',
      });

      expect(result.parentId).toBe('parent-id');
    });
  });

  describe('remove', () => {
    it('should remove a review', async () => {
      mockReviewsService.remove.mockResolvedValue({
        message: 'Comentario eliminado',
      });

      const result = await controller.remove('review-id', mockUser as any);

      expect(result).toEqual({ message: 'Comentario eliminado' });
      expect(mockReviewsService.remove).toHaveBeenCalledWith(
        'review-id',
        'user-id',
      );
    });
  });
});
