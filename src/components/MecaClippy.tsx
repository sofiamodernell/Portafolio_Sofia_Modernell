import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const TIPS = [
  "¡Hola! Soy Meca-Clippy. ¿Necesitas ayuda para explorar este portafolio?",
  "Parece que estás viendo los proyectos de Sofia. ¡El del Pick-to-Light es mi favorito!",
  "¿Sabías que Sofia es una crack en SolidWorks? Deberías ver sus planos mecánicos.",
  "¡Vaya! Veo que este sitio usa tecnología SigFox e IoT. ¡Muy avanzado!",
  "Si te gusta lo que ves, ¡no olvides dejar un mensaje en el Guestbook.txt!",
  "¡Atención! Demasiada ingeniería en una sola página puede causar bugs de felicidad.",
  "Sofia está cursando el 5to semestre. ¡Mira cuánto ha progresado en su matriz de competencias!",
  "¿Buscas contacto profesional? Haz click en el icono de 'Mi PC' o en el sobre de abajo."
];

// Actual direct links for Tenor GIFs provided
const ANIMS = {
  IDLE: "https://media.tenor.com/vNEXyvJq0QatfHRE1g/clippy.gif", // 23777925
  TAP: "https://media.tenor.com/Z8XJkLpS1pAAAAAC/clippy.gif",   // 23777969
  MUSIC: "https://media.tenor.com/0mF8oG_vN9AAAAAC/clippy.gif", // 23777861
  LOOK: "https://media.tenor.com/u7V_iH_f7kAAAAC/clippy.gif",  // 23777959
  BIKE: "https://media.tenor.com/M6Lp-i8g3vMAAAAC/clippy.gif",  // 23777902
  PLANE: "https://media.tenor.com/G9F8oG_vN9AAAAAC/clippy.gif", // 23777960
  SCRATCH: "https://media.tenor.com/7-F8oG_vN9AAAAAC/clippy.gif" // 23777923
};

export const MecaClippy: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [currentAnim, setCurrentAnim] = useState(ANIMS.IDLE);

  useEffect(() => {
    // Show up quickly with an intro
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const setRandomTip = () => {
    const randomIdx = Math.floor(Math.random() * TIPS.length);
    setCurrentTip(TIPS[randomIdx]);
    
    // Choose a random animation (excluding IDLE for variety during talk)
    const animKeys = Object.keys(ANIMS).filter(k => k !== 'IDLE');
    const randomKey = animKeys[Math.floor(Math.random() * animKeys.length)];
    setCurrentAnim(ANIMS[randomKey as keyof typeof ANIMS]);
  };

  const handleInteraction = () => {
    if (!showBubble) {
      setRandomTip();
      setShowBubble(true);
    } else {
      setShowBubble(false);
      setCurrentAnim(ANIMS.IDLE); // Return to idle when bubble closed
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.5, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-12 right-6 z-[100] flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing select-none"
    >
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-2 p-3 bg-[#FFFFE1] border border-black shadow-[3px_3px_0px_rgba(0,0,0,0.3)] max-w-[180px] relative pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()} // Allow interaction inside bubble
          >
            {/* Speech bubble tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FFFFE1] border-r border-b border-black rotate-45"></div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBubble(false); setCurrentAnim(ANIMS.IDLE); }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black border border-black flex items-center justify-center text-[8px] hover:bg-gray-100 shadow-sm"
            >
              <X size={8} />
            </button>
            
            <p className="text-[10px] font-sans text-black text-center pr-1 leading-tight font-medium">
              {currentTip}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        onClick={handleInteraction}
        className="relative flex flex-col items-center"
      >
        <div className="relative w-24 h-24 flex items-center justify-center">
           <motion.img 
             key={currentAnim} // Force re-render on anim change to restart GIF
             src={currentAnim}
             alt="Clippy"
             className="w-full h-full object-contain filter drop-shadow-md"
             animate={!showBubble ? { y: [0, -2, 0] } : {}}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             onError={(e) => {
                (e.target as HTMLImageElement).src = "https://win98icons.alexmeub.com/icons/png/clippy-0.png";
             }}
           />
        </div>
        
        <div className="mt-[-8px] bg-[#c0c0c0] text-black px-2 py-0.5 border-t border-l border-white border-r-gray-800 border-b-gray-800 text-[8px] font-bold uppercase shadow-sm z-10 pointer-events-none">
          Meca-Bot v1.2
        </div>
      </div>
    </motion.div>
  );
};
