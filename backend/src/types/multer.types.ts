import { Request } from 'express';

export interface MulterFile extends Express.Multer.File {
  location?: string;
}

export interface RequestWithFile extends Request {
  file?: MulterFile;
}

export interface RequestWithFiles extends Request {
  files?: MulterFile[];
}