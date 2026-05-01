import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from 'lucide-react';
import { motion } from 'motion/react';

export const RetroMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const playlist = [
    { title: 'Oda_a_la_Mecatronica.mid', artist: 'MIDI_GEN_X', duration: '2:45', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3' },
    { title: 'Synth_Dreams_98.wav', artist: 'Retro_Wave', duration: '3:12', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'Industrial_Ambience.mp3', artist: 'Factory_Sounds', duration: '4:05', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
  ];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.log("Audio play blocked or failed", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && !hasError) {
      interval = setInterval(() => {
        if (audioRef.current && audioRef.current.duration) {
          const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(p || 0);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, hasError]);

  const handleNext = () => {
    setHasError(false);
    setCurrentTrack((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
    setProgress(0);
  };

  const handlePrev = () => {
    setHasError(false);
    setCurrentTrack((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
    setProgress(0);
  };

  const handleAudioError = () => {
    setHasError(true);
    setIsPlaying(false);
    // Auto-skip after 3 seconds if error occurs
    setTimeout(() => {
      handleNext();
    }, 3000);
  };

  return (
    <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-r-gray-800 border-b-gray-800 p-2 w-full max-w-[300px]">
      <audio 
        ref={audioRef} 
        src={playlist[currentTrack].url} 
        onEnded={handleNext}
        onError={handleAudioError}
        onPlay={() => setHasError(false)}
      />
      {/* LCD Screen */}
      <div className="bg-[#003300] border-2 border-inset border-gray-600 p-2 mb-2 h-16 flex flex-col justify-center overflow-hidden" style={{ borderStyle: 'inset' }}>
        <div className="flex justify-between items-start">
          <div className={`font-mono text-[10px] uppercase truncate w-3/4 ${hasError ? 'text-red-500' : 'text-[#00ff00]'}`}>
            {hasError ? 'ERROR: LOAD_FAILED' : playlist[currentTrack].title}
          </div>
          <div className="text-[#00ff00] font-mono text-[10px]">
            {hasError ? '!!!' : isPlaying ? 'PLAY' : 'PAUSE'}
          </div>
        </div>
        <div className="text-[#00cc00] font-mono text-[8px]">
          {hasError ? 'RETRIEVING_NEXT_TRACK...' : playlist[currentTrack].artist}
        </div>
        <div className="mt-1 flex gap-0.5">
           {Array.from({ length: 20 }).map((_, i) => (
             <motion.div 
               key={i}
               animate={{ height: (isPlaying && !hasError) ? [4, Math.random() * 8 + 4, 4] : 4 }}
               transition={{ duration: 0.5, repeat: Infinity }}
               className={`w-1 ${hasError ? 'bg-red-900' : 'bg-[#00ff00]'}`}
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
            onClick={handlePrev}
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
            onClick={handleNext}
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
