import React from 'react';
import { motion, useDragControls } from 'motion/react';

export const Marquee: React.FC<{ children: React.ReactNode; scrollamount?: number; direction?: 'left' | 'right' }> = ({ 
  children, 
  scrollamount = 3, 
  direction = 'left' 
}) => {
  return (
    <div className="overflow-hidden whitespace-nowrap bg-blue-900 shadow-inner text-white h-7 md:h-8 flex items-center border-b-2 border-black w-full">
      <motion.div
        animate={{ 
          x: direction === 'left' ? [0, '-50%'] : ['-50%', 0] 
        }}
        transition={{ 
          duration: 30 / (scrollamount / 3), 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex items-center"
      >
        <div className="flex items-center gap-6 md:gap-12 px-6 md:px-12 text-[10px] md:text-sm font-bold font-mono tracking-tight shrink-0">
          {children}
        </div>
        <div className="flex items-center gap-6 md:gap-12 px-6 md:px-12 text-[10px] md:text-sm font-bold font-mono tracking-tight shrink-0">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const Blink: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1], ease: "linear" }}
    >
      {children}
    </motion.span>
  );
};

export const ClassicLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noreferrer" 
    className="text-[#0000EE] hover:text-[#551A8B] underline decoration-1 underline-offset-2"
  >
    {children}
  </a>
);

