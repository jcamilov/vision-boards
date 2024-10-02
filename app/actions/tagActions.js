"use server";

import { v2 as cloudinary } from "cloudinary";

// Move this configuration inside the toggleTag function
// to ensure it's run in the server environment each time the action is called
function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function toggleTag(publicId, tag, isAdding) {
  // Configure Cloudinary for each request
  configureCloudinary();

  try {
    if (isAdding) {
      // Add tag
      await cloudinary.uploader.add_tag(tag, [publicId]);
    } else {
      // Remove tag
      await cloudinary.uploader.remove_tag(tag, [publicId]);
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating image tag:", error);
    throw new Error(`Failed to update image tag: ${error.message}`);
  }
}
