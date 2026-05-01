import React, { useState, useEffect, useRef } from 'react';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
}

export const Terminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: 'MECATRONIC-OS v2.4.0 (BUILD 1998)', type: 'output' },
    { text: 'Copyright (C) 1998 Sofia Modernell Corp.', type: 'output' },
    { text: 'Iniciando módulos de ingeniería...', type: 'success' },
    { text: 'Escribe "HELP" para ver los comandos disponibles.', type: 'output' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputValue.trim().toUpperCase();
    if (!cmd) return;

    const newLines: TerminalLine[] = [...lines, { text: `> ${cmd}`, type: 'input' }];

    switch (cmd) {
      case 'HELP':
        newLines.push({ text: 'COMANDOS DISPONIBLES:', type: 'output' });
        newLines.push({ text: '- SKILLS: Muestra habilidades técnicas.', type: 'output' });
        newLines.push({ text: '- WHOAMI: Información del usuario.', type: 'output' });
        newLines.push({ text: '- CLEAR: Limpia la terminal.', type: 'output' });
        newLines.push({ text: '- REBOOT: Reinicia el sistema.', type: 'output' });
        newLines.push({ text: '- DIR: Lista archivos del proyecto.', type: 'output' });
        break;
      case 'SKILLS':
        newLines.push({ text: 'LECTURA DE SENSORES DE HABILIDAD:', type: 'success' });
        newLines.push({ text: '[X] SolidWorks: OK', type: 'output' });
        newLines.push({ text: '[X] Arduino/ESP32: OK', type: 'output' });
        newLines.push({ text: '[X] Python: OK', type: 'output' });
        newLines.push({ text: '[X] Automatización: OK', type: 'output' });
        break;
      case 'WHOAMI':
        newLines.push({ text: 'USUARIO: Sofia Modernell', type: 'output' });
        newLines.push({ text: 'ROL: Futura Ingeniera Mecatrónica', type: 'output' });
        newLines.push({ text: 'ESTADO: Innovando...', type: 'output' });
        break;
      case 'CLEAR':
        setLines([{ text: 'Terminal limpia.', type: 'output' }]);
        setInputValue('');
        return;
      case 'REBOOT':
        window.location.reload();
        break;
      case 'DIR':
        newLines.push({ text: 'Volume in drive C: PORTAFOLIO', type: 'output' });
        newLines.push({ text: '01/05/2026  10:00 AM    <DIR>          PROYECTOS', type: 'output' });
        newLines.push({ text: '01/05/2026  10:00 AM    <DIR>          CV', type: 'output' });
        newLines.push({ text: '01/05/2026  10:00 AM            4,096  AUTOEXEC.BAT', type: 'output' });
        break;
      default:
        newLines.push({ text: `COMANDO DESCONOCIDO: ${cmd}`, type: 'error' });
    }

    setLines(newLines);
    setInputValue('');
  };

  return (
    <div className="bg-slate-950 font-mono text-xs h-[250px] border-2 border-inset border-slate-700 flex flex-col" style={{ borderStyle: 'inset' }}>
      <div 
        ref={scrollRef}
        className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700"
      >
        {lines.map((line, i) => (
          <div 
            key={i} 
            className={`mb-1 break-all ${
              line.type === 'error' ? 'text-red-500' : 
              line.type === 'success' ? 'text-green-500' : 
              line.type === 'input' ? 'text-cyan-400' : 'text-slate-300'
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="p-2 border-t border-slate-800 flex items-center gap-2">
        <span className="text-cyan-400 font-bold">{'>'}</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
          className="bg-transparent border-none outline-none text-cyan-400 flex-1 uppercase"
        />
      </form>
    </div>
  );
};
