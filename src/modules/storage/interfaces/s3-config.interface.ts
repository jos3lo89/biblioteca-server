export interface S3Config {
  endpoint: string;
  port: number;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

export interface PresignedUrlResult {
  url: string;
  expiresAt: Date;
}