export const RetroButton: React.FC<{ children: React.ReactNode; href?: string; onClick?: (e: any) => void; active?: boolean; className?: string }> = ({ children, href, onClick, active, className }) => {
  const Component = href ? 'a' : 'button';
  return (
    <Component
      href={href}
      onClick={onClick}
      className={`inline-flex px-3 py-1 text-[11px] font-sans font-bold italic items-center gap-2 border-2 overflow-hidden whitespace-nowrap ${active ? 'bg-[#e0e0e0] border-blue-600 border-r-white border-b-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-[#c0c0c0] border-white border-r-gray-800 border-b-gray-800 shadow-[1px_1px_0px_white_inset]'} no-underline cursor-pointer active:border-inset active:shadow-[1px_1px_2px_rgba(0,0,0,0.5)_inset] transition-all duration-300 hover:bg-gray-100 ${className}`}
      style={{ borderStyle: active ? 'inset' : 'outset' }}
    >
      {active && (
        <motion.div 
          initial={{ opacity: 0.5, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 shadow-[0_0_5px_#2563eb] animate-pulse"
        />
      )}
      <span className="truncate w-full text-left">{children}</span>
    </Component>
  );
};

export const SidebarBox: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="mb-2 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 p-1 text-center">
      <div className="text-[10px] font-bold text-blue-900 uppercase mb-1 border-b border-gray-400 pb-1 flex items-center justify-center gap-1">
        <div className="w-2 h-2 bg-blue-700"></div>
        {title}
      </div>
      <div className="text-black text-[10px] space-y-1">
        {children}
      </div>
    </div>
  );
};

export const Counter: React.FC<{ count: number }> = ({ count }) => {
  const digits = count.toString().padStart(6, '0').split('');
  return (
    <div className="bg-black border-2 border-gray-600 p-1 mb-2">
      <div className="text-[8px] text-gray-500 uppercase font-sans mb-1 text-center">Visitor Index:</div>
      <div className="flex gap-px justify-center">
        {digits.map((digit, i) => (
          <div key={i} className="w-4 h-6 bg-slate-900 border border-gray-800 flex items-center justify-center font-mono text-green-500 text-lg leading-none">
            {digit}
          </div>
        ))}
      </div>
    </div>
  );
};

export const WebBadge: React.FC<{ text: string; subtext?: string; color?: string; bgColor?: string }> = ({ 
  text, 
  subtext, 
  color = 'black', 
  bgColor = '#c0c0c0' 
}) => {
  return (
    <div 
      className="inline-block border border-gray-800 font-sans font-bold p-1 m-px text-center shadow-[1px_1px_0px_white_inset]"
      style={{ backgroundColor: bgColor, color: color, fontSize: '8px' }}
    >
      {text}<br />
      {subtext}
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; id?: string }> = ({ title, id }) => {
  return (
    <div id={id} className="bg-gradient-to-r from-gray-700 to-gray-500 text-white font-sans font-bold text-[11px] px-2 py-1 my-3 tracking-wide md:tracking-widest uppercase border border-white border-r-gray-800 border-b-gray-800">
      {title}
    </div>
  );
};

export const VintageCard: React.FC<{ title: string; children: React.ReactNode; area?: string }> = ({ title, children, area }) => {
  return (
    <div className="border border-black p-2 bg-gray-100 mb-3 flex flex-col shadow-[1px_1px_0px_white_inset]">
      <div className="flex justify-between items-center mb-2 border-b border-gray-300 pb-1">
        <h3 className="text-xs font-sans font-black uppercase tracking-wider text-blue-900">{title}</h3>
        {area && <span className="text-[10px] bg-red-800 text-white px-1 font-bold italic">{area}</span>}
      </div>
      <div className="text-[11px] text-slate-800 leading-tight">
        {children}
      </div>
    </div>
  );
};

export const ProgressBar: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color = '#2563eb' }) => {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[9px] font-bold uppercase mb-0.5">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-4 bg-black border border-gray-600 p-0.5 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full relative overflow-hidden"
          style={{ backgroundColor: color }}
        >
          {/* Scanline effect on bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-marquee" style={{ animationDuration: '3s' }}></div>
        </motion.div>
      </div>
    </div>
  );
};

export const StatusIndicator: React.FC<{ label: string; status: string; active?: boolean }> = ({ label, status, active = true }) => {
  return (
    <div className="flex items-center gap-2 bg-[#d0d0d0] border border-gray-400 px-2 py-1 shadow-sm">
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-400'} ${active ? 'animate-pulse' : ''}`} />
      <div className="flex flex-col">
        <span className="text-[8px] font-bold text-black-600 uppercase leading-none">{label}</span>
        <span className="text-[9px] font-black text-blue-900 uppercase leading-none">{status}</span>
      </div>
    </div>
  );
};

export const Window: React.FC<{ 
  title: string; 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode; 
  width?: string;
  height?: string;
  top?: string;
  left?: string;
  icon?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}> = ({ title, isOpen, onClose, children, width = "400px", height = "auto", top = "20%", left = "30%", icon, noPadding = false, className = "" }) => {
  const dragControls = useDragControls();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!isOpen) return null;

  const mobileStyles = {
    width: "95vw",
    height: "85vh",
    top: "7.5vh",
    left: "2.5vw",
  };

  return (
    <motion.div 
      drag={!isMobile}
      dragMomentum={false}
      dragListener={false}
      dragControls={dragControls}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`absolute bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-2xl flex flex-col z-[40] ${className}`}
      style={isMobile ? mobileStyles : { width, height, top, left }}
    >
      {/* Title Bar */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="h-7 bg-gradient-to-r from-blue-900 to-blue-500 flex items-center justify-between px-2 shrink-0 cursor-move transition-colors active:from-blue-700 active:to-blue-400"
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-4 h-4 bg-white border border-black flex items-center justify-center">
             {icon || <div className="w-2 h-2 bg-blue-900"></div>}
          </div>
          <span className="text-white font-bold text-xs tracking-tight select-none">{title}</span>
        </div>
        <div className="flex gap-1" onPointerDown={e => e.stopPropagation()}>
          <button onClick={onClose} className="w-4 h-4 bg-gray-300 border border-white border-r-gray-700 border-b-gray-700 text-[10px] flex items-center justify-center font-bold hover:bg-slate-200">X</button>
        </div>
      </div>
      <div className="p-1 flex-1 flex flex-col overflow-hidden m-1 border-2 border-gray-800 border-r-white border-b-white bg-white cursor-default" onPointerDown={e => e.stopPropagation()}>
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${noPadding ? '' : 'p-4'}`}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};
