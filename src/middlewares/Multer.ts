import { ErrorRequestHandler } from 'express';
import multer, { MulterError } from 'multer';
import { CustomError } from './errorHandling';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MBs

export const multerUpload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (request, file, callback) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      callback(null, true);
    } else {
      const error = new MulterError('LIMIT_UNEXPECTED_FILE');
      callback(error);
    }
  },
});

export const handleMulterError: ErrorRequestHandler = (
  err,
  _req,
  _res,
  _next,
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      throw new CustomError(
        'File size is too large. Maximum limit is 5MB',
        413,
      );
    } else {
      throw new CustomError('Only .png, .jpg and .jpeg format allowed!', 415);
    }
  } else if (err) {
    throw new Error();
  }
};
