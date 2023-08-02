import express from 'express';
import { userService } from '../modules';
import { endpoint } from '../core/endpoint';
import { multerUpload, handleMulterError, isAuth } from '../middlewares';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';

const router = express.Router();

router.put(
  '/me',
  isAuth,
  multerUpload.single('avatar'),
  handleMulterError,
  endpoint(async (req, res) => {
    const userId = req.user?.id;
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
    const updateUserSchema = userService.validateUpdateUserSchema.parse({
      ...req.body,
      photoURL,
    });
    await userService.updateOne({ id: userId }, updateUserSchema);
    res
      .status(200)
      .json({ message: 'Updated data successfully', data: updateUserSchema });
  }),
);

export default router;
