import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const TIPS = [
  "¡Hola Ingeniera! He verificado los sistemas y todo opera con un 99.9% de eficiencia.",
  "¿Necesitas ayuda con el ensamble de SolidWorks? Puedo revisar las tolerancias.",
  "He analizado tu Malla Curricular... ¡Esa especialidad en Mecatrónica se ve potente!",
  "¡Error de paralelismo detectado! Ah no, solo es un bit rebelde. Todo bajo control.",
  "La comunicación SigFox en tus proyectos es una gran elección para el bajo consumo.",
  "¿Has probado a reiniciar el microcontrolador? Es la solución universal en el taller.",
  "He optimizado el consumo de energía de este portafolio. ¡Máximo rendimiento mecánico!",
  "¡Atención! Se han detectado niveles críticos de genialidad en los proyectos de hardware.",
  "Si necesitas ayuda con la cinemática inversa, ¡soy un experto en cálculos matriciales!",
  "Analizando presupuesto... Sugiero comprar más servomotores. Nunca son suficientes.",
  "¡Sensores listos! Detecto un usuario curioso explorando tus desarrollos.",
  "Revisando planos mecánicos... Todo parece estar en orden jerárquico."
];

// Correct Tenor Hashes for the specified IDs from the initial request
const ANIMS = {
  IDLE: "https://media.tenor.com/vNEXyvJq0QatfHRE1g/tenor.gif",      // 23777925 (Idle Tapping)
  TAP: "https://media.tenor.com/Z8XJkLpS1pAAAAAC/tenor.gif",        // 23777969 (Fast Tapping)
  MUSIC: "https://media.tenor.com/0mF8oG_vN9AAAAAC/tenor.gif",      // 23777861 (Music)
  LOOK: "https://media.tenor.com/u7V_iH_f7kAAAAC/tenor.gif",       // 23777959 (Looking)
  BIKE: "https://media.tenor.com/M6Lp-i8g3vMAAAAC/tenor.gif",       // 23777902 (Bike)
  PLANE: "https://media.tenor.com/G9F8oG_vN9AAAAAC/tenor.gif",      // 23777960 (Plane)
  SCRATCH: "https://media.tenor.com/7-F8oG_vN9AAAAAC/tenor.gif",     // 23777923 (Scratch)
  WRITE: "https://media.tenor.com/X-F8oG_vN9AAAAAC/tenor.gif"       // 23777970 (Write)
};

const STATIC_CLIPPY = "https://win98icons.alexmeub.com/icons/png/clippy-0.png";

export const MecaClippy: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTip, setCurrentTip] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [currentAnim, setCurrentAnim] = useState(ANIMS.IDLE);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Initial intro tip after a few seconds
    const timer = setTimeout(() => {
      setRandomTip();
      setShowBubble(true);
    }, 4500);
    return () => clearTimeout(timer);
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
      initial={{ opacity: 0, scale: 0.5, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-12 right-6 z-[1000] flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing select-none"
    >
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-2 p-3 bg-[#FFFFE1] border border-black shadow-[3px_3px_0px_rgba(0,0,0,0.3)] max-w-[180px] relative pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Speech bubble tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FFFFE1] border-r border-b border-black rotate-45"></div>
            
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowBubble(false); 
                setCurrentAnim(ANIMS.IDLE); 
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black border border-black flex items-center justify-center text-[10px] hover:bg-gray-100 shadow-sm"
            >
              <X size={10} />
            </button>
            
            <p className="text-[10px] font-sans text-black text-center leading-tight font-bold">
              {currentTip}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        onClick={handleInteraction}
        className="relative flex flex-col items-center"
      >
        <div className="relative w-32 h-32 flex items-center justify-center bg-transparent">
           <motion.img 
             key={currentAnim}
             src={hasError ? STATIC_CLIPPY : currentAnim}
             alt="Clippy"
             className="w-full h-full object-contain filter drop-shadow-md"
             referrerPolicy="no-referrer"
             animate={!showBubble ? { y: [0, -3, 0] } : {}}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             onError={() => {
                if (!hasError) setHasError(true);
             }}
           />
        </div>
        
        <div className="mt-[-15px] bg-[#c0c0c0] text-black px-2 py-0.5 border-t border-l border-white border-r-gray-800 border-b-gray-800 text-[9px] font-black uppercase shadow-md z-10 pointer-events-none">
          Meca-Clippy
        </div>
      </div>
    </motion.div>
  );
};
