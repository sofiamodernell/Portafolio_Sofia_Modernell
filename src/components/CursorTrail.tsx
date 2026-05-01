import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const CursorTrail: React.FC = () => {
  const [dots, setDots] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newDot = { x: e.clientX, y: e.clientY, id: Date.now() };
      setDots(prev => [...prev.slice(-15), newDot]);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {dots.map((dot, i) => (
          <motion.div
            key={dot.id}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 0, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute w-2 h-2 text-yellow-500 font-bold"
            style={{ left: dot.x, top: dot.y }}
          >
            {i % 2 === 0 ? '★' : '⊹'}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
