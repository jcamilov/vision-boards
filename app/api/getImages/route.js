import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "user_uploads/", // Adjust this to match your folder structure
      max_results: 100,
    });

    return new Response(JSON.stringify(result.resources), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch images" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
