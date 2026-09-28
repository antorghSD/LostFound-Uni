import { cloudinary } from '../../config/cloudinary.js';

export const uploadImage = (buffer: Buffer): Promise<string> =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: 'lost-found', resource_type: 'image', transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }] },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });