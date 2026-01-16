//@ts-nocheck
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import s3Client from '../utils/s3';
import { config } from '../config/config';


interface UploadRequest extends Request {
  body: {
    folder?: string;
    name?: string;
  };
  file?: Express.Multer.File & {
    location?: string;
  };
}

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Use memory storage for multer
const storage = multer.memoryStorage();

// Create multer instance with memory storage
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware to handle S3 upload after multer
const handleS3Upload = async (req: UploadRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next();
    }

    const folder = req.body.folder || 'myfiles';
    const fileName = req.body.name ? 
      `${req.body.name}.${req.file.originalname.split('.').pop()}` : 
      req.file.originalname;

    const key = `live/${folder}/${fileName}`;

    const params = {
      Bucket: config.aws.bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read' as ObjectCannedACL,
    };

    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);

    if (response.$metadata.httpStatusCode === 200) {
      req.file.location = `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
      next();
    } else {
      throw new Error('Failed to upload to S3');
    }
  } catch (error) {
    next(error);
  }
};

// Export a function that combines multer and S3 upload
export const uploadToS3 = (fieldName: string) => [
  upload.single(fieldName),
  handleS3Upload
];
