import React, { useState, useEffect } from 'react';

const GramSuvidhaAnimatedLogo = ({ size = "normal" }) => {
  const [typedText, setTypedText] = useState("");
  const [showTagline, setShowTagline] = useState(false);
  const fullText = "GRAM SUVIDHA";

  useEffect(() => {
    // Start typing title after house begins drawing (approx 800ms delay)
    const typingTimer = setTimeout(() => {
      let currentLength = 0;
      const interval = setInterval(() => {
        if (currentLength < fullText.length) {
          currentLength++;
          setTypedText(fullText.slice(0, currentLength));
        } else {
          clearInterval(interval);
          setShowTagline(true);
        }
      }, 80);
      return () => clearInterval(interval);
    }, 850);

    return () => clearTimeout(typingTimer);
  }, []);

  const sizeClasses = size === "small" 
    ? "w-48 h-auto" 
    : "w-full h-auto max-w-3xl mx-auto";

  return (
    <div className={`flex justify-center items-center select-none ${sizeClasses}`}>
      <svg 
        viewBox="0 0 850 240" 
        className="w-full h-auto"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          /* Keyframe Animations */
          @keyframes drawOutline {
            to { stroke-dashoffset: 0; }
          }
          @keyframes buildBlock {
            from { opacity: 0; transform: scale(0.7) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes growLeaflet {
            from { opacity: 0; transform: scale(0) rotate(-15deg); }
            to { opacity: 1; transform: scale(1) rotate(0deg); }
          }
          @keyframes slideRight {
            from { transform: translateX(-300px); }
            to { transform: translateX(0px); }
          }
          @keyframes pulseLight {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          @keyframes orbitSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          /* Animation Classes */
          .anim-house-line {
            stroke-dasharray: 240;
            stroke-dashoffset: 240;
            animation: drawOutline 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .anim-house-base {
            stroke-dasharray: 180;
            stroke-dashoffset: 180;
            animation: drawOutline 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s;
          }
          .anim-house-solid {
            animation: buildBlock 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.6s;
          }
          .anim-leaflet {
            transform-origin: center;
            animation: growLeaflet 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .anim-flow {
            animation: slideRight 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards 0.4s;
          }
          .anim-orbit {
            transform-origin: 730px 120px;
            animation: orbitSpin 20s linear infinite;
          }
        `}</style>

        <defs>
          {/* Gradients conforming strictly to #0F4B70 (primary) and #C4F8FF (light secondary) */}
          <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F4B70" />
            <stop offset="60%" stopColor="#256e9c" />
            <stop offset="100%" stopColor="#C4F8FF" />
          </linearGradient>

          <linearGradient id="lightIceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4F8FF" />
            <stop offset="100%" stopColor="#0F4B70" />
          </linearGradient>

          <linearGradient id="houseRoofGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F4B70" />
            <stop offset="100%" stopColor="#C4F8FF" />
          </linearGradient>

          {/* Liquid flow slider clip paths */}
          <clipPath id="flowClip">
            <rect x="50" y="30" width="220" height="190" />
          </clipPath>
          
          <clipPath id="slideClip">
            <rect className="anim-flow" x="50" y="30" width="300" height="200" />
          </clipPath>
        </defs>

        {/* ========================================== */}
        {/* SYMBOL EMBLEM GROUP (x: 50 - 270, y: 30-220)*/}
        {/* ========================================== */}

        {/* Staggered grow leaflets on left side */}
        <g id="leftLeaves">
          {/* Stem path */}
          <path d="M 105,185 Q 75,150 82,100" stroke="#0F4B70" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Leaflets scaled in from bottom to top */}
          <path className="anim-leaflet" style={{ animationDelay: '0.4s', opacity: 0 }} d="M 92,175 C 82,170 77,160 87,155 C 95,160 94,170 92,175 Z" fill="#C4F8FF" stroke="#0F4B70" strokeWidth="1" />
          <path className="anim-leaflet" style={{ animationDelay: '0.55s', opacity: 0 }} d="M 85,160 C 75,153 72,143 82,138 C 90,142 90,152 85,160 Z" fill="#C4F8FF" stroke="#0F4B70" strokeWidth="1" />
          <path className="anim-leaflet" style={{ animationDelay: '0.7s', opacity: 0 }} d="M 80,142 C 70,135 68,125 78,120 C 86,124 86,134 80,142 Z" fill="#C4F8FF" stroke="#0F4B70" strokeWidth="1" />
          <path className="anim-leaflet" style={{ animationDelay: '0.85s', opacity: 0 }} d="M 80,123 C 72,115 72,105 81,102 C 88,106 87,116 80,123 Z" fill="#C4F8FF" stroke="#0F4B70" strokeWidth="1" />
          <path className="anim-leaflet" style={{ animationDelay: '1.0s', opacity: 0 }} d="M 83,105 C 78,96 80,88 87,88 C 92,92 90,100 83,105 Z" fill="#C4F8FF" stroke="#0F4B70" strokeWidth="1" />
        </g>

        {/* Staggered grow leaflets on right side */}
        <g id="rightLeaves">
          {/* Stem path */}
          <path d="M 185,185 Q 215,150 208,100" stroke="#0F4B70" strokeWidth="2.5" strokeLinecap="round" />
          
          <path className="anim-leaflet" style={{ animationDelay: '0.4s', opacity: 0 }} d="M 198,175 C 208,170 213,160 203,155 C 195,160 196,170 198,175 Z" fill="#C4F8FF" stroke="#0F4B70" strokeWidth="1" />
          <path className="anim-leaflet" style={{ animationDelay: '0.55s', opacity: 0 }} d="M 205,160 C 215,153 218,143 208,138 C 200,142 200,152 205,160 Z" fill="#C4F8FF" stroke="#0F4B70" strokeWidth="1" />
          <path className="anim-leaflet" style={{ animationDelay: '0.7s', opacity: 0 }} d="M 210,142 C 220,135 222,125 212,120 C 204,124 204,134 210,142 Z" fill="#C4F8FF" stroke="#0F4B70" strokeWidth="1" />
          <path className="anim-leaflet" style={{ animationDelay: '0.85s', opacity: 0 }} d="M 210,123 C 218,115 218,105 209,102 C 202,106 203,116 210,123 Z" fill="#C4F8FF" stroke="#0F4B70" strokeWidth="1" />
          <path className="anim-leaflet" style={{ animationDelay: '1.0s', opacity: 0 }} d="M 207,105 C 212,96 210,88 203,88 C 198,92 200,100 207,105 Z" fill="#C4F8FF" stroke="#0F4B70" strokeWidth="1" />
        </g>

        {/* Liquid flows (Overlapping 3D Gradient ribbons, sliding through clip mask) */}
        <g clipPath="url(#slideClip)">
          {/* Primary wave ribbon (Strict #0F4B70 to #C4F8FF) */}
          <path 
            d="M 60,165 C 100,210 150,210 185,160 C 205,130 215,95 235,70 C 215,90 200,120 180,140 C 150,170 110,170 75,145 Z" 
            fill="url(#primaryGrad)" 
            opacity="0.9"
          />
          {/* Secondary wave ribbon (Strict #C4F8FF to #0F4B70) */}
          <path 
            d="M 75,175 C 115,225 170,225 210,175 C 225,155 228,135 225,115 C 220,130 212,145 200,158 C 170,195 125,195 90,160 Z" 
            fill="url(#lightIceGrad)" 
            opacity="0.8"
          />
          {/* Wave arrow head indicator */}
          <path d="M 222,122 L 226,114 L 234,119" stroke="#0F4B70" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* HOUSE ARCHITECTURE (Constructing dynamically) */}
        <g id="houseStructure">
          {/* Chimney block */}
          <rect 
            className="anim-house-solid" 
            style={{ opacity: 0 }}
            x="170" 
            y="80" 
            width="12" 
            height="22" 
            fill="#0F4B70" 
          />

          {/* House Roof (Bold vector gradient line) */}
          <path 
            className="anim-house-line"
            d="M 105,125 L 145,85 L 185,125" 
            stroke="url(#houseRoofGrad)" 
            strokeWidth="6.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* House Base Walls */}
          <path 
            className="anim-house-base"
            d="M 118,125 L 118,172 L 172,172 L 172,125" 
            stroke="#0F4B70" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Central circle window (window of the house / citizen node) */}
          <circle 
            className="anim-house-solid"
            style={{ opacity: 0 }}
            cx="145" 
            cy="138" 
            r="8.5" 
            fill="url(#primaryGrad)" 
          />
        </g>

        {/* Small floating sparkles (digital stars) */}
        <path className="anim-leaflet" style={{ animationDelay: '1.2s', opacity: 0 }} d="M 198,75 L 200,79 L 204,80.5 L 200,82 L 198,86 L 196,82 L 192,80.5 L 196,79 Z" fill="#C4F8FF" />
        <path className="anim-leaflet" style={{ animationDelay: '1.4s', opacity: 0 }} d="M 148,68 L 149.5,71.5 L 153.5,72.5 L 149.5,73.5 L 148,77 L 146.5,73.5 L 142.5,72.5 L 146.5,71.5 Z" fill="#C4F8FF" />


        {/* ========================================== */}
        {/* LOGO TEXT PANEL (x: 290 - 680)             */}
        {/* ========================================== */}

        {/* Title: GRAM SUVIDHA (Letter by letter) */}
        <text 
          x="290" 
          y="120" 
          fill="#C4F8FF" 
          fontSize="48" 
          fontFamily="'Cinzel', serif" 
          fontWeight="900" 
          letterSpacing="2"
          className="font-black"
        >
          {typedText}
        </text>

        {/* Subtitle: DIGITALIZING RURAL INDIA */}
        <text 
          x="293" 
          y="158" 
          fill="#C4F8FF" 
          fontSize="15" 
          fontFamily="'Montserrat', sans-serif" 
          fontWeight="bold" 
          letterSpacing="6.5"
          opacity="0.8"
          className="transition-all duration-1000 ease-out transform"
          style={{
            opacity: showTagline ? 0.85 : 0,
            transform: showTagline ? 'translateY(0px)' : 'translateY(12px)'
          }}
        >
          DIGITALIZING RURAL INDIA
        </text>


        {/* ========================================== */}
        {/* INTEL AI EMBLEM RING (x: 690 - 820)        */}
        {/* ========================================== */}

        <g 
          className="transition-all duration-1000 ease-out transform"
          style={{
            opacity: showTagline ? 1 : 0,
            transform: showTagline ? 'scale(1)' : 'scale(0.5)',
            transformOrigin: '730px 120px'
          }}
        >
          {/* Circular Orbit Track */}
          <circle 
            cx="730" 
            cy="120" 
            r="44" 
            stroke="url(#primaryGrad)" 
            strokeWidth="3.5" 
            fill="none" 
            strokeDasharray="5 5"
            className="anim-orbit"
          />

          <circle 
            cx="730" 
            cy="120" 
            r="38" 
            stroke="#C4F8FF" 
            strokeWidth="1.5" 
            fill="none" 
            opacity="0.5"
          />

          {/* AI core text */}
          <text 
            x="730" 
            y="129" 
            fill="#C4F8FF" 
            fontSize="28" 
            fontFamily="'Cinzel', serif" 
            fontWeight="bold" 
            textAnchor="middle"
            className="font-black"
          >
            AI
          </text>
        </g>
      </svg>
    </div>
  );
};

export default GramSuvidhaAnimatedLogo;
