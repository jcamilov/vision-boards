// this component allows us to use either a Cloudinary image or a regular image to be displayed
import { CldImage } from "next-cloudinary";
import Image from "next/image";

const AdaptiveImage = ({ src, alt, sizes, style, className, ...props }) => {
  // Check if the src is a Cloudinary public_id
  const isCloudinaryImage = typeof src === "object" && src.public_id;

  const commonProps = {
    alt: alt || (isCloudinaryImage ? src.alt : "Image"),
    sizes,
    style: {
      ...style,
      objectFit: "contain",
      maxWidth: "100%",
      maxHeight: "100%",
    },
    className: `w-auto h-auto max-w-full max-h-full ${className || ""}`,
    ...props,
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {isCloudinaryImage ? (
        <CldImage src={src.public_id} {...commonProps} />
      ) : (
        <Image src={src} {...commonProps} />
      )}
    </div>
  );
};

export default AdaptiveImage;
