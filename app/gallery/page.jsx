"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, MoreHorizontal, Upload } from "lucide-react";
import { CloudinaryContext, Image } from "cloudinary-react";
import Script from "next/script";
import { toggleTag } from "../actions/tagActions";

export default function Gallery() {
  const [favorites, setFavorites] = useState(new Set());
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadWidget, setUploadWidget] = useState(null);

  useEffect(() => {
    // Fetch images from Cloudinary when the component mounts
    fetchImages();

    // Initialize the upload widget
    if (typeof window !== "undefined" && window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            console.log("Upload successful:", result.info);
            fetchImages();
          }
        }
      );
      setUploadWidget(widget);
    }
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/getImages");
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Received data is not an array:", data);
        setImages([]);
        return;
      }

      setImages(data);

      // Update favorites based on tags
      const newFavorites = new Set(
        data
          .filter((image) => image.tags && image.tags.includes("favorite"))
          .map((image) => image.public_id)
      );
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]); // Ensure images is an empty array if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      const isFavorite = !newFavorites.has(id);

      if (isFavorite) {
        newFavorites.add(id);
      } else {
        newFavorites.delete(id);
      }

      // Update tag on Cloudinary using server action
      toggleTag(id, "favorite", isFavorite)
        .then(() =>
          console.log(
            `Image ${id} ${
              isFavorite ? "marked as favorite" : "unmarked as favorite"
            }`
          )
        )
        .catch((error) => console.error("Error updating image tag:", error));

      return newFavorites;
    });
  };

  const handleUpload = useCallback(() => {
    if (uploadWidget) {
      uploadWidget.open();
    } else {
      console.error("Upload widget is not initialized");
    }
  }, [uploadWidget]);

  return (
    <CloudinaryContext
      cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
    >
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="beforeInteractive"
      />
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">Favorite Images</h1>
        <div className="flex items-center mb-4">
          <button onClick={handleUpload} className="btn btn-primary mr-4">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </button>
          <button
            onClick={() => (window.location.href = "/edit")}
            className="btn btn-primary"
          >
            Generate
          </button>
        </div>
        {isLoading ? (
          <p>Loading images...</p>
        ) : Array.isArray(images) && images.length === 0 ? (
          <p>No images found.</p>
        ) : Array.isArray(images) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.public_id} className="relative group">
                <Image
                  publicId={image.public_id}
                  alt={image.alt || "Uploaded image"}
                  className="w-full h-auto object-cover rounded-lg"
                />
                <button
                  onClick={() => toggleFavorite(image.public_id)}
                  className="absolute top-2 left-2 p-2 rounded-full bg-base-100 bg-opacity-50 hover:bg-opacity-75 transition-opacity"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      favorites.has(image.public_id)
                        ? "text-red-500 fill-current"
                        : "text-white"
                    }`}
                  />
                </button>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-circle btn-sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <a>Add to Album</a>
                      </li>
                      <li>
                        <a>Edit</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Error: Images data is not in the expected format.</p>
        )}
      </div>
    </CloudinaryContext>
  );
}
