import { cloudinary } from '../../config/cloudinary.js';

export const uploadImage = (buffer: Buffer): Promise<string> =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'lost-found',
        resource_type: 'image',
        transformation: [
          {
            width: 1200,
            crop: 'limit',
            quality: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('CLOUDINARY UPLOAD ERROR:', error);
          return reject(error);
        }

        if (!result) {
          console.error('CLOUDINARY UPLOAD: No result');
          return reject(new Error('Cloudinary returned no result'));
        }

        console.log('CLOUDINARY UPLOAD OK:', result.secure_url);

        resolve(result.secure_url);
      }
    ).end(buffer);
  });