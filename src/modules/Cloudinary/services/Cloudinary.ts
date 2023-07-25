import { v2 as cloudinary } from 'cloudinary';
import { unlinkSync } from 'fs';
import {
  cloudinaryAPIKey,
  cloudinaryCloudName,
  cloudinaryAPISecret,
} from '../../../config';

export class Cloudinary {
  constructor() {
    cloudinary.config({
      cloud_name: cloudinaryCloudName,
      api_key: cloudinaryAPIKey,
      api_secret: cloudinaryAPISecret,
    });
  }

  async uploadImage(imageToUpload: string) {
    try {
      const cloudinaryImageUploadResponseData =
        await cloudinary.uploader.upload(imageToUpload);

      const { url } = cloudinaryImageUploadResponseData;

      if (!url) {
        unlinkSync(imageToUpload);
        return {
          isSuccess: false,
          message:
            "Couldn't upload your image at the moment. Please try again later.",
          statusCode: 400,
        };
      }

      unlinkSync(imageToUpload);
      return {
        isSuccess: true,
        message: 'Successfully uploaded image.',
        statusCode: 200,
        imageURL: url,
      };
    } catch (error) {
      unlinkSync(imageToUpload);
      return {
        isSuccess: false,
        message: 'Internal Server Error',
        statusCode: 500,
      };
    }
  }
}

export const cloudinaryInstance = new Cloudinary();
