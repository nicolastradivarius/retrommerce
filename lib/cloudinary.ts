import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

function ensureCloudinaryConfigured() {
  if (isConfigured) return;

  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudinaryUrl) {
    const parsed = new URL(cloudinaryUrl);

    if (parsed.protocol !== 'cloudinary:') {
      throw new Error('Invalid CLOUDINARY_URL protocol; expected cloudinary://');
    }

    if (!parsed.hostname || !parsed.username || !parsed.password) {
      throw new Error('Invalid CLOUDINARY_URL format; expected cloudinary://api_key:api_secret@cloud_name');
    }

    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: parsed.username,
      api_secret: parsed.password,
      secure: true,
    });
  } else {
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary env vars missing: set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  isConfigured = true;
}

export async function uploadAvatarToCloudinary(options: {
  buffer: Buffer;
  userId: string;
}): Promise<{ url: string; publicId: string }> {
  const { buffer, userId } = options;

  ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'retrommerce/avatars',
        public_id: userId,
        overwrite: true,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
}
