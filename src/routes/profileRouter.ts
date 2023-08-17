import express from 'express';
import { userService } from '../modules';
import { endpoint } from '../core/endpoint';
import { multerUpload, handleMulterError } from '../middlewares';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';

const router = express.Router();

router.put(
  '/me',
  multerUpload.single('image'),
  handleMulterError,
  endpoint(async (req, res) => {
    const userId = req.user?.id;
    let image;
    if (req.file) {
      const localFilePath = req.file.path;
      const { isSuccess, imageURL } = await cloudinaryInstance.uploadImage(
        localFilePath,
      );
      if (!isSuccess) {
        throw new Error();
      }
      image = imageURL;
    }
    const updateUserSchema = userService.validateUpdateUserSchema.parse({
      ...req.body,
      image,
    });
    if (updateUserSchema.phone) {
      const isPhoneExist = await userService.findOne({
        phone: updateUserSchema.phone,
      });
      if (isPhoneExist) {
        throw new CustomError('Phone number already exist', 409);
      }
    }
    await userService.updateOne({ id: userId }, updateUserSchema);
    res
      .status(200)
      .json({ message: 'Updated data successfully', data: updateUserSchema });
  }),
);

export default router;
