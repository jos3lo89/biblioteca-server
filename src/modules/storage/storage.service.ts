import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FILE_CONSTANTS } from './constants/file.constants';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly port: number;

  constructor(private readonly configService: ConfigService) {
    this.endpoint =
      this.configService.get<string>('S3_ENDPOINT') || 'http://localhost';
    this.port = this.configService.get<number>('S3_PORT') || 9000;

    const accessKey = this.configService.get<string>('S3_ACCESS_KEY');
    const secretKey = this.configService.get<string>('S3_SECRET_KEY');
    const region = this.configService.get<string>('S3_REGION') || 'us-east-1';

    this.s3Client = new S3Client({
      endpoint: `${this.endpoint}:${this.port}`,
      region: region,
      credentials:
        accessKey && secretKey
          ? { accessKeyId: accessKey, secretAccessKey: secretKey }
          : undefined,
      forcePathStyle: true,
    });

    this.bucket =
      this.configService.get<string>('S3_BUCKET') || 'biblioteca-books';
  }

  private getFullUrl(key: string): string {
    return `${this.endpoint}:${this.port}/${this.bucket}/${key}`;
  }

  getCoverUrl(coverKey: string): string {
    return this.getFullUrl(coverKey);
  }

  getBookUrl(bookKey: string): string {
    return this.getFullUrl(bookKey);
  }

  async getPresignedUrlForGet(
    key: string,
    expiresInSeconds: number = 86400, // 24 hours default for covers
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  async getCoverPresignedUrl(coverKey: string): Promise<string> {
    return this.getPresignedUrlForGet(coverKey, 86400); // 24 hours
  }

  async getBookPresignedUrl(bookKey: string): Promise<string> {
    return this.getPresignedUrlForGet(bookKey, 3600); // 1 hour for books
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ key: string; url: string }> {
    const key = `${folder}/${uuidv4()}-${Date.now()}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = this.getFullUrl(key);

    return { key, url };
  }

  async uploadCover(
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    this.validateFile(file, FILE_CONSTANTS.COVER);
    return this.uploadFile(file, FILE_CONSTANTS.COVER.FOLDER);
  }

  async uploadBook(
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    this.validateFile(file, FILE_CONSTANTS.BOOK);
    return this.uploadFile(file, FILE_CONSTANTS.BOOK.FOLDER);
  }

  async generatePresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async generateReadPresignedUrl(
    key: string,
  ): Promise<{ url: string; expiresAt: Date }> {
    const expirySeconds = FILE_CONSTANTS.PRESIGNED_URL_EXPIRY;
    const url = await this.generatePresignedUrl(key, expirySeconds);
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);

    return { url, expiresAt };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async deleteFiles(keys: string[]): Promise<void> {
    for (const key of keys) {
      try {
        await this.deleteFile(key);
      } catch (error) {
        this.logger.error(`Error deleting file ${key}: ${error.message}`);
      }
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  private validateFile(
    file: Express.Multer.File,
    config: typeof FILE_CONSTANTS.COVER,
  ): void {
    if (!file || !file.buffer) {
      throw new BadRequestException('Archivo no proporcionado o vacio');
    }

    if (file.size > config.MAX_SIZE) {
      throw new BadRequestException(
        `Archivo muy grande. Maximo ${config.MAX_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!config.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Tipos permitidos: ${config.ALLOWED_TYPES.join(', ')}`,
      );
    }
  }
}
