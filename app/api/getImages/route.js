import { v2 as cloudinary } from "cloudinary";

export async function GET() {
  console.log("getImages API route called");

  try {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.api.resources({
      // type: "upload",
      // prefix: "your_folder_name", // replace with your folder name if applicable
      max_results: 10, // adjust as needed
      tags: true, // This ensures tags are included in the response
    });

    return Response.json(result.resources);
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return Response.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
