import { ErrorRequestHandler } from 'express';
import multer, { MulterError } from 'multer';

const multerStorage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, __dirname);
  },

  filename: (request, file, callback) => {
    callback(null, file.originalname);
  },
});

export const multerUpload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 5 * 1024 * 1024,
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

export const handleMulterError: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        status: 'error',
        message: 'File size is too large. Maximum limit is 5MB',
      });
    } else {
      res.status(415).json({
        status: 'error',
        message: 'Only .png, .jpg and .jpeg format allowed!',
      });
    }
  } else if (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};
