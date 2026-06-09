/**
 * Cloudinary Helper Service
 * Uploads base64 or file buffers to Cloudinary using secure SDK or fallback dataURI in development
 */

export async function uploadToCloudinary(
  base64Data: string,
  folder: string = "warung-venty"
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary credentials missing. Falling back to local dataURI format.");
    return base64Data; // Fallback directly returns base64 image URI to avoid crash
  }

  type CloudinaryModule = typeof import("cloudinary");

  try {
    // Use dynamic import for cloudinary to keep server-side bundle light
    const cloudinaryModule = await import("cloudinary");
    const cloudinary = (cloudinaryModule as unknown as CloudinaryModule).v2;
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const res = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: "auto",
    });

    return res.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return base64Data;
  }
}
