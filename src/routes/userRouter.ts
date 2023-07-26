import express from 'express';
import { userService } from '../modules';
import { Prisma } from '@prisma/client';
import { multerUpload } from '../middlewares/Multer';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';
import { handleMulterError } from '../middlewares/Multer';
import { endpoint } from '../core/endpoint';

const DAY = 24 * 60 * 60 * 1000; // 1 Day

const router = express.Router();

router.post(
  '/register',
  endpoint(async (req, res) => {
    await userService.createOne(req.body as Prisma.UserUncheckedCreateInput);
    res.status(201).json({
      message:
        'User created successfully, Please check your email for verification code',
    });
  }),
);

//Verified User
router.post(
  '/verify',
  endpoint(async (req, res) => {
    const email = req.body.email;
    const verificationCode = req.body.verificationCode;
    await userService.checkVerificationCode({ email, verificationCode });
    res.status(200).json({
      message: 'User verified successfully',
      data: {
        isVerified: true,
      },
    });
  }),
);

//Login
router.post(
  '/login',
  endpoint(async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await userService.login({ email, password });
    res.cookie('accessToken', user.accessToken, {
      httpOnly: true,
      maxAge: DAY,
    });
    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      maxAge: 7 * DAY,
    });
    res.status(200).json({
      message: 'User logged in successfully',
    });
  }),
);

//Authenticated User
router.get(
  '/authenticated',
  endpoint(async (req, res) => {
    const accessToken = req.cookies['accessToken'];
    const user = await userService.authenticateUser(
      accessToken,
      'access_secret',
    );
    res.status(200).json({
      message: 'User authenticated successfully',
    });
  }),
);

//refresh token
router.post(
  '/refresh',
  endpoint(async (req, res) => {
    const refreshToken = req.cookies['refreshToken'];
    const accessToken = await userService.verifyRefreshToken(
      refreshToken,
      'refresh_secret',
    );
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: DAY,
    });
    res.status(200).json({
      message: 'Token refreshed successfully',
    });
  }),
);

//logout
router.post(
  '/logout',
  endpoint(async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({
      message: 'User logged out successfully',
    });
  }),
);

export default router;
