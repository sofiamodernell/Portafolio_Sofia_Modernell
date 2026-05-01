import React from 'react';

export const MecatronicaLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#A21E74" />
    <path d="M43.6 32.5L34.2 46.5C33.5 47.5 33.5 48.8 34.2 49.8L35.2 51.3M46.8 32.5L56.2 46.5C56.9 47.5 56.9 48.8 56.2 49.8L53.9 53.2M66.4 56.5L64.1 59.9C63.4 60.9 63.4 62.2 64.1 63.2L68.8 70.2M71.4 56.5L69.1 59.9C68.4 60.9 68.4 62.2 69.1 63.2L73.8 70.2M46.8 28.5C46.8 32.1 43.9 35 40.3 35C36.7 35 33.8 32.1 33.8 28.5C33.8 24.9 36.7 22 40.3 22C43.9 22 46.8 24.9 46.8 28.5ZM78.2 45.3C78.2 48.9 75.3 51.8 71.7 51.8C68.1 51.8 65.2 48.9 65.2 45.3C65.2 41.7 68.1 38.8 71.7 38.8C75.3 38.8 78.2 41.7 78.2 45.3ZM36.2 55.4C36.2 59.8 32.6 63.4 28.2 63.4C23.8 63.4 20.2 59.8 20.2 55.4C20.2 51 23.8 47.4 28.2 47.4C32.6 47.4 36.2 51 36.2 55.4Z" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 76.2H73.8" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    <path d="M19.1 53L22.5 66.8M16.5 54.8L20.2 57.3M26.4 75L35.4 70.7M38.8 66L35.8 55.8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 4"/>
  </svg>
);

export const UtecLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* ITR */}
    <text x="10" y="45" fontFamily="sans-serif" fontSize="36" fontWeight="300" fill="#00ADEF">ITR</text>
    {/* UTEC */}
    <text x="10" y="85" fontFamily="sans-serif" fontSize="48" fontWeight="800" fill="black">UTEC</text>
    
    {/* Hexagon Geometric Icon */}
    <g transform="translate(180, 20) scale(0.6)">
      <path d="M50 5 L90 28 V72 L50 95 L10 72 V28 Z" fill="none" stroke="#00ADEF" strokeWidth="8"/>
      <path d="M50 5 V95" stroke="#00ADEF" strokeWidth="6"/>
      <path d="M10 28 L90 72" stroke="#00ADEF" strokeWidth="6"/>
      <path d="M90 28 L10 72" stroke="#00ADEF" strokeWidth="6"/>
    </g>
    
    {/* Suroeste */}
    <text x="140" y="80" fontFamily="sans-serif" fontSize="24" fontWeight="600" fill="black">Suroeste</text>
    <text x="140" y="105" fontFamily="sans-serif" fontSize="14" fontWeight="400" fill="black">Universidad Tecnológica</text>
  </svg>
);
