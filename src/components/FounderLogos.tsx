import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface FounderLogoProps {
  size?: number;
  className?: string;
}

/**
 * Executive Heraldic Insignia & Crest for Bamlak Sisay
 * Co-Founder & Product Lead | Agro-Tech Entrepreneur & Ecosystem Architect
 * Themes: Emerald Gold Foliage, Digital Agriculture Node, Precision Escrow Monogram
 */
export const BamlakSisayLogo: React.FC<FounderLogoProps> = ({ size = 64, className = '' }) => {
  return (
    <div className={`relative group shrink-0 ${className}`} style={{ width: size, height: size }}>
      {/* Dynamic Ambient Emerald Backglow */}
      <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-600/40 via-teal-500/30 to-amber-400/30 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition-all duration-300" />

      {/* Main SVG Crest Emblem */}
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full relative z-10 drop-shadow-xl transition-all duration-300 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deep Obsidian-Emerald Radial Surface */}
          <radialGradient id="bs_surface" cx="40%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="45%" stopColor="#022c22" />
            <stop offset="100%" stopColor="#03120e" />
          </radialGradient>

          {/* Premium Aurum / Gold Foil Gradient */}
          <linearGradient id="bs_gold_foil" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* Vibrant Emerald Crystal Gradient */}
          <linearGradient id="bs_emerald_crystal" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>

          {/* Frosted Specular Glare */}
          <linearGradient id="bs_glare" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Beveled Squircle Shield */}
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="32"
          fill="url(#bs_surface)"
          stroke="url(#bs_gold_foil)"
          strokeWidth="3.2"
        />

        {/* Concentric Precision Calibration Ring */}
        <rect
          x="12"
          y="12"
          width="96"
          height="96"
          rx="26"
          stroke="#10b981"
          strokeWidth="1"
          strokeOpacity="0.45"
          strokeDasharray="4 3"
        />

        {/* Top Glare Sheen Layer */}
        <rect x="7" y="7" width="106" height="54" rx="30" fill="url(#bs_glare)" />

        {/* Heraldic Crown: Agricultural Sprout Star */}
        <g transform="translate(60, 25)">
          <path
            d="M0 -9 C2 -3, 6 -1, 10 0 C6 1, 2 3, 0 9 C-2 3, -6 1, -10 0 C-6 -1, -2 -3, 0 -9 Z"
            fill="url(#bs_gold_foil)"
          />
          <circle cx="0" cy="0" r="2.2" fill="#10b981" />
        </g>

        {/* Monogram Typography: Architectural 'B' */}
        <path
          d="M32 38 H52 C60.5 38 65 42 65 47.5 C65 51.5 62.8 54.2 59 55.8 C64 57.5 66.8 61 66.8 66.8 C66.8 73.8 61.2 78.5 51.8 78.5 H32 V38 Z M41 53.2 H50.8 C54.5 53.2 56.8 51.2 56.8 48 C56.8 44.8 54.5 43.2 50.8 43.2 H41 V53.2 Z M41 73.2 H51.8 C56 73.2 58.5 71 58.5 67 C58.5 63 56 60.8 51.8 60.8 H41 V73.2 Z"
          fill="url(#bs_gold_foil)"
        />

        {/* Monogram Typography: Interlocking Dynamic 'S' */}
        <path
          d="M86 48 C83.5 41.5 76.5 38 68.5 38 C58.5 38 54 43 54 48 C54 55 64 57 72 59.2 C80.5 61.8 86.5 65.5 86.5 73.5 C86.5 82.5 78.2 87 67.8 87 C57.2 87 49.5 81.5 47 74 L55.5 70.8 C57.2 75.8 61.8 79.5 67.8 79.5 C73.5 79.5 78 76.8 78 72.8 C78 67.5 71.5 65.8 63.5 63.5 C55 61 46 57.5 46 49 C46 40.5 54.5 34 67.5 34 C76 34 82.8 38 85.5 44 L77.5 47.2 C75.8 43.5 72.2 41.2 67.5 41.2 C62.5 41.2 58.8 43.5 58.8 47.2 C58.8 51 63.5 52.8 70.5 54.8 C78.8 57.2 88 61 88 71 C88 72.8 87.5 74.5 86.6 76 L86 48 Z"
          fill="url(#bs_emerald_crystal)"
          opacity="0.95"
        />

        {/* Botanical Foundation Laurel Arc */}
        <path
          d="M30 94 Q60 106 90 94"
          stroke="url(#bs_gold_foil)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="45" cy="99.5" r="2.2" fill="#34d399" />
        <circle cx="60" cy="101" r="2.8" fill="#fef08a" />
        <circle cx="75" cy="99.5" r="2.2" fill="#34d399" />
      </svg>

      {/* Verified Founder Badge Pin */}
      <div
        className="absolute -bottom-1 -right-1 z-20 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-full p-1.5 border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform"
        title="Verified Founding Partner & Product Lead"
      >
        <ShieldCheck className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

