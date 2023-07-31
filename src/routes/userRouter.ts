import express from 'express';
import { userService } from '../modules';
import { multerUpload } from '../middlewares/Multer';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';
import { handleMulterError } from '../middlewares/Multer';
import { endpoint } from '../core/endpoint';
import { secretAccessKey, secretRefreshKey } from '../config';

const DAY = 24 * 60 * 60 * 1000; // 1 Day

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

router.post(
  '/verify',
  endpoint(async (req, res) => {
    const userScehma = userService.verifyUserSchema.parse(req.body);
    const { email, verificationCode } = userScehma;
    await userService.checkVerificationCode({ email, verificationCode });
    res.status(200).json({
      message: 'User verified successfully',
      data: { isVerified: true },
    });
  }),
);

router.post(
  '/login',
  endpoint(async (req, res) => {
    const userScehma = userService.loginUserSchema.parse(req.body);
    const { email, password } = userScehma;
    const user = await userService.login({ email, password });
    res.cookie('accessToken', user.accessToken, {
      httpOnly: true,
      maxAge: DAY,
    });
    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      maxAge: 7 * DAY,
    });
    res.status(200).json({ message: 'User logged in successfully' });
  }),
);

router.get(
  '/authenticated',
  endpoint(async (req, res) => {
    const cookies: unknown = req.cookies;
    const accessToken = (cookies as { accessToken: string }).accessToken;
    await userService.authenticateUser(accessToken, secretAccessKey);
    res.status(200).json({ message: 'User authenticated successfully' });
  }),
);

router.post(
  '/refresh',
  endpoint((req, res) => {
    const cookies: unknown = req.cookies;
    const refreshToken = (cookies as { refreshToken: string }).refreshToken;
    const accessToken = userService.verifyRefreshToken(
      refreshToken,
      secretRefreshKey,
    );
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: DAY,
    });
    res.status(200).json({ message: 'Token refreshed successfully' });
  }),
);

router.post(
  '/logout',
  endpoint((req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'User logged out successfully' });
  }),
);

export default router;
