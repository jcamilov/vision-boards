"use client";
import { useState, useEffect, useCallback } from "react";
import { CloudinaryContext, Image } from "cloudinary-react";
import Script from "next/script"; // Add this import

export default function ImageUploadAndSelect({
  handleImageSelected,
  initialImages = [],
}) {
  const [images, setImages] = useState(initialImages);
  const [uploadWidget, setUploadWidget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCloudinaryScript = async () => {
      if (typeof window !== "undefined" && !window.cloudinary) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://upload-widget.cloudinary.com/global/all.js";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      initializeWidget();
    };

    loadCloudinaryScript();
    fetchImages();
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
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]); // Ensure images is an empty array if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWidget = () => {
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
            handleImageSelected(result.info);
          }
        }
      );
      setUploadWidget(widget);
    }
  };

  const handleUpload = useCallback(() => {
    if (uploadWidget) {
      uploadWidget.open();
    } else {
      console.error("Upload widget is not initialized");
    }
  }, [uploadWidget]);

  const handleImageSelect = (image) => {
    console.log("handleImageSelect:", image);
    if (typeof handleImageSelected === "function") {
      handleImageSelected(image);
    } else {
      console.error("handleImageSelected is not a function");
    }
  };

  return (
    <CloudinaryContext
      cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
    >
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="beforeInteractive"
      />
      <div>
        <button onClick={handleUpload} className="btn btn-primary mr-4">
          Upload Image
        </button>
        {isLoading ? (
          <p>Loading images...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {images.map((image) => (
              <div
                key={image.public_id}
                onClick={() => handleImageSelected(image)}
              >
                <Image
                  publicId={image.public_id}
                  width="300"
                  height="200"
                  crop="fill"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </CloudinaryContext>
  );
}
