"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import ImageUploadAndSelect from "@/components/image-upload-select";
import ModalGallery from "@/components/modal-gallery";
import Script from "next/script";
import { CloudinaryContext } from "cloudinary-react";
import { CldImage } from "next-cloudinary";
import axios from "axios";
import { config } from "@/config";
import DrawingCanvas from "@/components/DrawingCanvas";
import AdaptiveImage from "@/components/AdaptiveImage";

export default function Edit() {
  const [referenceImage, setReferenceImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadWidget, setUploadWidget] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [maskData, setMaskData] = useState(null);
  const [mode, setMode] = useState("generate");
  const canvasRef = useRef(null);

  // TODO: get user_id from auth
  const user_id = "user123";

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
      const response = await fetch(`/api/getImages?user_id=${user_id}`);
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

  const handleSaveToGallery = async () => {
    if (resultImage) {
      const formData = new FormData();
      formData.append("file", resultImage);
      formData.append("upload_preset", "my_upload_preset");
      formData.append("folder", `${user_id}/`); // Specify the folder in Cloudinary where you want to save the image

      try {
        const uploadResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );
        console.log("Image saved to gallery:", uploadResponse.data);
      } catch (error) {
        console.error("Error saving image to gallery:", error);
      }
    } else {
      console.warn("No image to save.");
    }
  };

  const handleImageSelected = (selectedImage) => {
    console.log("Selected image from edit page:", selectedImage);
    setReferenceImage(selectedImage);
    setIsModalOpen(false);
    // Handle the selected image (e.g., add to favorites, display details, etc.)
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleGoForIt = async () => {
    console.log("Reference Image:", referenceImage);
    console.log("Prompt:", prompt);
    console.log("Model:", config.text2image.model);

    setIsLoading(true);

    // Helper function to convert image to base64
    const toB64 = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    const modelParams =
      mode === "inpaint"
        ? {
            base64: false,
            guidance_scale: 3.5,
            image: await toB64(referenceImage.url),
            image_format: "jpeg",
            mask: await toB64(maskData),
            negative_prompt: "bad quality, painting, blur",
            num_inference_steps: 25,
            prompt: prompt,
            quality: 95,
            sampler: "euler",
            samples: 1,
            scheduler: "simple",
            seed: Math.floor(Math.random() * 1000000),
            strength: 0.9,
          }
        : {
            prompt: prompt,
            steps: 4,
            seed: Math.floor(Math.random() * 1000000),
            aspect_ratio: "1:1",
            base64: false,
          };

    try {
      const response = await fetch("/api/runModel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, modelParams }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      setResultImage(data.image);
    } catch (error) {
      console.error("Error generating or uploading image:", error);
      // Handle the error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseAsReference = async () => {
    if (!resultImage) {
      console.warn("No image to save.");
      return;
    }
    setReferenceImage(resultImage);

    // Upload to Cloudinary
    // const formData = new FormData();
    // formData.append("file", resultImage);
    // formData.append("upload_preset", "my_upload_preset"); // Replace with your actual upload preset name
    // //formData.append("folder", "upload"); // Specify the folder in Cloudinary where you want to save the image
    // const uploadResponse = await axios.post(
    //   `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    //   formData
    // );

    // if (uploadResponse.data && uploadResponse.data.secure_url) {
    //   setResultImage(uploadResponse.data.secure_url);
    //   console.log("Uploaded Image URL:", uploadResponse.data.secure_url);
    // } else {
    //   console.error("Upload failed:", uploadResponse.data);
    // }
    // if (uploadResponse.data && uploadResponse.data.secure_url) {
    //   const uploadedImageUrl = uploadResponse.data.secure_url;
    //   const urlParts = uploadedImageUrl.split("/");
    //   const publicIdWithExtension = urlParts[urlParts.length - 1];
    //   const publicId = publicIdWithExtension.split(".")[0];

    //   console.log("The url para la de referencia:", uploadedImageUrl);

    //   setReferenceImage({
    //     public_id: publicId,
    //     url: uploadedImageUrl,
    //     alt: "Uploaded image from Cloudinary",
    //   });
    // }
  };

  const handleToggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };

  const handleMaskComplete = (maskDataUrl) => {
    setMaskData(maskDataUrl);
  };

  const handleClearMask = () => {
    setMaskData(null);
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
    if (e.target.value === "inpaint") {
      setIsDrawingMode(true);
    } else {
      setIsDrawingMode(false);
    }
  };

  return (
    <>
      <CloudinaryContext
        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
      >
        <Script
          src="https://upload-widget.cloudinary.com/global/all.js"
          strategy="beforeInteractive"
        />
        <div>
          <label
            htmlFor="mode"
            className="block text-sm font-medium text-gray-700"
          >
            Mode
          </label>
          <select
            id="mode"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={mode}
            onChange={handleModeChange}
          >
            <option value="generate">Generate</option>
            <option value="inpaint">Inpaint</option>
          </select>
        </div>
        <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative w-full h-64">
              {referenceImage ? (
                <>
                  <div className="absolute inset-0">
                    <AdaptiveImage
                      src={referenceImage}
                      alt={referenceImage.alt || "Selected image"}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <DrawingCanvas
                    ref={canvasRef}
                    isActive={isDrawingMode}
                    onMaskComplete={handleMaskComplete}
                    className="absolute inset-0"
                    brushSize={50}
                  />
                </>
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
              <button
                className={`btn ${
                  isDrawingMode ? "btn-secondary" : "btn-primary"
                }`}
                onClick={handleToggleDrawingMode}
                disabled={!referenceImage}
              >
                {isDrawingMode ? "Disable Drawing" : "Enable Drawing"}
              </button>
              <button
                className="btn btn-warning"
                onClick={handleClearMask}
                disabled={!maskData}
              >
                Clear Mask
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
                <AdaptiveImage
                  src={resultImage}
                  alt="Result"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-gray-400">[image placeholder]</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-info"
                disabled={!resultImage}
                onClick={handleSaveToGallery}
              >
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
