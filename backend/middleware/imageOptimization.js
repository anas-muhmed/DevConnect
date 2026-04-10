const sharp = require('sharp');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

let s3Client;

const getS3Client = () => {
  if (s3Client) return s3Client;

  if (!process.env.AWS_REGION) {
    throw new Error('Missing AWS_REGION environment variable');
  }

  // No explicit credentials — AWS SDK automatically uses EC2 IAM Role
  s3Client = new S3Client({ region: process.env.AWS_REGION });

  return s3Client;
};

const getS3Url = (key) => {
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

/**
 * Middleware to optimize uploaded images
 * Compresses images, resizes to reasonable dimensions, and generates thumbnails
 */
const optimizeImage = async (req, res, next) => {
  // Only process if a file was uploaded
  if (!req.file) {
    return next();
  }

  const file = req.file;

  // Only process image files
  if (!file.mimetype.startsWith('image/')) {
    return next();
  }

  try {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 10);
    const optimizedKey = `uploads/optimized_${timestamp}_${randomPart}.jpg`;
    const thumbnailKey = `uploads/thumb_${timestamp}_${randomPart}.jpg`;

    // Process main image: Resize to max 1200px width, compress to 80% quality
    const optimizedBuffer = await sharp(file.buffer)
      .resize(1200, null, {
        fit: 'inside',
        withoutEnlargement: true // Don't upscale small images
      })
      .jpeg({
        quality: 80,
        progressive: true // Better web performance
      })
      .toBuffer();

    // Process thumbnail: Resize to 300px width, compress to 75% quality
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(300, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 75,
        progressive: true
      })
      .toBuffer();

    const client = getS3Client();

    await Promise.all([
      client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: optimizedKey,
        Body: optimizedBuffer,
        ContentType: 'image/jpeg',
      })),
      client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
      })),
    ]);

    // Update req.file to point to optimized S3 object
    req.file.filename = optimizedKey.split('/').pop();
    req.file.location = getS3Url(optimizedKey);

    // Store thumbnail info in req for optional use
    req.thumbnail = {
      filename: thumbnailKey.split('/').pop(),
      location: getS3Url(thumbnailKey)
    };

    console.log(`✅ Image optimized and uploaded to S3: ${optimizedKey}`);
    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    return next(new Error('Image upload failed. Please try again.'));
  }
};

module.exports = optimizeImage;
