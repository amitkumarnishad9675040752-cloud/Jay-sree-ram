import React from 'react';

interface FFLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FFLogo: React.FC<FFLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]"
      >
        <defs>
          <linearGradient id="ffGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="ffFlameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="40%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
          <linearGradient id="ffShieldBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a1205" />
            <stop offset="100%" stopColor="#0f0502" />
          </linearGradient>
        </defs>

        {/* Outer Shield Border */}
        <polygon
          points="50,4 92,20 82,76 50,96 18,76 8,20"
          fill="url(#ffShieldBg)"
          stroke="url(#ffGoldGrad)"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Wing accents */}
        <path d="M14 26 Q35 24 45 42 Q30 46 18 36 Z" fill="url(#ffFlameGrad)" opacity="0.9" />
        <path d="M86 26 Q65 24 55 42 Q70 46 82 36 Z" fill="url(#ffFlameGrad)" opacity="0.9" />

        {/* Central Flame Crest */}
        <path
          d="M50 14 Q60 32 57 48 Q50 62 50 78 Q50 62 43 48 Q40 32 50 14 Z"
          fill="url(#ffFlameGrad)"
        />

        {/* Stylized Bold "FF" Text */}
        <path
          d="M30 32 H52 M30 32 V66 M30 48 H46"
          stroke="url(#ffGoldGrad)"
          strokeWidth="6.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          d="M52 35 H70 M52 35 V69 M52 51 H66"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
    </div>
  );
};
