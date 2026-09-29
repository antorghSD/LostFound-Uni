import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
console.log(
  'CLD cloud:', process.env.CLOUDINARY_CLOUD_NAME,
  '| key:', process.env.CLOUDINARY_API_KEY,
  '| secretLen:', process.env.CLOUDINARY_API_SECRET?.length,
  '| hasURL:', !!process.env.CLOUDINARY_URL
);
cloudinary.api.ping()
  .then(() => console.log('CLD ping OK'))
  .catch((e) => console.error('CLD ping FAIL', e?.error?.message || e?.message));