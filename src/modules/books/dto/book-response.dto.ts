export class BookResponseDto {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl: string;
  fileKey: string;
  isDownloadable: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}
