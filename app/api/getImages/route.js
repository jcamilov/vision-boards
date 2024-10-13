import { v2 as cloudinary } from "cloudinary";

export async function GET(request) {
  console.log("getImages API route called");

  try {
    // Extract user_id from the request URL
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");

    // Validate user_id
    if (!user_id) {
      return Response.json({ error: "user_id is required" }, { status: 400 });
    }

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.api.resources({
      max_results: 10, // adjust as needed
      tags: true, // This ensures tags are included in the response
      type: "upload", // Specify the type of resource
      prefix: `${user_id}/`, // Use user_id as the folder prefix
    });

    return Response.json(result.resources);
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return Response.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
