'use client';

import React, { memo } from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
  showTagline?: boolean;
}

const AppLogo = memo(function AppLogo({
  size = 40,
  className = '',
  onClick,
  showTagline = false,
}: AppLogoProps) {
  return (
    <div
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      {/* PJ Herbal Clinic SVG Logo — leaf circle with PJ monogram */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="PJ Herbal Clinic Logo"
      >
        {/* Outer leaf-shaped circle */}
        <circle cx="40" cy="40" r="38" fill="#1b4d3e" />
        {/* Inner lighter ring */}
        <circle cx="40" cy="40" r="34" fill="#1b4d3e" stroke="#4e9f3d" strokeWidth="1.5" />
        {/* Leaf accent top-right */}
        <path
          d="M52 14 C62 18 68 28 64 40 C60 52 48 58 40 56 C50 50 58 40 52 14Z"
          fill="#4e9f3d"
          opacity="0.5"
        />
        {/* Leaf accent bottom-left */}
        <path
          d="M28 66 C18 62 12 52 16 40 C20 28 32 22 40 24 C30 30 22 40 28 66Z"
          fill="#4e9f3d"
          opacity="0.5"
        />
        {/* PJ Text */}
        <text
          x="40"
          y="47"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontWeight="bold"
          fontSize="26"
          fill="#ffffff"
          letterSpacing="-1"
        >PJ</text>
        {/* Bottom tagline arc */}
        <path
          id="tagline-arc"
          d="M 16 58 A 28 28 0 0 0 64 58"
          fill="none"
        />
        <text fontSize="5.5" fill="#d4af37" fontFamily="Arial, sans-serif" letterSpacing="0.5">
          <textPath href="#tagline-arc" startOffset="50%" textAnchor="middle">
            NATURAL CARE · BETTER LIFE
          </textPath>
        </text>
      </svg>

      {/* Optional tagline text beside logo */}
      {showTagline && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-extrabold text-[#1b4d3e] tracking-wide">PJHERBAL</span>
          <span className="text-[9px] font-semibold text-[#d4af37] tracking-widest uppercase">Natural Care · Better Life</span>
        </div>
      )}
    </div>
  );
});

export default AppLogo;
