import express from 'express';
import { novuService, resetPasswordCodeService, userService } from '../modules';
import { multerUpload } from '../middlewares/Multer';
import { cloudinaryInstance } from '../modules/Cloudinary/services/Cloudinary';
import { handleMulterError } from '../middlewares/Multer';
import { endpoint } from '../core/endpoint';
import { secretAccessKey, secretRefreshKey } from '../config';
import { isAuth } from '../middlewares';

const router = express.Router();

router.post(
  '/register',
  multerUpload.single('image'),
  handleMulterError,
  endpoint(async (req, res) => {
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
    const userScehma = userService.createUserSchema.parse({
      ...req.body,
      image,
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
  '/resend-verification-code',
  endpoint(async (req, res) => {
    const email = userService.resendVerificationCodeSchema.parse(req.body);
    await userService.resendVerificationCode(email);
    res.status(200).json({ message: 'Verification code sent successfully' });
  }),
);

router.post(
  '/login',
  endpoint(async (req, res) => {
    const userScehma = userService.loginUserSchema.parse(req.body);
    const { email, password } = userScehma;
    const isVerifiedUser = await userService.findOne({ email });
    if (isVerifiedUser?.isVerified === false) {
      res
        .status(401)
        .json({ message: 'Unauthorized ', data: { isVerified: false } });
      return;
    }
    const user = await userService.login({ email, password });

    res.status(200).json({
      message: 'User logged in successfully',
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      accessTokenExpiryDate: user.accessTokenExpiryDate,
      refreshTokenExpiryDate: user.refreshTokenExpiryDate,
    });
  }),
);

router.get(
  '/authenticated',
  endpoint(async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1] as string;
    await userService.authenticateUser(accessToken, secretAccessKey);
    res.status(200).json({ message: 'User authenticated successfully' });
  }),
);

router.post(
  '/refresh',
  endpoint((req, res) => {
    const refreshToken = req.headers.authorization?.split(' ')[1] as string;
    const token = userService.verifyRefreshToken(
      refreshToken,
      secretRefreshKey,
    );

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: token.accessToken,
      accessTokenExpiryDate: token.accessTokenExpiryDate,
    });
  }),
);

router.post(
  '/reset-password-request',
  endpoint(async (req, res) => {
    const validatedBody =
      resetPasswordCodeService.resetPasswordRequestSchema.parse(req.body);
    await resetPasswordCodeService.resetPasswordRequest(validatedBody.email);
    res.status(200).json({
      message:
        'If the email address is registered, a password reset link will be sent shortly.',
    });
  }),
);

router.post(
  '/reset-password',
  endpoint(async (req, res) => {
    const validatedBody = resetPasswordCodeService.resetPasswordSchema.parse(
      req.body,
    );
    const { email, password, resetPasswordCode } = validatedBody;
    await resetPasswordCodeService.resetPassword(
      email,
      password,
      resetPasswordCode,
    );
    res.status(200).json({ message: 'Password reset successfully' });
  }),
);

router.post(
  '/logout',
  isAuth,
  endpoint(async (req, res) => {
    const userId = req.user?.id as number;
    await novuService.removeFcmDeviceToken(userId.toString());
    res.status(200).json({ message: 'User logged out successfully' });
  }),
);

export default router;
