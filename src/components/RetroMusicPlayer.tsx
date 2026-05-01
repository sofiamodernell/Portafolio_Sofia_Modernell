import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from 'lucide-react';
import { motion } from 'motion/react';

export const RetroMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);

  const playlist = [
    { title: 'Oda_a_la_Mecatronica.mid', artist: 'MIDI_GEN_X', duration: '2:45' },
    { title: 'Synth_Dreams_98.wav', artist: 'Retro_Wave', duration: '3:12' },
    { title: 'Industrial_Ambience.mp3', artist: 'Factory_Sounds', duration: '4:05' }
  ];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-r-gray-800 border-b-gray-800 p-2 w-full max-w-[300px]">
      {/* LCD Screen */}
      <div className="bg-[#003300] border-2 border-inset border-gray-600 p-2 mb-2 h-16 flex flex-col justify-center overflow-hidden" style={{ borderStyle: 'inset' }}>
        <div className="flex justify-between items-start">
          <div className="text-[#00ff00] font-mono text-[10px] uppercase truncate w-3/4">
            {playlist[currentTrack].title}
          </div>
          <div className="text-[#00ff00] font-mono text-[10px]">
            {isPlaying ? 'PLAY' : 'PAUSE'}
          </div>
        </div>
        <div className="text-[#00cc00] font-mono text-[8px]">
          {playlist[currentTrack].artist}
        </div>
        <div className="mt-1 flex gap-0.5">
           {Array.from({ length: 20 }).map((_, i) => (
             <motion.div 
               key={i}
               animate={{ height: isPlaying ? [4, Math.random() * 8 + 4, 4] : 4 }}
               transition={{ duration: 0.5, repeat: Infinity }}
               className="w-1 bg-[#00ff00]"
             />
           ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-400 border border-inset border-gray-600 mb-3 relative" style={{ borderStyle: 'inset' }}>
        <div 
          className="h-full bg-blue-800" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center gap-1">
        <div className="flex gap-1">
          <button 
            onClick={() => setCurrentTrack((prev) => (prev === 0 ? playlist.length - 1 : prev - 1))}
            className="w-8 h-8 bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-center active:translate-y-px"
          >
            <SkipBack size={14} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-8 bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-center active:translate-y-px"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button 
            onClick={() => setCurrentTrack((prev) => (prev === playlist.length - 1 ? 0 : prev + 1))}
            className="w-8 h-8 bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-center active:translate-y-px"
          >
            <SkipForward size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 px-2 bg-gray-400 border border-inset border-gray-600 h-8" style={{ borderStyle: 'inset' }}>
          <Volume2 size={12} />
          <div className="w-12 h-1 bg-gray-700">
            <div className="w-2/3 h-full bg-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
