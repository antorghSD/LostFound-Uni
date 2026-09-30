import { cloudinary } from '../../config/cloudinary.js';

export const uploadImage = (buffer: Buffer): Promise<string> =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'lost-found',
      },
      (error, result) => {
        if (error) {
          console.error('CLOUDINARY UPLOAD ERROR:', error);
          return reject(error);
        }

        if (!result) {
          console.error('CLOUDINARY NO RESULT');
          return reject(new Error('Cloudinary returned no result'));
        }

        console.log('CLOUDINARY UPLOAD SUCCESS:', result.secure_url);

        resolve(result.secure_url);
      }
    ).end(buffer);
  });