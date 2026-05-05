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

// Using the most direct i.giphy.com direct file links for maximum reliability
const ANIMS = {
  IDLE: "https://i.giphy.com/vNEXyvJq0QatfHRE1g.gif",      
  TAP: "https://i.giphy.com/l0O9zkX7Nf7V2p1yU.gif",        
  MUSIC: "https://i.giphy.com/3o7TKMGpxf3XkM0Z9K.gif",      
  LOOK: "https://i.giphy.com/l0O9zkX7Nf7V2p1yU.gif",       
  BIKE: "https://i.giphy.com/vNEXyvJq0QatfHRE1g.gif",       
  PLANE: "https://i.giphy.com/vNEXyvJq0QatfHRE1g.gif",      
  SCRATCH: "https://i.giphy.com/vNEXyvJq0QatfHRE1g.gif",     
  WRITE: "https://i.giphy.com/vNEXyvJq0QatfHRE1g.gif"       
};

export const MecaClippy: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTip, setCurrentTip] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [currentAnim, setCurrentAnim] = useState(ANIMS.IDLE);

  useEffect(() => {
    // Initial intro tip after a delay
    const introTimer = setTimeout(() => {
      setRandomTip();
      setShowBubble(true);
    }, 5000);

    return () => clearTimeout(introTimer);
  }, []);

  const setRandomTip = () => {
    const randomIdx = Math.floor(Math.random() * TIPS.length);
    setCurrentTip(TIPS[randomIdx]);
    
    // Choose a thematic animation (currently pointing to the same stable asset)
    const keys = Object.keys(ANIMS) as (keyof typeof ANIMS)[];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setCurrentAnim(ANIMS[randomKey]);
  };

  const handleInteraction = () => {
    if (!showBubble) {
      setRandomTip();
      setShowBubble(true);
    } else {
      setShowBubble(false);
      setCurrentAnim(ANIMS.IDLE);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-24 right-8 z-[9999] flex flex-col items-center pointer-events-auto select-none"
    >
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-2 p-3 bg-[#FFFFE1] border border-black shadow-[3px_3px_0px_rgba(0,0,0,0.3)] max-w-[220px] relative pointer-events-auto z-20"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[#FFFFE1] -z-10" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FFFFE1] border-r border-b border-black rotate-45" />
            
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowBubble(false); 
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
        className="relative flex flex-col items-center cursor-pointer group"
      >
        <div className="relative w-32 h-32 flex items-center justify-center">
           <img 
             key={currentAnim}
             src={currentAnim}
             alt="Clippy"
             className="w-full h-full object-contain filter drop-shadow-md brightness-110"
             onError={(e) => {
                // Fail-safe to a known stable version of clippy 
                (e.target as HTMLImageElement).src = "https://raw.githubusercontent.com/AlexMeub/Clippy.js/master/assets/agents/Clippy/clippy.png";
             }}
           />
        </div>
        
        <div className="mt-[-10px] bg-[#c0c0c0] text-black px-2 py-0.5 border-t border-l border-white border-r-gray-800 border-b-gray-800 text-[10px] font-black uppercase shadow-md z-10 pointer-events-none whitespace-nowrap">
          Meca-Clippy
        </div>
      </div>
    </div>
  );
};
