/**
 * FeaturedImage Component
 * Displays featured images with proper aspect ratio handling and blurred background fill
 */

import { generateImageSrcset } from '@/lib/utils';

interface FeaturedImageProps {
  src: string;
  alt: string;
  imageSizes?: {
    [size: string]: {
      url: string;
      width: number;
      height: number;
    };
  };
}

export default function FeaturedImage({ src, alt, imageSizes }: FeaturedImageProps) {
  // Generate responsive image srcset if available
  const imageSrcset = generateImageSrcset(imageSizes);

  return (
    <div className="w-full h-48 md:h-96 bg-gray-200 relative overflow-hidden">
      {/* Blurred background image - behind foreground */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
          transform: 'scale(1.1)', // Scale up slightly to avoid edge artifacts from blur
        }}
        aria-hidden="true"
      />
      {/* Foreground image with proper aspect ratio - LCP element */}
      <div className="relative w-full h-full flex items-center justify-center z-10">
        <img
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          width="1200"
          height="675"
          srcSet={imageSrcset?.srcset}
          sizes={imageSrcset?.sizes}
          className="max-w-full max-h-full object-contain"
          style={{ aspectRatio: '16 / 9' }}
        />
      </div>
    </div>
  );
}

