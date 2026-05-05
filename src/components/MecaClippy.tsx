import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

// Enhanced dialogues for a professional engineering portfolio
const TIPS = [
  "¡Bienvenido! Soy Meca-Clippy, el asistente de ingeniería de Sofia.",
  "¿Sabías que Sofia es experta en Microcontroladores y Diseño de PCB?",
  "He verificado todos los sensores de este portafolio y operan al 100%.",
  "Toda la lógica de este sitio ha sido optimizada para un rendimiento máximo.",
  "Sofia utiliza metodología sistemática para resolver desafíos de automatización.",
  "Detecto altos niveles de precisión en los proyectos que estás visualizando.",
  "¿Mecatrónica? Es la especialidad que Sofia domina con maestría.",
  "Si necesitas ver los planos, solo haz clic en el icono de Planos_Mec.",
  "He analizado la cinemática de navegación y es extremadamente fluida.",
  "Sofia es una ingeniera con una visión integral del hardware y el software."
];

// Using Giphy CDNs which are generally more stable and accessible
const ANIMS = {
  IDLE: "https://media.giphy.com/media/vNEXyvJq0QatfHRE1g/giphy.gif",      // Tapping
  TAP: "https://media.giphy.com/media/Z8XJkLpS1pAAAAAC/giphy.gif",       // Fast Tap
  MUSIC: "https://media.giphy.com/media/0mF8oG_vN9AAAAAC/giphy.gif",     // Music
  LOOK: "https://media.giphy.com/media/u7V_iH_f7kAAAAC/giphy.gif",      // Look
  BIKE: "https://media.giphy.com/media/M6Lp-i8g3vMAAAAC/giphy.gif",      // Bike
  PLANE: "https://media.giphy.com/media/G9F8oG_vN9AAAAAC/giphy.gif",     // Plane
  SCRATCH: "https://media.giphy.com/media/7-F8oG_vN9AAAAAC/giphy.gif",   // Scratch
  WRITE: "https://media.giphy.com/media/X-F8oG_vN9AAAAAC/giphy.gif"      // Write
};

const STATIC_CLIPPY = "https://raw.githubusercontent.com/AlexMeub/Clippy.js/master/assets/agents/Clippy/map.png";

export const MecaClippy: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTip, setCurrentTip] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [currentAnim, setCurrentAnim] = useState(STATIC_CLIPPY);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Slowly transition to animated state
    const timer = setTimeout(() => {
      setCurrentAnim(ANIMS.IDLE);
    }, 1000);

    // Initial intro tip
    const introTimer = setTimeout(() => {
      setRandomTip();
      setShowBubble(true);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(introTimer);
    };
  }, []);

  const setRandomTip = () => {
    const randomIdx = Math.floor(Math.random() * TIPS.length);
    setCurrentTip(TIPS[randomIdx]);
    
    // Choose a thematic animation
    const keys = Object.keys(ANIMS) as (keyof typeof ANIMS)[];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setCurrentAnim(ANIMS[randomKey]);
    setHasError(false);
  };

  const handleInteraction = () => {
    if (!showBubble) {
      setRandomTip();
      setShowBubble(true);
    } else {
      setShowBubble(false);
      setCurrentAnim(ANIMS.IDLE);
      setHasError(false);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-12 right-6 z-[9999] flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing select-none"
    >
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-2 p-3 bg-[#FFFFE1] border border-black shadow-[3px_3px_0px_rgba(0,0,0,0.3)] max-w-[220px] relative pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Background fix for possible source artifacts */}
            <div className="absolute inset-0 bg-[#FFFFE1] -z-10" />
            
            {/* Speech bubble tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FFFFE1] border-r border-b border-black rotate-45"></div>
            
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowBubble(false); 
                setCurrentAnim(ANIMS.IDLE); 
                setHasError(false);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black border border-black flex items-center justify-center text-[10px] hover:bg-gray-100 shadow-sm"
            >
              <X size={10} />
            </button>
            
            <p className="text-[12px] font-sans text-black text-center leading-tight font-bold">
              {currentTip}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        onClick={handleInteraction}
        className="relative flex flex-col items-center"
      >
        <div className="relative w-40 h-40 flex items-center justify-center bg-transparent">
           <motion.img 
             key={currentAnim}
             src={hasError ? STATIC_CLIPPY : currentAnim}
             alt="Clippy"
             onLoad={() => setIsLoaded(true)}
             className={`w-full h-full object-contain filter drop-shadow-md transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
             referrerPolicy="no-referrer"
             animate={!showBubble ? { y: [0, -4, 0] } : {}}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             onError={() => {
                console.warn("Clippy image load error, falling back to static icon");
                setHasError(true);
                setIsLoaded(true); // Don't hide the error fallback
             }}
           />
        </div>
        
        <div className="mt-[-25px] bg-[#c0c0c0] text-black px-2 py-0.5 border-t border-l border-white border-r-gray-800 border-b-gray-800 text-[11px] font-black uppercase shadow-md z-10 pointer-events-none">
          Meca-Clippy
        </div>
      </div>
    </motion.div>
  );
};
