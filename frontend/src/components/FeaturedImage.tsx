/**
 * FeaturedImage Component
 * Displays featured images with proper aspect ratio handling and blurred background fill
 */

interface FeaturedImageProps {
  src: string;
  alt: string;
}

export default function FeaturedImage({ src, alt }: FeaturedImageProps) {
  return (
    <div className="w-full h-48 md:h-96 bg-gray-200 relative overflow-hidden">
      {/* Blurred background image */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
          transform: 'scale(1.1)', // Scale up slightly to avoid edge artifacts from blur
        }}
        aria-hidden="true"
      />
      
      {/* Foreground image with proper aspect ratio */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
}

