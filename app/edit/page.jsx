"use client";
import { useState, useEffect, useCallback } from "react";
import ImageUploadAndSelect from "@/components/image-upload-select";
import { Upload } from "lucide-react";
import ModalGallery from "@/components/modal-gallery"; // Add this import
import Script from "next/script";
import { CloudinaryContext, Image, Transformation } from "cloudinary-react";
import { CldImage } from "next-cloudinary";

export default function Edit() {
  const [referenceImage, setReferenceImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          uploadSignatureTimestamp: Date.now(),
          uploadSignature: (callback, paramsToSign) => {
            fetch("/api/generateSignature", {
              method: "GET",
            })
              .then((res) => res.json())
              .then(({ signature, timestamp, ...otherParams }) => {
                callback({ signature, timestamp, ...otherParams });
              });
          },
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            console.log("Upload successful:", result.info);
            // Set the uploaded image as the reference image
            setReferenceImage({
              public_id: result.info.public_id,
              url: result.info.secure_url,
              alt: result.info.original_filename,
            });
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
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]); // Ensure images is an empty array if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = useCallback(() => {
    if (uploadWidget) {
      uploadWidget.open();
    } else {
      console.error("Upload widget is not initialized");
    }
  }, [uploadWidget]);

  const handleImageSelected = (selectedImage) => {
    console.log("Selected image from edit page:", selectedImage);

    // Add Cloudinary transformations to the URL
    const transformedUrl = selectedImage.url.replace(
      "/upload/",
      "/upload/c_fill,g_auto,f_auto,q_auto/"
    );

    setReferenceImage({
      ...selectedImage,
      url: transformedUrl,
    });
    setIsModalOpen(false);
    // Handle the selected image (e.g., add to favorites, display details, etc.)
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleGoForIt = () => {
    console.log("Reference Image:", referenceImage);
    console.log("Prompt:", prompt);
    // Here you would typically call an API to generate the image
    // For now, we'll just set a placeholder
    setResultImage("/placeholder.svg?height=400&width=600");
  };

  const handleUseAsReference = () => {
    if (resultImage) {
      setReferenceImage(resultImage);
    }
  };
  {
    /* <ImageUploadAndSelect handleImageSelected={handleImageSelected} /> */
  }

  return (
    <>
      <p>Cloud Name: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}</p>
      <CloudinaryContext
        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
      >
        <Script
          src="https://upload-widget.cloudinary.com/global/all.js"
          strategy="beforeInteractive"
        />
        <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative w-full h-64">
              {referenceImage ? (
                // <Image
                //   src={referenceImage.url}
                //   alt={referenceImage.alt || "Selected image"}
                //   fill
                //   style={{ objectFit: "cover" }}
                //   sizes="100vw"
                //   priority
                // />
                <CldImage
                  src={referenceImage.public_id}
                  alt={referenceImage.alt || "Selected image"}
                  fill
                  crop="fill"
                  gravity="auto:subject"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">[image placeholder]</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={handleImageUpload}>
                Upload
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(true)}
              >
                Select from gallery
              </button>
            </div>
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-gray-700"
              >
                Describe what you want your image to be
              </label>
              <textarea
                id="prompt"
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Add your multiline text prompt here..."
                value={prompt}
                onChange={handlePromptChange}
              ></textarea>
            </div>
            <button
              className="btn btn-accent w-full"
              onClick={handleGoForIt}
              disabled={!prompt}
            >
              Go for it!
            </button>
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-96 flex items-center justify-center">
              {resultImage ? (
                <img
                  src={resultImage}
                  alt="Result"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-gray-400">[image placeholder]</span>
              )}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-info" disabled={!resultImage}>
                Save to gallery
              </button>
              <button
                className="btn btn-success"
                onClick={handleUseAsReference}
                disabled={!resultImage}
              >
                Use as reference image
              </button>
            </div>
          </div>
          {isModalOpen && (
            <ModalGallery
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            >
              <ImageUploadAndSelect handleImageSelected={handleImageSelected} />
            </ModalGallery>
          )}
        </div>
      </CloudinaryContext>
    </>
  );
}
