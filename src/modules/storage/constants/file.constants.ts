export const FILE_CONSTANTS = {
  COVER: {
    MAX_SIZE: 5 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    FOLDER: 'covers',
  },
  BOOK: {
    MAX_SIZE: 100 * 1024 * 1024,
    ALLOWED_TYPES: ['application/pdf'],
    FOLDER: 'books',
  },
  PRESIGNED_URL_EXPIRY: 15 * 60,
};
