import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export function uploadBufferToCloudinary(buffer, folder = '') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const readable = Readable.from(buffer);
    readable.pipe(stream);
  });
}
