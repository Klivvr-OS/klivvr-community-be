import express from 'express';
import { userService } from '../modules';
import { endpoint } from '../core/endpoint';
import { multerUpload } from '../middlewares';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';
import { handleMulterError } from '../middlewares';

const router = express.Router();

router.post(
  '/register',
  multerUpload.single('image'),
  handleMulterError,
  endpoint(async (req, res) => {
    let photoURL;
    if (req.file) {
      const localFilePath = req.file.path;
      const { isSuccess, imageURL } = await cloudinaryInstance.uploadImage(
        localFilePath,
      );
      if (!isSuccess) {
        throw new Error();
      }
      photoURL = imageURL;
    }
    const userScehma = userService.createUserSchema.parse({
      ...req.body,
      photoURL,
    });
    await userService.createOne(userScehma);
    res.status(201).json({
      message:
        'User created successfully, Please check your email for verification code',
    });
  }),
);

export default router;