/**
 * Executive Systems Insignia & Crest for Besufkad Anbes
 * Co-Founder & Systems Architect | Fintech & Scaled Distributed Systems Engineer
 * Themes: Obsidian Sapphire Plate, Distributed Lattice Node, Precision Cyber Monogram
 */
export const BesufkadAnbesLogo: React.FC<FounderLogoProps> = ({ size = 64, className = '' }) => {
  return (
    <div className={`relative group shrink-0 ${className}`} style={{ width: size, height: size }}>
      {/* Dynamic Ambient Cobalt-Sapphire Backglow */}
      <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600/40 via-cyan-500/30 to-indigo-500/30 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition-all duration-300" />

      {/* Main SVG Crest Emblem */}
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full relative z-10 drop-shadow-xl transition-all duration-300 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deep Obsidian-Sapphire Radial Surface */}
          <radialGradient id="ba_surface" cx="40%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#172554" />
            <stop offset="45%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#050a14" />
          </radialGradient>

          {/* Platinum / Titanium Edge Gradient */}
          <linearGradient id="ba_platinum" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Cyber Electric Cyan Gradient */}
          <linearGradient id="ba_electric_cyan" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>

          {/* Frosted Specular Glare */}
          <linearGradient id="ba_glare" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Beveled Squircle Shield */}
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="32"
          fill="url(#ba_surface)"
          stroke="url(#ba_electric_cyan)"
          strokeWidth="3.2"
        />

        {/* Concentric Precision Circuit Grid */}
        <rect
          x="12"
          y="12"
          width="96"
          height="96"
          rx="26"
          stroke="#38bdf8"
          strokeWidth="1"
          strokeOpacity="0.45"
          strokeDasharray="4 3"
        />

        {/* Top Glare Sheen Layer */}
        <rect x="7" y="7" width="106" height="54" rx="30" fill="url(#ba_glare)" />

        {/* Distributed Consensus Lattice Header */}
        <g transform="translate(60, 24)">
          <path
            d="M-18 0 L-6 0 M6 0 L18 0 M0 -8 L0 -2 M0 2 L0 8"
            stroke="#38bdf8"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="0" cy="0" r="3" fill="#38bdf8" />
          <circle cx="-18" cy="0" r="2" fill="#7dd3fc" />
          <circle cx="18" cy="0" r="2" fill="#7dd3fc" />
          <circle cx="0" cy="-8" r="1.8" fill="#ffffff" />
        </g>

        {/* Monogram Typography: Architectural 'B' */}
        <path
          d="M28 38 H48 C56 38 60.5 41.8 60.5 47 C60.5 50.8 58.5 53.5 55 55 C59.8 56.6 62.5 60 62.5 65.5 C62.5 72.2 57.2 76.5 48.5 76.5 H28 V38 Z M36.5 52.8 H46.5 C50.2 52.8 52.5 51 52.5 47.8 C52.5 44.8 50.2 43.2 46.5 43.2 H36.5 V52.8 Z M36.5 71.5 H47.5 C51.5 71.5 54 69.5 54 65.5 C54 61.8 51.5 59.8 47.5 59.8 H36.5 V71.5 Z"
          fill="url(#ba_platinum)"
        />

        {/* Monogram Typography: High-Precision Angular 'A' */}
        <path
          d="M74 38 L58 76.5 H66.8 L70.2 68.2 H86.2 L89.6 76.5 H98.5 L82.5 38 H74 Z M78.2 48.8 L83.5 61.8 H73 L78.2 48.8 Z"
          fill="url(#ba_electric_cyan)"
        />

        {/* Distributed High-Throughput Bus & Node Arc */}
        <path
          d="M28 92 H46 L52 97 H68 L74 92 H92"
          stroke="url(#ba_electric_cyan)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="52" cy="97" r="2.4" fill="#38bdf8" />
        <circle cx="68" cy="97" r="2.4" fill="#7dd3fc" />
        <circle cx="60" cy="97" r="2.8" fill="#ffffff" />
      </svg>

      {/* Verified Systems Architect Pin */}
      <div
        className="absolute -bottom-1 -right-1 z-20 bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-full p-1.5 border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform"
        title="Verified Founding Partner & Systems Architect"
      >
        <Sparkles className="w-4 h-4 text-cyan-300" />
      </div>
    </div>
  );
};
