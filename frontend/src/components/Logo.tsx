/**
 * Logo Component
 * Kingdom Training logo as SVG - can be styled with CSS
 * Text color can be controlled via the textColor prop
 */

import { useId } from 'react';

interface LogoProps {
  textColor?: string;
  className?: string;
  height?: number;
}

export default function Logo({ 
  textColor = 'currentColor', 
  className = '',
  height = 40
}: LogoProps) {
  // Calculate width based on height to maintain aspect ratio
  const width = (height / 40) * 240;
  const viewBox = `0 0 240 ${height}`;
  
  // Generate unique ID for gradient to avoid conflicts
  const gradientId = useId();
  
  return (
    <svg 
      className={className}
      viewBox={viewBox}
      width={width}
      height={height}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kingdom Training"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1c7f7f" />
          <stop offset="100%" stopColor="#2dbaba" />
        </linearGradient>
      </defs>
      
      {/* Teal triangular/A-shaped graphic - upward pointing with folded ribbon effect */}
      <path
        d="M5 35 L5 10 L15 0 L25 10 L25 35 L15 45 L5 35 Z"
        fill={`url(#${gradientId})`}
      />
      
      {/* KINGDOM text */}
      <text
        x="35"
        y="18"
        fontSize="14"
        fontWeight="600"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fill={textColor}
        textAnchor="start"
        letterSpacing="0.05em"
      >
        KINGDOM
      </text>
      
      {/* TRAINING text */}
      <text
        x="35"
        y="32"
        fontSize="14"
        fontWeight="600"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fill={textColor}
        textAnchor="start"
        letterSpacing="0.05em"
      >
        TRAINING
      </text>
    </svg>
  );
}

