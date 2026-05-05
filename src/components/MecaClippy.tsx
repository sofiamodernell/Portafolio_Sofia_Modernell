import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const TIPS = [
  "¡Hola Sofia! ¿Necesitas ayuda con los planos de SolidWorks?",
  "He revisado tu Malla Curricular... ¡Vas por muy buen camino en Mecatrónica!",
  "¿Viste el proyecto del brazo robótico? ¡Está genial!",
  "Si quieres ver mis circuitos, abre el archivo Proyectos.exe",
  "¡No te olvides de pasar por el Guestbook para dejar un saludo!",
  "Ingeniería + Diseño = Un portafolio increíble. ¡Sigamos explorando!",
  "He detectado un alto nivel de eficiencia en este sistema. ¡Buen trabajo!",
  "¿Buscas contacto? Haz click en el sobre de abajo para enviar un correo."
];

// Mapped direct links for the specific Tenor GIFs
const ANIMS = {
  IDLE: "https://media.tenor.com/vNEXyvJq0QatfHRE1g/clippy.gif",      // 23777925 (IDLE/Tapping)
  TAP: "https://media.tenor.com/Z8XJkLpS1pAAAAAC/clippy.gif",        // 23777969
  MUSIC: "https://media.tenor.com/6D_6-Vv4W80AAAAC/clippy.gif",      // 23777861
  LOOK: "https://media.tenor.com/u7V_iH_f7kAAAAC/clippy.gif",       // 23777959
  BIKE: "https://media.tenor.com/M6Lp-i8g3vMAAAAC/clippy.gif",       // 23777902
  PLANE: "https://media.tenor.com/G9F8oG_vN9AAAAAC/clippy.gif",      // 23777960
  SCRATCH: "https://media.tenor.com/7-F8oG_vN9AAAAAC/clippy.gif"     // 23777923
};

export const MecaClippy: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [currentAnim, setCurrentAnim] = useState(ANIMS.IDLE);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Show up quickly
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const setRandomTip = () => {
    const randomIdx = Math.floor(Math.random() * TIPS.length);
    setCurrentTip(TIPS[randomIdx]);
    
    // Choose a random animation for interaction
    const animKeys: (keyof typeof ANIMS)[] = ['TAP', 'MUSIC', 'LOOK', 'BIKE', 'PLANE', 'SCRATCH'];
    const randomKey = animKeys[Math.floor(Math.random() * animKeys.length)];
    setCurrentAnim(ANIMS[randomKey]);
    setLoadError(false);
  };

  const handleInteraction = () => {
    if (!showBubble) {
      setRandomTip();
      setShowBubble(true);
    } else {
      setShowBubble(false);
      setCurrentAnim(ANIMS.IDLE);
      setLoadError(false);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-16 right-8 z-[9999] flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing select-none"
    >
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-2 p-3 bg-[#FFFFE1] border border-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)] max-w-[180px] relative pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FFFFE1] border-r border-b border-black rotate-45"></div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBubble(false); setCurrentAnim(ANIMS.IDLE); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black border border-black flex items-center justify-center text-[10px] hover:bg-gray-100 shadow-sm"
            >
              <X size={10} />
            </button>
            
            <p className="text-[11px] font-sans text-black text-center leading-tight font-medium">
              {currentTip}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        onClick={handleInteraction}
        className="relative flex flex-col items-center"
      >
        <div className="relative w-28 h-28 flex items-center justify-center bg-transparent">
           {!loadError ? (
             <motion.img 
               key={currentAnim}
               src={currentAnim}
               alt="Clippy"
               className="w-full h-full object-contain"
               animate={!showBubble ? { y: [0, -3, 0] } : {}}
               transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
               onError={() => setLoadError(true)}
             />
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-100 border-2 border-dashed border-yellow-600 rounded-lg p-2 text-center">
               <span className="text-[8px] font-bold text-yellow-800">CLIPPY OFFLINE</span>
               <img src="https://win98icons.alexmeub.com/icons/png/clippy-0.png" className="w-10 h-10 mt-1" />
             </div>
           )}
        </div>
        
        <div className="mt-[-10px] bg-[#c0c0c0] text-black px-2 py-0.5 border-t border-l border-white border-r-gray-800 border-b-gray-800 text-[10px] font-bold uppercase shadow-md z-10 pointer-events-none">
          Meca-Clippy
        </div>
      </div>
    </motion.div>
  );
};
