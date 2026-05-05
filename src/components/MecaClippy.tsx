import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, X, MessageSquare } from 'lucide-react';

const TIPS = [
  "¿Sabías que el primer PLC fue inventado en 1968 por Dick Morley?",
  "Recuerda siempre verificar la continuidad de tu circuito antes de alimentarlo.",
  "La Ley de Ohm es la base de todo: V = I * R. ¡No la olvides!",
  "Un sensor inductivo solo detecta materiales ferrosos. Usa uno capacitivo para el resto.",
  "¡No te olvides de conectar las Tierras (GND) si usas múltiples fuentes de poder!",
  "El PID controla Proporcional, Integral y Derivativo. ¡Ajusta bien esas constantes!",
  "En Mecatrónica, 1.0 + 1.0 a veces es 2.01 por el ruido eléctrico.",
  "SolidWorks dice que no hay colisiones, pero la realidad tiene otros planes...",
  "El protocolo I2C usa solo dos cables: SDA y SCL. ¡Eficiencia total!",
  "Los motores paso a paso son ideales para posicionamiento preciso sin sensores externos."
];

const ANIMS = {
  TAP: "https://media.tenor.com/Z8XJkLpS1pAAAAAC/clippy.gif",
  MUSIC: "https://media.tenor.com/0mF8oG_vN9AAAAAC/clippy-music.gif",
  LOOK: "https://media.tenor.com/u7V_iH_f7kAAAAC/clippy.gif",
  SIGNAL: "https://media.tenor.com/z7V_iH_f7kAAAAC/clippy.gif",
  BIKE: "https://media.tenor.com/M6Lp-i8g3vMAAAAC/clippy-bike.gif",
  PLANE: "https://media.tenor.com/G9F8oG_vN9AAAAAC/clippy-plane.gif",
  SHOVEL: "https://media.tenor.com/u7V_iH_f7kAAAAC/clippy.gif",
  LOOKUP: "https://media.tenor.com/Z8XJkLpS1pAAAAAC/clippy.gif",
  SCRATCH: "https://media.tenor.com/7-F8oG_vN9AAAAAC/clippy-scratch.gif",
  ATOM: "https://media.tenor.com/u7V_iH_f7kAAAAC/clippy.gif",
  WRITE: "https://media.tenor.com/Z8XJkLpS1pAAAAAC/clippy.gif"
};

export const MecaClippy: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [currentAnim, setCurrentAnim] = useState(ANIMS.LOOK);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => {
        setRandomTip();
        setShowBubble(true);
        setCurrentAnim(ANIMS.TAP);
      }, 500);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const setRandomTip = () => {
    const randomIdx = Math.floor(Math.random() * TIPS.length);
    setCurrentTip(TIPS[randomIdx]);
    
    // Change animation too
    const animKeys = Object.keys(ANIMS);
    const randomAnim = ANIMS[animKeys[Math.floor(Math.random() * animKeys.length)] as keyof typeof ANIMS];
    setCurrentAnim(randomAnim);
  };

  const handleInteraction = () => {
    if (!showBubble) {
      setRandomTip();
      setShowBubble(true);
    } else {
      setShowBubble(false);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-12 right-6 z-[100] flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing select-none"
    >
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-2 p-3 bg-[#FFFFE1] border border-black shadow-[2px_2px_0px_rgba(0,0,0,0.3)] max-w-[180px] relative pointer-events-auto"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Speech bubble tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FFFFE1] border-r border-b border-black rotate-45"></div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-black border border-black flex items-center justify-center text-[8px] hover:bg-gray-100"
            >
              <X size={8} />
            </button>
            <p className="text-[10px] font-sans text-black text-center pr-1 leading-tight">
              {currentTip}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        onClick={handleInteraction}
        className="relative flex flex-col items-center"
      >
        <div className="relative w-20 h-20 flex items-center justify-center">
           <motion.img 
             src={showBubble ? currentAnim : "https://win98icons.alexmeub.com/icons/png/clippy-0.png"}
             alt="Clippy"
             key={currentAnim} // Force re-render on anim change to restart GIF
             className="w-full h-full object-contain drop-shadow-md"
             animate={!showBubble ? { y: [0, -2, 0] } : {}}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             onError={(e) => {
                (e.target as HTMLImageElement).src = "https://win98icons.alexmeub.com/icons/png/clippy-0.png";
             }}
           />
        </div>
        
        <div className="mt-[-4px] bg-[#c0c0c0] text-black px-1.5 py-0.5 border-t border-l border-white border-r-gray-800 border-b-gray-800 text-[8px] font-bold uppercase shadow-sm">
          Clippy
        </div>
      </div>
    </motion.div>
  );
};
