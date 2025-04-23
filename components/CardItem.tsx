import { RiMusic2Fill } from "react-icons/ri";

import Link from "next/link";
import { useRef } from "react";

interface Image {
  url: string;
  height?: number;
  width?: number;
}

interface IProps {
  images: Image[];
  id: string;
  altTitle: string;
  heading: string;
  subheading?: string;
  imageRounded?: boolean;
  type: string;
}

export default function CardItem({
  images = [],
  id,
  altTitle,
  heading,
  subheading = "",
  imageRounded = false,
  type,
}: IProps) {
  const thumbnailRef = useRef<HTMLImageElement>(null);

  // Validate required props
  if (!id || !heading || !type) {
    console.error('CardItem: Missing required props');
    return null;
  }

  // Get the first valid image URL
  const imageUrl = images?.find(img => img?.url)?.url;

  return (
    <Link href={`/${type}/${id}`} passHref>
      <div className="transition duration-300 p-4 rounded cursor-pointer hover:bg-[#282828] bg-paper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={altTitle || heading}
            ref={thumbnailRef}
            className={`object-cover w-full h-36 ${
              imageRounded ? "rounded-full" : "rounded"
            }`}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
            }}
          />
        ) : (
          <div className="w-full h-40">
            <RiMusic2Fill className="w-full h-full bg-paper" />
          </div>
        )}
        <h3 className="mt-5 font-bold truncate">{heading}</h3>
        {subheading && (
          <h6 className="text-sm truncate text-gray">{subheading}</h6>
        )}
      </div>
    </Link>
  );
}
