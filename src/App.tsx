/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Marquee, 
  Blink, 
  ClassicLink,
  RetroButton, 
  SidebarBox, 
  Counter, 
  WebBadge, 
  SectionHeader, 
  VintageCard,
  ProgressBar,
  StatusIndicator,
  Window
} from './components/VintageUI';
import { CursorTrail } from './components/CursorTrail';
import { TicTacToe } from './components/TicTacToe';
import { Terminal } from './components/Terminal';
import { RetroMusicPlayer } from './components/RetroMusicPlayer';
import { Mail, Linkedin, FolderOpen, Star, AlertTriangle, Monitor, HardDrive, Cpu, Globe, Volume2, VolumeX, MessageSquare, FileText, Award, Image as ImageIcon, Gamepad2, Terminal as TerminalIcon, ShieldCheck, Music, Grid3X3, Book, Map, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp, 
  doc, 
  increment,
  setDoc,
  getDoc,
  getDocFromServer,
  limit
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { db, auth } from './lib/firebase';
import { Trash2, Reply, Send, LogIn, LogOut, Smile, Download } from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface GuestbookMessage {
  id: string;
  name: string;
  date: string;
  text: string;
  createdAt: any;
  reply?: string;
}

const RETRO_VISUALS = [
  { url: "https://raw.githubusercontent.com/AnestisK/old-web-graphics/master/gifs/smileys/smiley.gif", label: "smiley" },
  { url: "https://raw.githubusercontent.com/AnestisK/old-web-graphics/master/gifs/tech/mail.gif", label: "mail" },
  { url: "https://raw.githubusercontent.com/AnestisK/old-web-graphics/master/gifs/under_construction/uc1.gif", label: "construction" },
  { url: "https://raw.githubusercontent.com/AnestisK/old-web-graphics/master/gifs/tech/netscape.gif", label: "netscape" },
  { url: "https://raw.githubusercontent.com/AnestisK/old-web-graphics/master/gifs/smileys/alien.gif", label: "alien" },
  { url: "https://raw.githubusercontent.com/AnestisK/old-web-graphics/master/gifs/smileys/cool.gif", label: "cool" },
  { url: "https://raw.githubusercontent.com/AnestisK/old-web-graphics/master/gifs/tech/pc.gif", label: "pc" }
];

const AnimatedRetroIcon: React.FC<{ url: string, label: string, onClick?: () => void }> = ({ url, label, onClick }) => {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.3, zIndex: 10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`p-0.5 cursor-pointer bg-white border border-gray-400 shadow-sm ${onClick ? 'hover:bg-yellow-50' : ''}`}
    >
      <img 
        src={url} 
        alt={label} 
        className="w-4 h-4 md:w-5 md:h-5 object-contain pixelated" 
        style={{ imageRendering: 'pixelated' } as React.CSSProperties} 
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${label}`;
        }}
      />
    </motion.button>
  );
};

export default function App() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newName, setNewName] = useState("");
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [selectedProject, setSelectedProject] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [isGuestbookOpen, setIsGuestbookOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(true);
  const [isTicTacToeOpen, setIsTicTacToeOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isMallaOpen, setIsMallaOpen] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState('space');
  const [user, setUser] = useState<User | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Use project base URL for images
  const getImgPath = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Remove leading slash for consistency
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // For GitHub Pages or AIS Preview, we need to handle the base path correctly.
    // Vite provides import.meta.env.BASE_URL which defaults to '/'
    const base = import.meta.env.BASE_URL || '/';
    
    // Create a normalized path that definitely has a leading slash and respects the base
    const fullPath = `${base}/${cleanPath}`.replace(/\/+/g, '/');
    
    return fullPath;
  };

  const isAdmin = !!user && user.email?.toLowerCase() === 'sofiamodernell336@gmail.com';

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    // Visitor counter logic
    const visitorDoc = doc(db, 'visitors', 'total');
    
    // Increment count on load
    const updateCount = async () => {
      try {
        // First check if we can reach the server
        const snap = await getDoc(visitorDoc);
        if (!snap.exists()) {
          await setDoc(visitorDoc, { count: 1 });
        } else {
          await updateDoc(visitorDoc, { count: increment(1) });
        }
      } catch (error: any) {
        // Silently handle "offline" or connection errors
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('offline') || 
            msg.includes('database not found') ||
            msg.includes('missing or insufficient permissions') ||
            msg.includes('quota exceeded')) {
           // This is expected in some environments or states, don't crash
           return;
        }
        console.warn('Visitor update failed:', error.message);
      }
    };

    updateCount();

    // Listen to count
    const unsubVisitors = onSnapshot(visitorDoc, (snapshot) => {
      if (snapshot.exists()) {
        setVisitorCount(snapshot.data().count);
      }
    }, (error: any) => {
      // Silently handle expected connection errors
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('offline') || 
          msg.includes('database not found') ||
          msg.includes('missing or insufficient permissions') ||
          msg.includes('quota exceeded')) {
        return;
      }
      console.error('Visitor listener error:', error);
    });

    // Guestbook real-time listener
    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'), limit(50));
    const unsubGuestbook = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GuestbookMessage[];
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'guestbook');
    });

    return () => {
      unsubVisitors();
      unsubGuestbook();
      unsubAuth();
    };
  }, []);

  function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const msg = error instanceof Error ? error.message : String(error);
    const lowerMsg = msg.toLowerCase();
    
    // Silently skip expected offline/quota errors
    if (lowerMsg.includes('offline') || 
        lowerMsg.includes('quota exceeded') || 
        lowerMsg.includes('database not found') ||
        lowerMsg.includes('missing or insufficient permissions')) {
      return;
    }

    const errInfo = {
      error: msg,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  const backgrounds = {
    space: { bg: '#000000', pattern: 'https://www.transparenttextures.com/patterns/stardust.png', name: 'ESPACIO_ESTRELLADO.SYS' },
    matrix: { bg: '#001a00', pattern: 'https://www.transparenttextures.com/patterns/carbon-fibre.png', name: 'MATRIZ_DATOS.EXE' },
    sunset: { bg: '#ff0080', pattern: 'https://www.transparenttextures.com/patterns/asfalt-light.png', name: 'VAPORWAVE_90S.BMP' },
    clouds: { bg: '#87CEEB', pattern: 'https://www.transparenttextures.com/patterns/cloudy-day.png', name: 'NUBES_XP.SCR' },
    circuit: { bg: '#004d00', pattern: 'https://www.transparenttextures.com/patterns/subtle-grey.png', name: 'CIRCUITO_MECATRONICO.HEX' }
  };

  const cycleBackground = () => {
    const keys = Object.keys(backgrounds);
    const currentIndex = keys.indexOf(backgroundStyle);
    const nextKey = keys[(currentIndex + 1) % keys.length];
    setBackgroundStyle(nextKey);
  };

  const projects = [
    {
      title: "Proyecto Integrador II",
      tag: "ATmega328PB / Sigfox / IoT",
      desc: "PCB propia con ATmega328PB, sensores y SigFox IoT. Enfocado en optimización energetica.",
      img: getImgPath('assets/images/project-pic2.png')
    },
    {
      title: "Pick-to-Light System",
      tag: "Automatismo / Logística",
      desc: "Sistema de guiado para depósitos optimizado mediante LEDs .",
      img: getImgPath('assets/images/project-p2l.png')
    }
  ];

  const professionalCompetencies = [
    {
      id: "pro1",
      title: "Area 01 - Operación",
      area: "PRO",
      description: "Operación de Sistemas Mecatrónicos",
      subCompetencies: [
        {
          id: "1.1",
          title: "1.1 Implementar software y hardware específicos para el correcto desempeño de procesos industriales.",
          description: "Desarrollo y despliegue de soluciones integrales que combinan programación de bajo nivel con diseño circuital robusto para automatización.",
          evidences: [
            { name: "Laboratorio 1 - TMPR", type: "ATmega328P / Ensamblador / UART / GPIO / DAC R-2R", link: "https://drive.google.com/file/d/1NXQSYHN2ltbnLsJ9agiUTe_sG3_E0GKU/view?usp=drive_link" },
            { name: "Laboratorio 2 - TMPR", type: "Pen Plotter / UART / EEPROM", link: "https://drive.google.com/file/d/1E4UumDUg6E0UXkpHhlxfGIRlxUSbwrMJ/view?usp=drive_link" },
            { name: "Laboratorio 3 - TMPR", type: "PWM / Python / I2C / SPI / UART", link: "https://drive.google.com/file/d/1inv05FgKHeb75ErSzuFv0p4lAdz8C2xE/view?usp=drive_link" },
            { name: "Laboratorio 4 - TMPR", type: "Robótica móvil / Maestro-Esclavo / I2C / SPI / UART", link: "https://drive.google.com/file/d/1SsyFmSyxe-eTx39NV40ZSN1uZHM2e7R_/view?usp=drive_link" },
            { name: "Laboratorio 4 - ED1", type: "Lógica Combinacional / Logica Secuencial / Flip-Flops", link: "https://drive.google.com/file/d/1e-8MCmhZ-o2Soz5FVYluZlWawZygTaC_/view?usp=drive_link" },
            { name: "PIC I - Sistema Pick to Light", type: "Arduino Uno / Sistema Pick to Light / Control de procesos ", link: "https://drive.google.com/file/d/1plyUhsnvwbN44AVKBbYR7dW_YFSk3E4b/view?usp=drive_link" },
            { name: "PIC II - Modulo de recolección de datos", type: "ATmega328PB / Sensores ambientales / Comunicación inalámbrica", link: "https://drive.google.com/file/d/1xBhtIRChTQFm7XlxNTK4xA_YoCdC-O2O/view?usp=drive_link" }
          ]
        },
        {
          id: "1.2",
          title: "1.2 Verificar la capacidad operacional de los sistemas mecatrónicos en planta usando sistemas de monitoreo.",
          description: "Aseguramiento de la calidad y funcionalidad mediante el análisis de datos en tiempo real y pruebas de estrés en entornos industriales.",
          evidences: [
            { name: "PIC II - Modulo de recolección de datos", type: "ATmega328PB / Sensores ambientales / Telemetría inalámbrica / Monitoreo en campo", link: "https://drive.google.com/file/d/1xBhtIRChTQFm7XlxNTK4xA_YoCdC-O2O/view?usp=drive_link" },
            { name: "Laboratorio 3 - TMPR", type: "LM35 / Control de temperatura / Lazo cerrado / Python / Visualización en tiempo real", link: "https://drive.google.com/file/d/1inv05FgKHeb75ErSzuFv0p4lAdz8C2xE/view?usp=drive_link" },
            { name: "Laboratorio 4 - TMPR", type: "DHT11 / MQ135 / Sensor de llama / Maestro-Esclavo SPI-I2C / Monitoreo ambiental / LCD", link: "https://drive.google.com/file/d/1SsyFmSyxe-eTx39NV40ZSN1uZHM2e7R_/view?usp=drive_link" },
            { name: "Laboratorio 2 - TMPR", type: "ATmega328P / Proteus / PicSimLab / Simulación y validación dual / Lenguaje C", link: "https://drive.google.com/file/d/1E4UumDUg6E0UXkpHhlxfGIRlxUSbwrMJ/view?usp=drive_link" },
            { name: "Laboratorio 1 - TMPR", type: "ATmega328P / Osciloscopio / DAC R-2R / UART / Validación de señal analógica", link: "https://drive.google.com/file/d/1NXQSYHN2ltbnLsJ9agiUTe_sG3_E0GKU/view?usp=drive_link" }
          ]
        },
        {
          id: "1.3",
          title: "1.3 Instalar y poner en servicio sistemas mecatrónicos considerando normas de calidad, seguridad y medio ambiente.",
          description: "Integración física y lógica de equipos, garantizando el cumplimiento de normativas vigentes y la sostenibilidad del sistema.",
          evidences: [
            { name: "PIC I - Sistema Pick to Light", type: "Arduino Uno / Tinkercad / Autodesk Inventor / Ishikawa / Matriz multicriterio / Diseño y simulación", link: "https://drive.google.com/file/d/1plyUhsnvwbN44AVKBbYR7dW_YFSk3E4b/view?usp=drive_link" },
            { name: "PIC II - Modulo de recolección de datos", type: "ATmega328PB / PCB / Soldadura SMD / Carcasa 3D / Sigfox / Bajo consumo / Gemelo digital", link: "https://drive.google.com/file/d/1xBhtIRChTQFm7XlxNTK4xA_YoCdC-O2O/view?usp=drive_link" },
            { name: "Laboratorio 4 - TMPR", type: "ATmega328P / SPI / I2C / Maestro-Esclavo / Integración física / Validación dual simulación-físico", link: "https://drive.google.com/file/d/1SsyFmSyxe-eTx39NV40ZSN1uZHM2e7R_/view?usp=drive_link" },
            { name: "Laboratorio 3 - TMPR", type: "ATmega328P / Proteus / PicSimLab / Metodología dual simulación-físico / Control de temperatura / RFID / Lenguaje C", link: "https://drive.google.com/file/d/1inv05FgKHeb75ErSzuFv0p4lAdz8C2xE/view?usp=drive_link" }
          ]
        }
      ],
      evidences: [],
      reflection: "A lo largo de mis proyectos he comprendido que la operación de sistemas mecatrónicos no se valida cuando el código compila o la simulación responde, sino cuando el sistema físico cumple los parámetros de diseño bajo condiciones reales. Verificar una señal analógica con osciloscopio, medir el consumo real de un módulo IoT en campo o comparar la respuesta de un controlador de temperatura contra una gráfica en tiempo real me enseñó que la diferencia entre 'funciona' y 'opera correctamente' define la integridad de un sistema industrial. Esa transición del entorno simulado al desempeño físico verificado es lo que entiendo hoy como competencia operacional real.",
      resources: [
        { name: "Repositorio GitHub - Tecnologias de Microprocesamiento", url: "https://github.com/Victoriaetch/Microcontroladores"},
        { name: "Repositorio GitHub - PIC II ", url: "https://github.com/sosaguadalupe/Modulo_recolector_de_datos"},
        { name: "Carpeta de Evidencias", url: "https://drive.google.com/drive/u/1/folders/1vV15lVgWN9c30LRsY4HgE3z9dhCtd2Ue" },
        { name: "Datasheet ATmega328PB", url: "https://ww1.microchip.com/downloads/en/DeviceDoc/40001906A.pdf" },
        { name: "Plan de Estudios 2023", url: "https://ev1.utec.edu.uy/moodle/pluginfile.php/912362/mod_resource/content/0/Resoluci%C3%B3n%20135_23%20Plan%20IMEC%202023.pdf" }
      ],
      link: "https://drive.google.com/drive/u/1/folders/1vV15lVgWN9c30LRsY4HgE3z9dhCtd2Ue"
    },
    {
      id: "pro2",
      title: "Area 02 - Mantenimiento",
      area: "PRO",
      description: "Mantenimiento de Sistemas Mecatrónicos",
      subCompetencies: [
        {
          id: "2.1",
          title: "2.1. Ejecutar planes de mantenimiento (preventivos y correctivos) diseñados por especialistas.",
          description: "Implementación técnica de rutinas de preservación y restauración de funcionalidad en equipos industriales.",
          evidences: [
            { name: "Análisis de Discrepancias - ED1", type: "Lógica Combinacional / Simulink / Karnaugh / Diagnóstico de discrepancias físico-simulado / Multímetro", link: "https://drive.google.com/drive/folders/1ILz2xo_BhUhRl8Nj1SYwn0h7qUEUbfyR?usp=drive_link" },
            { name: "Diagnóstico SPI/I2C/UART - TMPR", type: "ATmega328P / SPI vs I2C / Detección de interferencias / Corrección de fallas en protoboard / Validación física", link: "#" },
            { name: "Instrumentación", type: "Multímetro / Osciloscopio / Caracterización de componentes / Teórico vs Práctico vs Simulado", link: "#" }
          ]
        },
        {
          id: "2.2",
          title: "2.2. Aplicar procedimientos y seguir instrucciones relacionando la actividad con metodologías de mantenimiento basado en la confiabilidad indicada por un departamento/responsable técnico.",
          description: "Ejecución sistemática de tareas siguiendo estándares de confiabilidad y documentación técnica rigurosa.",
          evidences: [
          { name: "PIC II - Módulo de recolección de datos", type: "MCDM / Especificaciones técnicas / Requisitos / Sigfox / PCB", link: "https://drive.google.com/file/d/1NG68cr_0O1v8qQ1I6DqEAsurz2-cTDu-/view?usp=drive_link" },
          { name: "Laboratorio 4 - EAA", type: "JFET J112 / Metodología teórico-simulado-experimental / Osciloscopio / Documentación técnica", link: "https://drive.google.com/file/d/1kFWPtIoi_q9vrhxNoyPmm7ETjEBK0FpQ/view?usp=drive_link" },
          { name: "Laboratorio 3 - ED1 ", type: "Flip-Flop JK / Anti-rebote / Corrección de fallas / Simulink / Implementación física", link: "https://drive.google.com/file/d/1RGe4BT1VF0zTUtIiPjs26i65c9oYCJZN/view?usp=drive_link" }
          ]
        }
      ],
      evidences: [],
      reflection: "La competencia de mantenimiento se forja tanto en el diagnóstico como en la disciplina de seguir procedimientos. A través de mis laboratorios aprendí que identificar discrepancias entre el comportamiento esperado y el real requiere instrumentación precisa y análisis metódico, pero también que ejecutar correctamente un plan técnico definido por especialistas exige rigor documental y trazabilidad. En el PIC II, los requisitos impuestos por los docentes responsables me enseñaron que el mantenimiento preventivo empieza en el diseño: cada decisión técnica justificada con matrices multicriterio es una falla futura evitada. El mantenimiento no es solo reparar, es anticipar, documentar y validar.",
      resources: [
        { name: "Carpeta de Evidencias", url: "https://drive.google.com/drive/u/1/folders/17Retv7992rLRJWRwvWbupOL5darzVy8d" },
        { name: "Documentación Proteus", url: "https://www.labcenter.com/resources/" },
        { name: "Documentación Simulink/MATLAB ", url: "https://www.mathworks.com/products/simulink.html" }
      ],
      link: "https://drive.google.com/drive/u/1/folders/17Retv7992rLRJWRwvWbupOL5darzVy8d"
    },
    {
      id: "pro3",
      title: "Area 03 - Diseño",
      area: "ENG",
      description: "Diseño de Sistemas Mecatrónicos",
      subCompetencies: [
        {
          id: "3.1",
          title: "3.1. Fabricar equipos, sistemas y procesos mecatrónicos de acuerdo con diseño.",
          description: "Ejecución técnica de la manufactura y ensamblaje de sistemas siguiendo planos y especificaciones de diseño formal.",
          evidences: [
            { name: "Labs EAA (BJT, Filtros, JFET)",   type: "Protoboard / Simulink / Osciloscopio / BJT / JFET / LM324 / Filtros RC / Validación teórico / simulado / experimental", link: "#" },
            { name: "Labs ED (Semáforo, Circuitos lógicos, Secuencial)",   type: "Compuertas TTL / Karnaugh / Flip-Flop JK / Display 7 segmentos / Simulink / Protoboard", link: "#" },
            { name: "PIC II - Módulo de recolección de datos", type: "PCB personalizada / Soldadura SMD / Carcasa 3D / ATmega328PB / Ensamblaje" , link: "#"}
      ]
            },
        {
          id: "3.2",
          title: "3.2. Incorporar tecnologías (ya evaluadas) a sistemas y procesos mecatrónicos.",
          description: "Integración de módulos tecnológicos validados para potenciar la funcionalidad de sistemas mecatrónicos existentes.",
          evidences: [
            { name: "Labs TMPR (Lab 3, Lab 4)", type: "RFID RC522 / LM35 / DHT11 / MQ135 / SPI / I2C / Python / Integración de módulos validados"  , link: "#"},
            { name: "PIC II - Módulo de recolección de datos", type: "ATmega328PB / Sigfox / PCB / Backend IoT / MCDM / Sensores ambientales" , link: "#" }
          ]
        },
        {
          id: "3.3",
          title: "3.3 Generar insumos de procesos existentes para el diseño o rediseño de un sistema.",
          description: "Análisis de sistemas operativos para extraer parámetros técnicos necesarios para su optimización o rediseño integral.",
          evidences: [
            { name: "PIC I - Sistema Pick to Light", type: "Ishikawa / Matriz multicriterio / Tinkercad / Autodesk Inventor / Rediseño de proceso industrial" , link: "#" },
            { name: "Labs EAA (Filtros, BJT)", type: "LM324 / BJT / Punto Q / Frecuencia de corte / Análisis comparativo de configuraciones / Parámetros para rediseño" , link: "#" }
          ]
        }
      ],
      evidences: [],
      reflection: "El diseño mecatrónico me enseñó que fabricar no es solo ensamblar, sino traducir decisiones fundamentadas en hardware real. A través de los laboratorios de electrónica analógica y digital consolidé la capacidad de implementar circuitos siguiendo especificaciones formales, validando cada etapa entre simulación y físico. En el PIC I aprendí a generar insumos técnicos desde el análisis del problema, usando Ishikawa y matrices multicriterio antes de diseñar. En el PIC II llevé ese proceso al extremo: diseñé una PCB, soldé componentes SMD, imprimí una carcasa en PLA y desplegué un sistema IoT real. Entendí que el diseño robusto no empieza en el circuito, sino en la justificación de cada componente.",
      resources: [
        { name: "MATLAB/Simulink", url: "https://www.mathworks.com/products/simulink.html" },
      ],
      link: "https://drive.google.com/drive/u/1/folders/1O-TYA7JWIHOSZWaqeKgqRc4MnKlkk5El"
    },
    {
      id: "pro4",
      title: "Area 04 - Innovación e Investigación",
      area: "R&D",
      description: "Innovación e Investigación",
      subCompetencies: [
        {
          id: "4.1",
          title: "4.1. Reconocer paradigmas tecnológicos tradicionales e innovadores presentes en una infraestructura o equipamiento industrial, con el propósito de optimizar sistemas y procesos mecatrónicos.",
          description: "Identificación y análisis de tecnologías emergentes para su aplicación estratégica en la mejora de procesos industriales.",
          evidences: [
             { name: "PIC II - Módulo de recolección de datos", type: "Sigfox vs WiFi vs LoRa / MCDM  / Bajo consumo energético / Selección tecnológica justificada" , link: "#" },
             { name: "PIC I - Sistema Pick to Light", type: "Ishikawa / Matriz multicriterio / Paradigma Pick to Light / Alternativas de diseño evaluadas / Selección de solución óptima" , link: "#" },
             { name: "Laboratorio 4 - TMPR", type: "SPI vs I2C vs UART / Comparativa de protocolos industriales / Robustez vs velocidad / Selección justificada de arquitectura maestro-esclavo", link: "https://drive.google.com/file/d/1SsyFmSyxe-eTx39NV40ZSN1uZHM2e7R_/view?usp=drive_link" }
          ]
        },
        {
          id: "4.2",
          title: "4.2. Fabricar prototipos para sistemas y procesos mecatrónicos.",
          description: "Construcción de modelos funcionales experimentales para la validación de hipótesis técnicas y soluciones innovadoras.",
          evidences: [
             { name: "PIC II - Módulo de recolección de datos", type: "PCB personalizada / Soldadura SMD / Carcasa 3D PLA / ATmega328PB / Prototipo IoT funcional desplegado en campo" , link: "#" },
             { name: "PIC I - Sistema Pick to Light", type: "Arduino Uno / Tinkercad / Autodesk Inventor / Prototipo Sistema Pick to Light / Validación de concepto industrial" , link: "#" },
             { name: "Laboratorio (1, 2, 3, 4) - TMPR", type: "ATmega328P / Ensamblador / Lenguaje C / Proteus / PicSimLab / Prototipado iterativo simulación-físico", link: "https://drive.google.com/file/d/1SsyFmSyxe-eTx39NV40ZSN1uZHM2e7R_/view?usp=drive_link" },
             { name: "Labs ED (1, 2, 3)",   type: "Compuertas TTL / Flip-Flop JK / Karnaugh / Simulink / Prototipado de lógica combinacional y secuencial en protoboard", link: "#" }
          ]
        },
        {
          id: "4.3",
          title: "4.3. Colaborar en la integración de nuevas tecnologías a los sistemas mecatrónicos realizando pruebas / ensayos.",
          description: "Participación activa en el testeo y refinamiento de integraciones tecnológicas de vanguardia.",
          evidences: [
            { name: "IoT SigFox y Gemelo Digital PIC II", type: "Innovación", link: "#" },
            { name: "Validación de Arquitecturas", type: "Ensayos", link: "#" }
          ]
        }
      ],
      evidences: [],
      reflection: "La innovación en mecatrónica no es un acto aislado sino un proceso acumulativo. Investigar protocolos de comunicación industrial me enseñó que cada tecnología responde a un contexto: SPI para velocidad, I2C para simplicidad, Sigfox para eficiencia energética en IoT. En el PIC II ese análisis comparativo se materializó en decisiones concretas justificadas con matrices MCDM, eligiendo Sigfox sobre WiFi y LoRa por su consumo y cobertura. Cada prototipo que construí, desde circuitos en protoboard hasta una PCB soldada con carcasa impresa, fue una hipótesis técnica validada en físico. Entendí que investigar sin prototipar es teoría, y prototipar sin investigar es azar.",
      resources: [
        { name: "Evidencias Area 04 Drive", url: "https://drive.google.com/drive/u/1/folders/1uZr0mWRwIGXNhYLFkosF35GK0HOaNPGe" },
      ],
      link: "https://drive.google.com/drive/u/1/folders/1uZr0mWRwIGXNhYLFkosF35GK0HOaNPGe"
    }
  ];

  const transversalCompetencies = [
    {
      id: "soft1",
      title: "Comunicacion",
      area: "SOFT",
      description: "La habilidad para expresar ideas técnicas de manera clara y efectiva tanto en español como en inglés profesional.",
      evidences: [
        { name: "Informe XV Congreso CTG - Voluntaria", type: "Redacción técnica / Comunicación académica / Perspectiva de género en STEM",  link: "https://drive.google.com/file/d/1X4jI-7knJR73lKpkvu9aUKpVHVVlBcX5/view" },
        { name: "LinguaSkill Cambridge - B2", type: "Cambridge English Scale / Listening C1 / Reading C1 / Speaking B2 / Writing B2",   link: "https://drive.google.com/file/d/1AW7DZFOkqdJeglgT9ue_hvrppzP255iC/view" },
        { name: "Informes técnicos",  type: "Redacción técnica en formato IEEE / Documentación de resultados experimentales" },
        { name: "PIC I y PIC II - Informes integradores",  type: "Presentación oral / Informe técnico / Comunicación de soluciones de ingeniería" }
],
      reflection: "Comunicar en ingeniería no es solo escribir informes, es traducir decisiones técnicas en argumentos comprensibles. A lo largo de la carrera redacté informes en formato IEEE para todas las UCs, documentando metodología, resultados y análisis comparativos con rigor académico. Cada proyecto integrador implicó además instancias de presentación oral ante docentes y evaluadores, donde debí defender decisiones técnicas, responder preguntas críticas y comunicar resultados de forma clara y estructurada. El LinguaSkill Cambridge validó mi nivel B2 general, aunque en Listening y Reading obtuve C1, lo que refleja una capacidad real de operar en entornos técnicos internacionales. Participar como voluntaria en el XV Congreso de Ciencia, Tecnología y Género me expuso a comunicación académica de alto nivel y me exigió coordinar, orientar y representar a UTEC ante personas de distintos países. Comunicar bien no es un complemento de la ingeniería, es parte de ella.",
      resources: [
        { name: "Validador oficial del certificado LinguaSkill,", url: "https://results.linguaskill.com" }
      ]
    },
    {
      id: "soft2",
      title: "Trabajo en Equipo",
      area: "SOFT",
      description: "Colaboracion efectiva en entornos multidisciplinarios, asumiendo roles de liderazgo o apoyo según la necesidad del proyecto.",
     evidences: [
        { name: "International Buddy Program - UTEC", 
          type: "Mentoría intercultural / Liderazgo / Acompañamiento a estudiante internacional", 
          link: "https://drive.google.com/file/d/172GdTCqQ9zAv-CzrXd_uTjmEOTxD-yGm/view" },
        { name: "XV Congreso CTG - Voluntaria", 
          type: "Trabajo en equipo internacional / Logística / Colaboración multidisciplinaria", 
          link: "https://drive.google.com/file/d/1X4jI-7knJR73lKpkvu9aUKpVHVVlBcX5/view" },
        { name: "PIC I y PIC II - Proyectos grupales", 
          type: "Roles definidos / Trabajo colaborativo / Entregas coordinadas en equipo" },
        { name: "Laboratorios - Trabajos grupales", 
          type: "Informes coautorados / Laboratorios en equipo / División de tareas técnicas" }
      ],
      reflection: "Ningún sistema mecatrónico se construye solo. Todos mis proyectos e informes fueron desarrollados en equipo, lo que me enseñó que la colaboración efectiva exige tanto competencia técnica como habilidades interpersonales. En el PIC I y PIC II coordiné con mis compañeras la división de tareas entre hardware, software y documentación. Fuera del aula, el International Buddy Program me asignó la responsabilidad de acompañar a un estudiante internacional en su integración a UTEC, un rol que requirió empatía, planificación y comunicación sostenida. En el XV Congreso CTG trabajé con un equipo de voluntarios de distintas carreras y países durante cuatro días de logística real. Aprendí que un equipo funciona cuando cada persona entiende su rol y confía en el del otro.",
      resources: [
        { name: "Repositorio Tecnologías de Microprocesamiento", url: "https://github.com/Victoriaetch/Microcontroladores" }
        { name: "Repositorio PIC II", url: "https://github.com/sosaguadalupe/Modulo_recolector_de_datos" }
       
      ]
    },
    {
      id: "soft3",
      title: "Autorregulación",
      area: "EXE",
      description: "Gestión autónoma del aprendizaje y mejora continua de habilidades mecatrónicas, adaptándose a nuevos desafíos.",
     evidences: [
        { name: "IV Taller de Soldadura - 20hs", 
          type: "Formación extracurricular / Soldadura industrial / Normas IPC", 
          link: "https://drive.google.com/file/d/16jrBM1rOO43Z3RpYLKcQNxoeHx_wIeJ9/view" },
        { name: "Taller Seguridad Laboral y Salud Ocupacional - Extintores", 
          type: "Formación complementaria / Seguridad industrial / Actuación ante emergencias", 
          link: "https://drive.google.com/file/d/1z--lMDFwVvERVv1GQHV9BxkZV1In3zDb/view" },
        { name: "International Buddy Program - UTEC", 
          type: "Iniciativa propia / Gestión de programa extracurricular / Desarrollo intercultural" },
        { name: "LinguaSkill - Preparación autónoma", 
          type: "Autoaprendizaje / Inglés técnico / Certificación internacional Cambridge" }
      ],
      reflection: "La carrera de mecatrónica exige aprender más rápido de lo que el currículo puede enseñar. Busqué formación complementaria de forma sistemática: el Taller de Soldadura me dio competencias en SMAW, GTAW, GMAW y soldadura de electrónica que apliqué directamente en el PIC II al soldar componentes SMD en la PCB. El taller de Seguridad Laboral me preparó para actuar ante emergencias industriales reales. El Buddy Program y el Congreso CTG fueron decisiones propias, no obligatorias. Preparar el LinguaSkill de forma autónoma fue otro ejemplo de identificar una brecha y cubrirla sin esperar que el sistema lo pidiera. Autorregularme significó entender que mi formación no termina en el aula.",
      resources: [
        { name: "Técnica Pomodoro para Ingeniería", url: "#" },
        { name: "Gestión de Proyectos con Trello", url: "#" }
      ]
    },
    {
      id: "soft4",
      title: "Pensamiento Crítico",
      area: "EXE",
      description: "Análisis de problemas complejos y toma de decisiones basadas en evidencia técnica y datos experimentales.",
     evidences: [
        { name: "Lab 4 TMPR - Diagnóstico SPI vs I2C", 
          type: "Análisis de fallas / Identificación de causa raíz / Corrección basada en evidencia" },
        { name: "PIC II - MCDM Sigfox vs WiFi vs LoRa", 
          type: "Toma de decisiones técnicas / Matrices multicriterio / Análisis comparativo justificado" },
        { name: "Lab 4 EAA - Discrepancias JFET teórico vs práctico", 
          type: "Análisis crítico de resultados / Identificación de parámetros reales vs asumidos" },
        { name: "Lab 5 EAA - Diagnóstico fallo integrador LM324", 
          type: "Diagnóstico de fallo experimental / Hipótesis técnicas / Razonamiento sistemático" }
      ],
      reflection: "En ingeniería, la diferencia entre un resultado y un aprendizaje es el análisis. A lo largo de la carrera desarrollé la capacidad de cuestionar resultados, identificar causas raíz y tomar decisiones basadas en evidencia en lugar de intuición. Ante discrepancias entre lo teórico, lo simulado y lo experimental, aprendí a no aceptar el primer resultado como válido sino a investigar el origen de la diferencia. En los proyectos integradores apliqué herramientas de análisis multicriterio para justificar decisiones de diseño con datos concretos. El pensamiento crítico no es dudar de todo, es no aceptar ningún resultado sin entender por qué.",
      resources: [
        { name: "El Método de Ingeniería", url: "#" },
        { name: "Pensamiento Crítico Aplicado", url: "#" }
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignGuestbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage || !newName) return;
    
    const path = 'guestbook';
    try {
      await addDoc(collection(db, path), {
        name: newName,
        text: newMessage,
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp()
      });
      setNewMessage("");
      setNewName("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("¿Desea eliminar este mensaje del sistema?")) return;

    try {
      await deleteDoc(doc(db, 'guestbook', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `guestbook/${id}`);
    }
  };

  const handleReplyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !replyingTo || !replyText) return;

    setIsReplying(true);
    try {
      await updateDoc(doc(db, 'guestbook', replyingTo), {
        reply: replyText
      });
      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `guestbook/${replyingTo}`);
    } finally {
      setIsReplying(false);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        alert(`ERROR DE DOMINIO: El dominio "${currentDomain}" no está autorizado en Firebase.\n\nINSTRUCCIONES:\n1. Ve a Firebase Console.\n2. Autenticación > Configuración > Dominios autorizados.\n3. Añade "${currentDomain}" a la lista.\n4. Espera 1-2 minutos y recarga la página.`);
      } else if (error.code === 'auth/popup-blocked') {
        alert("El navegador bloqueó la ventana emergente. Por favor, habilita las ventanas emergentes para este sitio.");
      } else {
        alert("Error de sesión: " + (error.message || "Inténtalo de nuevo."));
      }
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <div 
      className="fixed inset-0 font-serif text-black selection:bg-blue-900 selection:text-white overflow-hidden select-none transition-colors duration-1000"
      style={{ 
        backgroundImage: backgroundStyle === 'sunset' 
          ? `url("${backgrounds[backgroundStyle as keyof typeof backgrounds].pattern}"), linear-gradient(to bottom, #ff0080, #7928ca)`
          : backgroundStyle === 'matrix'
          ? `url("${backgrounds[backgroundStyle as keyof typeof backgrounds].pattern}"), linear-gradient(to bottom, rgba(0,255,0,0.1), rgba(0,0,0,0))`
          : `url("${backgrounds[backgroundStyle as keyof typeof backgrounds].pattern}")`,
        backgroundColor: backgrounds[backgroundStyle as keyof typeof backgrounds].bg,
        backgroundRepeat: 'repeat',
        backgroundBlendMode: backgroundStyle === 'space' ? 'normal' : 'overlay'
      }}
    >
      <CursorTrail />
      
      {/* Top Banner / Marquee Area */}
      <div className="absolute top-0 w-full bg-blue-900 text-white h-8 flex items-center border-b-2 border-black overflow-hidden z-50 shadow-md">
          <Marquee scrollamount={2}>
            <span>:: PORTAFOLIO DE COMPETENCIAS - SOFIA CAROLINA MODERNELL PEÑALOZA - UTEC MECATRÓNICA - 5TO SEMESTRE ::</span>
            <span>SITE UNDER CONSTRUCTION - PLEASE PARDON THE DUST! ::</span>
            <span>ACTUALIZADO: 05/05/2026 ::</span>
            <span>ERES EL VISITANTE NÚMERO: {visitorCount} ::</span>
            <span>¡ESCRÍBEME! ✉️ ::</span>
          </Marquee>
      </div>

      {/* Desktop Icons */}
      {/* Desktop Icons Container */}
      <div className="absolute top-12 left-2 md:left-6 w-[calc(100%-1rem)] md:w-full h-[calc(100%-100px)] z-10 flex flex-row md:flex-col flex-wrap content-start items-start gap-x-4 md:gap-x-12 gap-y-4 md:gap-y-8 overflow-y-auto md:overflow-hidden p-2">
        {/* Column 1: System */}
        <a 
          href="https://drive.google.com/drive/u/1/folders/1PJozcpmSTPEWUJyWsWH0GECPV4-CmeGv" 
          target="_blank" 
          rel="noreferrer"
          className="group cursor-pointer flex flex-col items-center no-underline w-20"
        >
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <FolderOpen size={24} className="text-yellow-600" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold text-center">Documentos</span>
        </a>
        <div 
          className="group cursor-pointer flex flex-col items-center w-20" 
          onClick={() => setIsPortfolioOpen(true)}
        >
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Globe size={24} className="text-blue-800" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold text-center">Portfolio.sys</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center w-20" onClick={() => setIsContactOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Monitor size={24} className="text-slate-800" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Mi PC</span>
        </div>

        {/* Column 2: Documentation & Work */}
        <div className="group cursor-pointer flex flex-col items-center w-20" onClick={() => setIsGuestbookOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Book size={24} className="text-blue-700" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Guestbook.txt</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center w-20" onClick={() => setIsGalleryOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Grid3X3 size={24} className="text-orange-600" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Planos_Mec.jpg</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center w-20" onClick={() => setIsAchievementsOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Award size={24} className="text-yellow-600" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold text-center">Logros.exe</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center w-20" onClick={() => setIsMallaOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Map size={24} className="text-emerald-700" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold text-center">Malla.sys</span>
        </div>

        {/* Column 3: Utilities & Media */}
        <div className="group cursor-pointer flex flex-col items-center w-20" onClick={() => setIsMusicOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Music size={24} className="text-pink-600" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Musica.vxd</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center w-20" onClick={() => setIsSpecsOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <ShieldCheck size={24} className="text-blue-800" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Hardware.sys</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center w-20" onClick={cycleBackground}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <ImageIcon size={24} className="text-pink-600" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Fondo.bmp</span>
        </div>

        {/* Column 4: Fun */}
        <div className="group cursor-pointer flex flex-col items-center w-20" onClick={() => setIsTicTacToeOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Gamepad2 size={24} className="text-purple-600 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Game.exe</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center w-20" onClick={() => setIsTerminalOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <TerminalIcon size={24} className="text-green-600" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Console.bat</span>
        </div>
      </div>

      {/* Main Portfolio Window */}
      <Window 
        title="Portfolio_Viewer_v2.0.exe"
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        width="calc(100% - 180px)"
        height="calc(100% - 120px)"
        top="60px"
        left="140px"
        icon={<Globe size={14} className="text-blue-900" />}
        noPadding
      >
        <div className="flex h-full flex-col overflow-hidden bg-white">
          {/* Mobile Top Nav Toggle */}
          <div className="md:hidden flex items-center justify-between bg-slate-300 p-2 border-b border-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-900 flex items-center justify-center text-[10px] font-bold text-yellow-400 italic">SM</div>
              <span className="text-[10px] font-bold text-blue-900 uppercase">Menú Navegación</span>
            </div>
            <button 
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="bg-gray-300 border border-white border-r-gray-700 border-b-gray-700 px-2 py-1 text-[10px] font-bold active:bg-gray-400"
            >
              {showMobileNav ? 'CERRAR' : 'ABRIR'}
            </button>
          </div>

          <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-white">
            {/* Internal Sidebar - The Nav Frame */}
            <aside className={`${showMobileNav ? 'flex' : 'hidden'} md:flex w-full md:w-[150px] bg-slate-300 border-r-2 border-gray-600 p-2 flex-col gap-2 overflow-y-auto overflow-x-hidden shrink-0 font-sans z-20`}>
             <div className="hidden md:block bg-[#a0a0a0] border-2 border-inset border-slate-500 p-2 text-center mb-2" style={{ borderStyle: 'inset' }}>
              <div className="w-10 h-10 bg-blue-900 border-2 border-slate-300 mx-auto mb-1 flex items-center justify-center text-lg font-bold text-yellow-400 italic shadow-md">
                SM
              </div>
              <p className="text-[9px] font-bold text-blue-900 border-t border-gray-500 pt-1">MECATRÓNICA</p>
             </div>
             
             <SidebarBox title="Explorar">
                <div className="flex flex-col gap-1 w-full overflow-hidden">
                  <RetroButton className="w-full text-[9px] px-2" active={activeSection === 'home'} onClick={() => {setActiveSection('home'); setSelectedComp(null); setShowMobileNav(false);}}>
                    INICIO
                  </RetroButton>
                  <RetroButton className="w-full text-[9px] px-2" active={activeSection === 'about'} onClick={() => {setActiveSection('about'); setSelectedComp(null); setShowMobileNav(false);}}>
                    SOBRE_MI
                  </RetroButton>
                  <RetroButton className="w-full text-[9px] px-2" active={activeSection === 'competencias'} onClick={() => {setActiveSection('competencias'); setSelectedComp(null); setShowMobileNav(false);}}>
                    COMPETENCIAS
                  </RetroButton>
                  <RetroButton className="w-full text-[9px] px-2" active={activeSection === 'proyectos'} onClick={() => {setActiveSection('proyectos'); setSelectedComp(null); setShowMobileNav(false);}}>
                    PROYECTOS
                  </RetroButton>
                  <RetroButton className="w-full text-[9px] px-2" active={activeSection === 'contacto'} onClick={() => {setActiveSection('contacto'); setSelectedComp(null); setShowMobileNav(false);}}>
                    CONTACTO
                  </RetroButton>
                </div>
             </SidebarBox>

             <div className="mt-auto pt-4 space-y-4">
                <Counter count={visitorCount} />
                
                <div className="flex flex-wrap justify-center gap-1 scale-[0.8] origin-top">
                  <WebBadge text="Internet" subtext="Explorer" color="white" bgColor="#003399" />
                  <WebBadge text="Best with" subtext="Netscape" color="white" bgColor="#990000" />
                  <WebBadge text="800x600" subtext="Optimized" color="black" bgColor="#ffcc00" />
                </div>
             </div>
            </aside>

            {/* Internal Main Content - The Content Frame */}
            <main className="flex-1 p-6 bg-white overflow-y-auto selection:bg-blue-900 selection:text-white custom-scrollbar scroll-smooth font-serif">
              <AnimatePresence mode="wait">
                {activeSection === 'home' && (
                  <motion.div 
                    key="home"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                   >
                    <div className="text-center md:text-left">
                       <h1 className="text-3xl font-black italic tracking-tighter text-blue-900 border-b-4 border-blue-900 inline-block uppercase mb-4">
                         BIENVENIDO A MI PORTAFOLIO
                       </h1>
                       <div className="bg-slate-50 p-4 border-2 border-inset border-gray-400 mb-4" style={{ borderStyle: 'inset' }}>
                         <p className="text-sm md:text-base leading-relaxed">
                           Hola, soy <strong>Sofia Carolina Modernell Peñaloza</strong>. <br/>
                           Este es mi <strong>Portafolio Digital de Competencias</strong>, diseñado bajo el Plan de Estudios 2023 de la carrera de <strong>Ingeniería en Mecatrónica</strong>. 
                         </p>
                         <p className="mt-2 text-xs md:text-sm italic">
                           El propósito de este sitio es documentar y evidenciar el desarrollo de mis habilidades técnicas y transversales a lo largo de mi formación en <ClassicLink href="https://utec.edu.uy/">UTEC Uruguay</ClassicLink>.
                         </p>
                       </div>
                    </div>





                    <div className="bg-yellow-50 border-2 border-yellow-400 p-3 italic text-[11px] flex items-center gap-3">
                       <MessageSquare size={20} className="text-yellow-600 shrink-0" />
                       <div>
                         <span className="font-bold">¿Te gusta lo que ves?</span> Déjame un saludo en el <button onClick={() => setIsGuestbookOpen(true)} className="text-blue-700 underline font-bold hover:text-blue-900 cursor-pointer">Guestbook.txt</button> para saber que pasaste por acá. ¡Tus comentarios serán muy valorados!
                       </div>
                    </div>

                       <div className="flex justify-center items-center gap-12 py-10 px-6 bg-white border-2 border-inset border-gray-300 shadow-inner" style={{ borderStyle: 'inset' }}>
                       <div className="flex flex-col items-center group">
                         <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center bg-transparent transition-transform group-hover:scale-105">
                           <img 
                             src={getImgPath('assets/images/logo-mecatronica.png')} 
                             alt="Ingeniería en Mecatrónica" 
                             className="max-w-full max-h-full object-contain" 
                             referrerPolicy="no-referrer"
                             onError={(e) => {
                               (e.target as HTMLImageElement).src = "https://utec.edu.uy/wp-content/uploads/2021/11/Mecatronica.png";
                             }}
                           />
                         </div>
                         <span className="text-[10px] font-bold mt-4 text-blue-900 uppercase tracking-widest text-center leading-tight border-t border-gray-100 pt-2 w-full">Ingeniería en<br/>Mecatrónica</span>
                       </div>
                       
                       <div className="h-24 w-px bg-gray-200 hidden md:block" />
                       
                       <div className="flex flex-col items-center group">
                         <div className="w-32 h-24 md:w-48 md:h-32 flex items-center justify-center bg-transparent transition-transform group-hover:scale-105">
                           <img 
                             src={getImgPath('assets/images/logo-utec.png')} 
                             alt="UTEC ITR Suroeste" 
                             className="max-w-full max-h-full object-contain" 
                             referrerPolicy="no-referrer"
                             onError={(e) => {
                               (e.target as HTMLImageElement).src = "https://utec.edu.uy/wp-content/uploads/2018/11/logo-utec.png";
                             }}
                           />
                         </div>
                         <span className="text-[10px] font-bold mt-4 text-blue-900 uppercase tracking-widest text-center leading-tight border-t border-gray-100 pt-2 w-full">UTEC ITR<br/>Suroeste</span>
                       </div>
                    </div>

                    <div className="border-t-2 border-gray-200 pt-6 text-center">
                      <div className="mb-4 inline-block">
                        <Blink>
                          <span className="text-sm font-bold text-red-600 border-2 border-red-600 px-4 py-1">*** WORK IN PROGRESS ***</span>
                        </Blink>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'about' && (
                  <motion.div 
                    key="about"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <SectionHeader title="01_PERFIL_INGENIERIA" />
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="shrink-0 w-full md:w-56 space-y-4">
                         <div className="bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 p-1 relative group">
                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-600 z-10"></div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-right-2 border-blue-600 z-10" style={{ borderRightWidth: '2px' }}></div>
                                                         <img 
                                src={getImgPath('assets/images/profile.jpg')} 
                                alt="Sofia Modernell" 
                                className="w-full grayscale border border-black transition-all group-hover:grayscale-0" 
                                onError={(e) => {
                                   (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia";
                                }}
                             />
                            <div className="bg-black text-[#00ff00] text-[7px] font-mono p-1 mt-1 flex justify-between uppercase">
                               <span>SCAN_ACTIVE</span>
                               <Blink>_</Blink>
                            </div>
                         </div>
                         
                         <div className="space-y-2">
                           <StatusIndicator label="Estado" status="Operacional" />
                           <StatusIndicator label="Localización" status="UTEC - ITR Suroeste" />
                           <StatusIndicator label="Especialidad" status="No definida" />
                         </div>

                         <VintageCard title="Hard_Stack.sys">
                            <div className="space-y-3 pt-1">
                               <ProgressBar label="Operación" value={60} color="#A21E74" />
                               <ProgressBar label="Diseño" value={55} color="#00ADEF" />
                               <ProgressBar label="Innovación" value={45} color="#2563eb" />
                               <ProgressBar label="Mantenimiento" value={50} color="#10b981" />
                            </div>
                         </VintageCard>
                      </div>

                      <div className="flex-1 flex flex-col gap-4">
                         <div className="bg-white border-2 border-inset border-gray-300 p-5 shadow-inner" style={{ borderStyle: 'inset' }}>
                            <div className="flex justify-between items-center mb-4 border-b-2 border-blue-900 pb-2">
                               <h2 className="text-2xl font-black italic text-blue-900 uppercase tracking-tighter">Sobre_mi.usr</h2>
                               <div className="flex gap-1">
                                  <div className="w-3 h-3 bg-red-600 border border-black shadow-[1px_1px_0px_white_inset]"></div>
                                  <div className="w-3 h-3 bg-yellow-400 border border-black shadow-[1px_1px_0px_white_inset]"></div>
                                  <div className="w-3 h-3 bg-green-500 border border-black shadow-[1px_1px_0px_white_inset]"></div>
                               </div>
                            </div>
                            
                            <div className="prose prose-sm font-serif max-w-none text-slate-800 space-y-4">
                               <p className="leading-relaxed first-letter:text-4xl first-letter:font-black first-letter:text-blue-900 first-letter:mr-2 first-letter:float-left">
                                 Soy estudiante avanzada de <strong>Ingeniería en Mecatrónica</strong> en la Universidad Tecnológica (UTEC) Suroeste. Mi enfoque se centra en la convergencia entre la mecánica de precisión y el control digital, con un interés particular en el desarrollo de <strong>Sistemas Embebidos</strong> y la arquitectura de soluciones <strong>IoT</strong>.
                               </p>
                               <p className="leading-relaxed italic border-l-4 border-blue-100 pl-4 bg-blue-50/50 py-2">
                                 "Mi objetivo es transformar problemas industriales complejos en automatismos robustos, eficientes y escalables, integrando hardware a medida con firmware optimizado."
                               </p>
                               <p className="leading-relaxed">
                                 A lo largo de mi carrera, he descubierto que la ingeniería no solo se trata de cálculos, sino de <strong>curiosidad metódica</strong>. Como tutora académica, he reforzado mi capacidad de comunicación técnica, simplificando conceptos abstractos para otros estudiantes.
                               </p>
                               <p className="leading-relaxed border-t border-gray-100 pt-2 text-[12px]">
                                 Además, soy una <strong>integrante activa de la comunidad universitaria</strong> en el ITR Suroeste, participando en eventos, ferias de proyectos y espacios de co-creación estudiantil. Considero que el intercambio de ideas y la colaboración interdisciplinaria son pilares fundamentales para la innovación tecnológica.
                               </p>
                            </div>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div className="bg-[#f0f0f0] border border-gray-300 p-3 hover:bg-blue-50 transition-colors group">
                                  <h4 className="text-[10px] font-black text-blue-900 uppercase mb-2 flex items-center gap-2">
                                     <Star size={12} className="group-hover:rotate-45 transition-transform" />
                                     Intereses de Investigación
                                  </h4>
                                  <ul className="text-[11px] space-y-1 text-slate-600 font-mono italic">
                                     <li>{">"} Instrumentación Electrónica</li>
                                     <li>{">"} Protocolos LPWAN (SigFox)</li>
                                     <li>{">"} Fabricación Digital</li>
                                  </ul>
                               </div>
                               <div className="bg-[#f0f0f0] border border-gray-300 p-3 hover:bg-red-50 transition-colors group">
                                  <h4 className="text-[10px] font-black text-red-800 uppercase mb-2 flex items-center gap-2">
                                     <AlertTriangle size={12} className="group-hover:scale-110 transition-transform" />
                                     Enfoque Práctico
                                  </h4>
                                  <p className="text-[11px] text-slate-600 leading-tight italic">
                                     Me especializo en el ciclo completo de prototipado: desde la soldadura SMD hasta la implementación de gemelos digitales.
                                  </p>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'competencias' && !selectedComp && (
                  <motion.div 
                    key="competencias_list"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <SectionHeader title="03_MATRIZ_DE_COMPETENCIAS" />
                    <p className="text-xs mb-4 italic">Selecciona una competencia para ver su documentación completa:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <div className="bg-blue-900 text-white text-[10px] font-bold px-2 py-1 uppercase mb-2">:: Profesionales ::</div>
                          {professionalCompetencies.map(comp => (
                            <div 
                              key={comp.id} 
                              onClick={() => setSelectedComp(comp)}
                              className="bg-gray-100 border-2 border-white border-r-gray-700 border-b-gray-700 p-2 cursor-pointer hover:bg-slate-200 shadow-sm active:translate-y-px"
                            >
                               <div className="flex items-center gap-2">
                                  <FolderOpen size={16} className="text-yellow-600" />
                                  <span className="font-bold text-xs">{comp.title}</span>
                               </div>
                            </div>
                          ))}
                       </div>
                       <div className="space-y-4">
                          <div className="bg-slate-700 text-white text-[10px] font-bold px-2 py-1 uppercase mb-2">:: Transversales ::</div>
                          {transversalCompetencies.map(comp => (
                            <div 
                              key={comp.id} 
                              onClick={() => setSelectedComp(comp)}
                              className="bg-gray-100 border-2 border-white border-r-gray-700 border-b-gray-700 p-2 cursor-pointer hover:bg-slate-200 shadow-sm active:translate-y-px"
                            >
                               <div className="flex items-center gap-2">
                                  <FolderOpen size={16} className="text-blue-600" />
                                  <span className="font-bold text-xs">{comp.title}</span>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'competencias' && selectedComp && (
                  <motion.div 
                    key={`comp_detail_${selectedComp.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                       <RetroButton onClick={() => setSelectedComp(null)}>{'<<'} VOLVER_A_LISTA.EXE</RetroButton>
                    </div>
                    <SectionHeader title={`COMPETENCIA: ${selectedComp.title.toUpperCase()}`} />
                    
                    <div className="bg-white border-2 border-inset border-gray-400 p-4 font-serif" style={{ borderStyle: 'inset' }}>
                       <div className="flex justify-between items-start border-b border-gray-100 mb-2">
                          <h3 className="text-lg font-bold text-blue-900">Descripción</h3>
                          {selectedComp.link && (
                             <ClassicLink href={selectedComp.link}>
                               <span className="flex items-center gap-1 text-[10px] bg-yellow-100 px-2 py-0.5 border border-yellow-600 font-sans shadow-sm">
                                  <FolderOpen size={12} /> VER_FOLDER_DRIVE
                               </span>
                             </ClassicLink>
                          )}
                       </div>
                       <p className="text-sm mb-4 leading-relaxed whitespace-pre-wrap">{selectedComp.description}</p>
                       
                       {selectedComp.subCompetencies ? (
                          <div className="space-y-3 mb-6">
                             {selectedComp.subCompetencies.map((sub: any) => (
                               <details key={sub.id} className="group border border-gray-300 bg-slate-50">
                                 <summary className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-200 list-none font-bold text-xs border-b border-transparent group-open:border-gray-200">
                                   <div className="w-4 h-4 flex items-center justify-center border border-gray-400 bg-white group-open:bg-blue-600 group-open:text-white shrink-0">
                                     <span className="group-open:hidden">+</span>
                                     <span className="hidden group-open:inline">−</span>
                                   </div>
                                   {sub.title}
                                 </summary>
                                 <div className="p-3 bg-white">
                                   <p className="text-[11px] text-gray-600 mb-3 italic">{sub.description}</p>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                             {sub.evidences.map((ev: any, idx: number) => {
                                       const isLinkable = ev.link && ev.link !== "#";
                                       const content = (
                                         <div key={idx} className={`flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 h-full ${isLinkable ? 'hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer' : ''}`}>
                                           <FileText size={14} className="text-blue-900 shrink-0" />
                                           <div className="flex flex-col min-w-0">
                                              <span className="text-[10px] font-bold truncate">{ev.name}</span>
                                              <span className="text-[8px] text-gray-500 uppercase tracking-tighter">[{ev.type}]</span>
                                           </div>
                                         </div>
                                       );

                                       return isLinkable ? (
                                         <a 
                                           key={idx} 
                                           href={getImgPath(ev.link)} 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           className="no-underline block"
                                         >
                                           {content}
                                         </a>
                                       ) : content;
                                     })}
                                   </div>
                                 </div>
                               </details>
                             ))}
                          </div>
                       ) : (
                          <>
                             <h3 className="text-sm font-bold text-slate-700 underline mb-2">Evidencias de Desempeño</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                              {selectedComp.evidences.map((ev: any, i: number) => {
                                  const isLinkable = ev.link && ev.link !== "#";
                                  const content = (
                                    <div key={i} className={`flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 h-full ${isLinkable ? 'hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer' : ''}`}>
                                       <FileText size={14} className="text-blue-900 shrink-0" />
                                       <div className="flex flex-col min-w-0">
                                          <span className="text-[10px] font-bold truncate">{ev.name}</span>
                                          <span className="text-[8px] text-gray-500 uppercase tracking-tighter">[{ev.type}]</span>
                                       </div>
                                    </div>
                                  );

                                  return isLinkable ? (
                                    <a 
                                      key={i} 
                                      href={getImgPath(ev.link)} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="no-underline block"
                                    >
                                      {content}
                                    </a>
                                  ) : content;
                                })}
                             </div>
                          </>
                       )}

                       <div className="bg-blue-50 p-4 border-l-4 border-blue-900 mb-6">
                          <h3 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                             <Star size={14} /> Reflexión del Aprendizaje
                          </h3>
                          <p className="text-xs italic leading-relaxed">"{selectedComp.reflection}"</p>
                       </div>

                       <h3 className="text-sm font-bold text-slate-700 mb-2">Recursos Adicionales</h3>
                       <ul className="list-square ml-6 text-[10px] space-y-1">
                          {selectedComp.resources.map((res: any, i: number) => (
                            <li key={i}>
                               <ClassicLink href={res.url}>{res.name}</ClassicLink>
                            </li>
                          ))}
                       </ul>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'proyectos' && (
                  <motion.div 
                    key="proyectos"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <SectionHeader title="04_GALERIA_DE_PROYECTOS" />
                    <div className="bg-slate-200 border-2 border-slate-500 p-3 shadow-inner">
                      <div className="bg-black border-2 border-inset border-gray-600 p-1 mb-4 overflow-hidden aspect-video flex items-center justify-center relative group" style={{ borderStyle: 'inset' }}>
                        {/* Retro Image Container */}
                        <div className="relative w-full h-full overflow-hidden">
                          <AnimatePresence mode="wait">
                            <motion.img 
                              key={selectedProject}
                              src={projects[selectedProject].img} 
                              initial={{ opacity: 0, scale: 1.1 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.5 }}
                              className="w-full h-full object-cover grayscale-[0.4] contrast-[1.2] brightness-[0.9] sepia-[0.1]"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${projects[selectedProject].title}/600/400`;
                              }}
                            />
                          </AnimatePresence>
                          
                          {/* Vignette Effect */}
                          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] mix-blend-multiply" />
                          
                          {/* CRT Scanline Effect (Local) */}
                          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,0.1) 50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] opacity-20" />
                        </div>

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                           <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-[0.2em] font-sans drop-shadow-sm">
                             {projects[selectedProject].tag}
                           </span>
                           <h3 className="font-bold text-lg md:text-xl italic tracking-tight font-sans">
                             {projects[selectedProject].title}
                           </h3>
                        </div>
                      </div>

                      {/* Navigation Controls */}
                      <div className="flex justify-between items-center bg-[#c0c0c0] p-2 border-t border-white shadow-[0px_1px_0px_white_inset]">
                        <RetroButton onClick={() => setSelectedProject(prev => (prev > 0 ? prev - 1 : projects.length - 1))}>
                          {'<< [PREV_FRAME]'}
                        </RetroButton>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold font-sans italic text-blue-900">INDEX: 00{selectedProject + 1}</span>
                          <div className="flex gap-1 mt-1">
                            {projects.map((_, i) => (
                              <div key={i} className={`w-2 h-1 ${i === selectedProject ? 'bg-blue-600' : 'bg-gray-400'} border border-black/20`} />
                            ))}
                          </div>
                        </div>
                        <RetroButton onClick={() => setSelectedProject(prev => (prev < projects.length - 1 ? prev + 1 : 0))}>
                          {'[NEXT_FRAME] >>'}
                        </RetroButton>
                      </div>

                      {/* Project Meta Info */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 bg-white border-2 border-inset border-gray-300 p-3 italic text-sm" style={{ borderStyle: 'inset' }}>
                           <p className="leading-relaxed font-serif">
                             <span className="font-bold text-blue-900 uppercase text-[10px] block mb-1 font-sans">:: LOG_DESCRIPTION ::</span>
                             {projects[selectedProject].desc}
                           </p>
                        </div>
                        <div className="bg-slate-50 border-2 border-white border-r-gray-700 border-b-gray-700 p-2 flex flex-col justify-center items-center gap-2">
                           <Cpu size={24} className="text-slate-400 opacity-50" />
                           <RetroButton className="text-[9px] w-full" onClick={() => setActiveSection('competencias')}>
                             VER_EVIDENCIAS
                           </RetroButton>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'contacto' && (
                  <motion.div 
                    key="contacto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                   >
                    <SectionHeader title="CANALES_DE_COMUNICACION_SYS" />
                    <VintageCard title="Información_de_Contacto">
                       <p className="mb-4">Para consultas académicas, colaboraciones o reclutamiento mecatrónico:</p>
                       <div className="space-y-3 bg-white border-2 border-inset border-gray-400 p-4" style={{ borderStyle: 'inset' }}>
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-blue-900 flex items-center justify-center text-white shadow-md border-2 border-white">@</div>
                             <div>
                                <div className="text-[9px] font-bold text-gray-500">CORREO ELECTRÓNICO</div>
                                <ClassicLink href="mailto:sofia.modernell@utec.edu.uy">sofia.modernell@utec.edu.uy</ClassicLink>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-[#0077b5] flex items-center justify-center text-white shadow-md border-2 border-white">
                                <Linkedin size={16} />
                             </div>
                             <div>
                                <div className="text-[9px] font-bold text-gray-500">LINKEDIN PROFESSIONAL</div>
                                <ClassicLink href="https://www.linkedin.com/in/sof%C3%ADa-modernell-726965257/">/in/sofia-modernell</ClassicLink>
                             </div>
                          </div>
                       </div>
                    </VintageCard>
                    <div className="bg-slate-800 p-4 text-[#00ff00] font-mono text-[10px] border-2 border-inset border-slate-600" style={{ borderStyle: 'inset' }}>
                       <div>{'>>'} Iniciando contacto remotor...</div>
                       <div>{'>>'} Conexión encriptada vía SSL 2.0</div>
                       <div>{'>>'} Ready for transmit...</div>
                       <div className="mt-2 animate-pulse font-bold">DISPONIBILIDAD: ABIERTA A OPORTUNIDADES</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
      </div>
      </Window>

      {/* Guestbook Window */}
      <Window 
        title="Guestbook_Reader.txt" 
        isOpen={isGuestbookOpen} 
        onClose={() => setIsGuestbookOpen(false)}
        top="15%"
        left="15%"
        width="550px"
        icon={<MessageSquare size={12} className="text-blue-900" />}
      >
        <div className="relative overflow-hidden">
          {/* Admin Indicator */}
          {isAdmin && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-2 right-2 z-50 bg-red-600 text-white border-2 border-black px-2 py-1 text-[10px] font-black italic shadow-lg rotate-3 flex items-center gap-1 animate-pulse"
            >
              <ShieldCheck size={12} /> MODO ADMIN ACTIVADO
            </motion.div>
          )}
          {/* Floating artifacts */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <motion.img 
              src="https://raw.githubusercontent.com/AnestisK/old-web-graphics/master/gifs/tech/ufo.gif" 
              animate={{ y: [0, -150], x: [0, 40], opacity: [0, 0.5, 0] }} 
              transition={{ duration: 12, repeat: Infinity }} 
              className="absolute bottom-0 left-1/4 w-8"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <motion.img 
              src="https://raw.githubusercontent.com/AnestisK/old-web-graphics/master/gifs/smileys/alien.gif" 
              animate={{ y: [0, -200], x: [0, -30], opacity: [0, 0.5, 0] }} 
              transition={{ duration: 18, repeat: Infinity, delay: 3 }} 
              className="absolute bottom-0 right-1/4 w-8"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <div className="space-y-3 mb-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar p-1 relative z-10">
          <AnimatePresence initial={false}>
            {messages.map(m => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-[11px] border-2 border-white border-r-gray-400 border-b-gray-400 bg-gray-100 p-2 shadow-sm"
              >
                 <div className="flex justify-between items-center font-bold text-blue-900 mb-1">
                    <div className="flex items-center gap-1">
                      <span className="bg-blue-900 text-white px-1">USR:</span>
                      <span>{m.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono text-[9px]">{m.date}</span>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setReplyingTo(replyingTo === m.id ? null : m.id)}
                            className="text-blue-600 hover:text-blue-800 p-0.5 border border-transparent hover:border-gray-400 bg-gray-200"
                            title="Responder"
                          >
                            <Reply size={10} />
                          </button>
                          <button 
                            onClick={() => handleDeleteMessage(m.id)}
                            className="text-red-600 hover:text-red-800 p-0.5 border border-transparent hover:border-gray-400 bg-gray-200"
                            title="Eliminar"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                 </div>
                 <p className="italic bg-white p-2 border border-inset border-gray-300" style={{ borderStyle: 'inset' }}>
                   {m.text}
                 </p>

                 {m.reply && (
                   <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 ml-4 p-2 bg-[#ffffcc] border-l-4 border-yellow-500 shadow-sm relative overflow-hidden"
                   >
                     <div className="absolute top-0 right-0 opacity-10 rotate-12">
                       <ShieldCheck size={24} />
                     </div>
                     <div className="text-[9px] font-bold text-yellow-800 uppercase flex items-center gap-1 mb-1">
                       <Reply size={10} /> Respuesta del Sistema (ADMIN):
                     </div>
                     <p className="italic text-slate-700 font-bold">{m.reply}</p>
                   </motion.div>
                 )}

                 {isAdmin && replyingTo === m.id && (
                   <form onSubmit={handleReplyMessage} className="mt-2 ml-4 space-y-1">
                     <textarea 
                        className="w-full text-[10px] p-1 border-2 border-gray-800 border-r-white border-b-white bg-[#ffffcc] h-12"
                        placeholder="Escribir respuesta..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        autoFocus
                     />
                     <div className="flex justify-end gap-2">
                       <button type="button" onClick={() => setReplyingTo(null)} className="text-[9px] px-2 py-0.5 bg-gray-300 border border-gray-600">CANCELAR</button>
                       <button 
                        type="submit" 
                        disabled={isReplying}
                        className={`text-[9px] px-2 py-0.5 border border-black flex items-center gap-1 ${isReplying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 text-white'}`}
                       >
                         {isReplying ? 'ENVIANDO...' : <><Send size={10} /> ENVIAR</>}
                       </button>
                     </div>
                   </form>
                 )}
              </motion.div>
            ))}
          </AnimatePresence>
          {messages.length === 0 && (
            <div className="text-center py-10 opacity-40 italic text-[11px]">
              No hay transmisiones registradas en el buffer...
            </div>
          )}
        </div>
      </div>
        
        <form onSubmit={handleSignGuestbook} className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-2 shadow-inner">
           <div className="flex justify-between items-center border-b border-gray-400 pb-1 mb-1">
             <div className="text-[9px] font-black uppercase text-blue-900 tracking-tighter">GUESTBOOK.DAT</div>
             <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
               {RETRO_VISUALS.map(item => (
                 <AnimatedRetroIcon 
                  key={item.label}
                  url={item.url}
                  label={item.label}
                  onClick={() => setNewMessage(prev => prev + ` [${item.label}] `)}
                 />
               ))}
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-2">
             <div className="flex flex-col gap-0.5">
               <label className="text-[8px] font-bold text-gray-600 uppercase">Remitente:</label>
               <input 
                  type="text" 
                  placeholder="Tu alias..." 
                  className="w-full text-[9px] p-1 border-2 border-inset border-gray-500 bg-white shadow-inner focus:outline-none focus:border-blue-500"
                  style={{ borderStyle: 'inset' }}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
               />
             </div>
             
             <div className="flex flex-col gap-0.5">
               <label className="text-[8px] font-bold text-gray-600 uppercase">Mensaje:</label>
               <textarea 
                  placeholder="Escribe algo..." 
                  className="w-full text-[9px] p-1 border-2 border-inset border-gray-500 bg-white h-10 shadow-inner focus:outline-none focus:border-blue-500 custom-scrollbar"
                  style={{ borderStyle: 'inset' }}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  required
               ></textarea>
             </div>
           </div>

           <div className="flex justify-between items-center pt-1 mt-2 border-t border-gray-400">
             <div className="flex gap-1">
               <div className="w-2 h-2 bg-blue-900"></div>
               <div className="w-2 h-2 bg-blue-600"></div>
               <div className="w-2 h-2 bg-blue-300"></div>
             </div>
             
             {user ? (
               <div className="flex items-center gap-2">
                 <span className="text-[8px] font-mono text-blue-900 truncate max-w-[100px]">{user.email}</span>
                 <button type="button" onClick={handleLogout} className="text-[8px] px-1 bg-red-100 border border-red-800 flex items-center gap-1">
                   <LogOut size={8} /> SALIR
                 </button>
               </div>
             ) : (
               <button type="button" onClick={handleLogin} className="text-[8px] px-1 bg-gray-200 border border-gray-800 flex items-center gap-1 opacity-20 hover:opacity-100 transition-opacity">
                 <ShieldCheck size={8} /> ADMIN_AUTH
               </button>
             )}

             <RetroButton type="submit">
               <div className="flex items-center gap-2">
                 <Send size={12} />
                 <span>ENVIAR_FIRMA.EXE</span>
               </div>
             </RetroButton>
           </div>
        </form>
      </Window>

      {/* Contact Window (Mi PC) */}
      <Window 
        title="Contacto_Y_Sistema.sys" 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)}
        top="50%"
        left="55%"
        width="380px"
        icon={<Monitor size={12} className="text-slate-800" />}
      >
        <div className="space-y-4">
          <div className="bg-slate-100 p-2 border border-slate-300">
             <div className="text-[10px] font-bold text-blue-900 uppercase border-b border-blue-900 mb-2">Canales de Comunicación</div>
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <Mail size={14} className="text-blue-700" />
                   <a href="mailto:sofia.modernell@utec.edu.uy" className="text-[11px] underline">sofia.modernell@utec.edu.uy</a>
                </div>
                <div className="flex items-center gap-2">
                   <Linkedin size={14} className="text-blue-900" />
                   <a href="https://www.linkedin.com/in/sof%C3%ADa-modernell-726965257/" target="_blank" className="text-[11px] underline">LinkedIn /sofia-modernell</a>
                </div>
             </div>
          </div>
          
          <div className="bg-slate-800 text-green-500 p-2 font-mono text-[9px] border-2 border-inset border-slate-500" style={{ borderStyle: 'inset' }}>
             <div className="flex justify-between">
               <div>{user ? `ADMIN_LOGGED_IN: ${user.email}` : 'SYSTEM_INFO_REPORT :: 2026'}</div>
               {user ? (
                 <button onClick={handleLogout} className="text-red-400 hover:underline flex items-center gap-1">
                   <LogOut size={10} /> LOGOUT
                 </button>
               ) : (
                 <button onClick={handleLogin} className="text-blue-400 hover:underline flex items-center gap-1">
                   <LogIn size={10} /> ADMIN_LOGIN
                 </button>
               )}
             </div>
             <hr className="border-green-800 my-1"/>
             <div>LOC: Fray Bentos, Uruguay</div>
             <div>TZ: UTC-3</div>
             <div>BATT: 100% (CHARGING)</div>
             <div className="mt-2 text-yellow-500 animate-pulse">{'>>>'} SESSION ACTIVE {'<<<'}</div>
          </div>
          
          <div className="text-center">
             <RetroButton href="https://drive.google.com/drive/u/1/folders/1PJozcpmSTPEWUJyWsWH0GECPV4-CmeGv" active>
               ABRIR_CV_PDF.INF
             </RetroButton>
          </div>
        </div>
      </Window>

      {/* Achievements Window */}
      <Window
        title="Logros_y_Certificaciones.exe"
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        top="5%"
        left="50%"
        width="460px"
        icon={<Award size={12} className="text-yellow-600" />}
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
          <SectionHeader title="MEDALLERO_TECNICO_UTEC" />
          
          <div className="space-y-3">
            {[
              {
                category: "IDIOMAS • CAMBRIDGE",
                title: "Inglés B2/C1 — LinguaSkill (2023)",
                desc: "Certificación de nivel B2 en inglés académico y técnico, emitida por Cambridge Assessment English.",
                link: "Ver certificado »",
                url: "https://drive.google.com/file/d/1AW7DZFOkqdJeglgT9ue_hvrppzP255iC/view?usp=drive_link",
                icon: <Globe size={16} className="text-blue-600" />
              },
              {
                category: "HABILIDADES TÉCNICAS • UTEC",
                title: "Curso de Soldadura",
                desc: "Certificación en técnicas de soldadura para fabricación electrónica y mecánica, UTEC.",
                link: "Ver certificado »",
                url: "https://drive.google.com/file/d/16jrBM1rOO43Z3RpYLKcQNxoeHx_wIeJ9/view?usp=drive_link",
                icon: <Cpu size={16} className="text-orange-600" />
              },
              {
                category: "TUTORÍAS • UTEC IMEC",
                title: "Tutora Académica — 2026",
                desc: "Orientación a estudiantes ingresantes de Ingeniería en Mecatrónica, apoyo técnico y académico.",
                link: "En curso • 2026",
                icon: <Award size={16} className="text-purple-600" />
              },
              {
                category: "SEGURIDAD • ITR",
                title: "Jornada Emergencias y Evacuación (2024)",
                desc: "Capacitación en evacuación de ITR, teoría del fuego y uso de extintores portátiles.",
                link: "Ver certificado »",
                url: "https://drive.google.com/file/d/1z--lMDFwVvERVv1GQHV9BxkZV1In3zDb/view?usp=drive_link",
                icon: <ShieldCheck size={16} className="text-red-600" />
              },
              {
                category: "FABRICACIÓN DIGITAL • EDU",
                title: "Introducción al Corte Láser (2024)",
                desc: "Curso de fabricación digital. Proyecto final: Diseño y construcción de Mariposa Autómata.",
                link: "Ver trabajo final »",
                url: "https://drive.google.com/file/d/1cfY_dWsGxZAxkClCPtGftTW_0B94Fvaz/view?usp=drive_link",
                icon: <Grid3X3 size={16} className="text-green-600" />
              },
              {
                category: "RELACIONES INTERNACIONALES • UTEC",
                title: "Buddy Program y Networking",
                desc: "Facilitadora en la integración de estudiantes de intercambio y gestión intercultural.",
                link: "Ver Brochure »",
                url: "https://drive.google.com/file/d/172GdTCqQ9zAv-CzrXd_uTjmEOTxD-yGm/view?usp=sharing",
                icon: <Globe size={16} className="text-cyan-600" />
              },
              {
                category: "INNOVACIÓN • UTEC",
                title: "6ª Semana de la Innovación (2023)",
                desc: "Presentación de proyectos tecnológicos y networking especializado en mecatrónica.",
                link: "Innovación & Equipo",
                icon: <Star size={16} className="text-yellow-600" />
              },
              {
                category: "HARDWARE LIBRE • 2022",
                title: "Arduino for Creative Collaboration",
                desc: "Jornadas de colaboración creativa utilizando hardware libre para resolución de problemas.",
                link: "Hardware & Código",
                icon: <Cpu size={16} className="text-blue-600" />
              }
            ].map((item, i) => (
              <div key={i} className="bg-white border-2 border-inset border-gray-400 p-3 shadow-sm hover:bg-gray-50 transition-colors" style={{ borderStyle: 'inset' }}>
                <div className="flex gap-3">
                  <div className="mt-1 p-2 bg-gray-100 border border-gray-300 h-fit">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[9px] font-bold text-blue-900 border-b border-blue-100 mb-1">{item.category}</div>
                    <div className="text-[11px] font-bold text-gray-800">{item.title}</div>
                    <div className="text-[10px] text-gray-600 mt-1 leading-tight">{item.desc}</div>
                    {item.link && (
                      <div className="mt-2 flex items-center gap-2">
                        {item.url ? (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] text-blue-700 font-bold hover:underline flex items-center gap-1 border border-blue-200 px-1 bg-blue-50"
                          >
                            <Download size={10} /> {item.link}
                          </a>
                        ) : (
                          <div className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
                            <FileText size={10} /> {item.link}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-green-50 border-2 border-green-300">
             <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-green-900 uppercase">
                <span>Estado Finalización Créditos Especiales</span>
                <span>100%</span>
             </div>
             <div className="w-full bg-gray-300 h-3 border border-black p-0.5">
                <div className="w-[100%] h-full bg-[#33cb47]" />
             </div>
             <div className="mt-2 text-[9px] text-green-800 italic text-right">
                * Actualizado satisfactoriamente al 100%
             </div>
          </div>
        </div>
      </Window>

      {/* Gallery Window */}
      <Window
        title="Galeria_de_Planos.jpg"
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        top="35%"
        left="5%"
        width="450px"
        icon={<Grid3X3 size={12} className="text-orange-700" />}
      >
        <div className="space-y-4">
          <SectionHeader title="DISEÑOS_MECANICOS_2D_3D" />
          <div className="grid grid-cols-2 gap-2 h-64 overflow-y-auto pr-2 bg-gray-400 p-2 border-2 border-inset border-gray-600" style={{ borderStyle: 'inset' }}>
             {[
               { title: 'Plano_Gavetas.png', file: getImgPath('assets/images/plano-gavetas.png'), color: 'bg-white' },
               { title: 'Ensamblaje.png', file: getImgPath('assets/images/ensamblaje.png'), color: 'bg-blue-50' },
               { title: 'Circuito_PCB.png', file: getImgPath('assets/images/circuito-pcb.png'), color: 'bg-green-50' },
               { title: 'Modulo_Ref.png', file: getImgPath('assets/images/modulo.png'), color: 'bg-red-50' }
             ].map((img, i) => (
               <div key={i} className={`${img.color} border border-black p-1 shadow-md hover:scale-105 transition-transform`}>
                  <div className="h-24 bg-slate-200 flex items-center justify-center border border-gray-400 overflow-hidden">
                     <img 
                        src={img.file} 
                        alt={img.title} 
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) => {
                           (e.target as HTMLImageElement).style.display = 'none';
                           (e.target as HTMLImageElement).parentElement?.classList.add('flex');
                        }}
                     />
                     <ImageIcon size={32} className="text-gray-400 opacity-30 absolute" />
                  </div>
                  <div className="text-[8px] mt-1 font-mono">{img.title}</div>
               </div>
             ))}
          </div>
          <div className="text-[9px] italic border-t border-gray-400 pt-2">
            * Haz click en un plano para abrir en alta resolución (Simulado)
          </div>
        </div>
      </Window>

      {/* Music Player Window */}
      <Window
        title="WinAmp_Mecatronic.vxd"
        isOpen={isMusicOpen}
        onClose={() => setIsMusicOpen(false)}
        top="5%"
        left="70%"
        width="320px"
        icon={<Music size={12} className="text-pink-700" />}
      >
        <div className="space-y-4">
          <SectionHeader title="SISTEMA_DE_AUDIO_RELE" />
          <RetroMusicPlayer />
          <div className="p-1 bg-black text-[#00ff00] font-mono text-[8px]">
             EQ: [NORMAL] | BITRATE: 128KBPS | MONO
          </div>
        </div>
      </Window>

      {/* Tic Tac Toe Window */}
      <Window
        title="Tic_Tac_Toe.exe"
        isOpen={isTicTacToeOpen}
        onClose={() => setIsTicTacToeOpen(false)}
        top="40%"
        left="40%"
        width="280px"
        icon={<Gamepad2 size={12} className="text-purple-700" />}
      >
        <TicTacToe />
      </Window>

      {/* Malla Interactiva Window */}
      <Window
        title="Malla_Interactiva_Mechatronics.html"
        isOpen={isMallaOpen}
        onClose={() => setIsMallaOpen(false)}
        top="8%"
        left="10%"
        width="80%"
        height="80%"
        icon={<Map size={12} className="text-emerald-700" />}
      >
        <div className="w-full h-full bg-white border border-black overflow-hidden flex flex-col">
          <div className="p-1 bg-gray-100 border-b border-black text-[9px] font-mono flex items-center justify-between">
            <span>Address: https://sofiamodernell.github.io/Malla-Interactiva/</span>
            <span className="text-blue-700 underline cursor-pointer" onClick={() => window.open('https://sofiamodernell.github.io/Malla-Interactiva/', '_blank')}>Ver en nueva pestaña</span>
          </div>
          <iframe 
            src="https://sofiamodernell.github.io/Malla-Interactiva/" 
            className="w-full flex-1 border-none"
            title="Malla Interactiva"
          />
        </div>
      </Window>

      {/* Terminal Window */}
      <Window
        title="Terminal_de_Consola.bat"
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        top="50%"
        left="45%"
        width="500px"
        icon={<TerminalIcon size={12} className="text-green-700" />}
      >
        <Terminal />
      </Window>

      {/* Hardware Specs Window */}
      <Window
        title="Especificaciones_Sistema.sys"
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
        top="20%"
        left="60%"
        width="350px"
        icon={<ShieldCheck size={12} className="text-blue-800" />}
      >
        <div className="space-y-4">
          <SectionHeader title="HARDWARE_REPORT" />
          <div className="bg-gray-100 p-4 border border-black font-mono text-[10px]">
             <div className="flex justify-between border-b border-gray-300 pb-1 mb-2">
                <span className="font-bold">COMPONENT</span>
                <span className="font-bold">STATUS</span>
             </div>
             <div className="space-y-1">
                <div className="flex justify-between">
                   <span>CPU: Core_Sofia_i9</span>
                   <span className="text-green-600">[OPTIMAL]</span>
                </div>
                <div className="flex justify-between">
                   <span>RAM: 64GB_CREATIVIDAD</span>
                   <span className="text-green-600">[FREE]</span>
                </div>
                <div className="flex justify-between">
                   <span>GPU: RTX_ENGINEERING_4k</span>
                   <span className="text-green-600">[ACTIVE]</span>
                </div>
                <div className="flex justify-between">
                   <span>SENSOR: EMPATIA_V2</span>
                   <span className="text-blue-600">[CALIBRATING]</span>
                </div>
             </div>
          </div>
          <div className="flex justify-center">
             <div className="w-24 h-24 bg-gray-200 border-2 border-inset border-gray-400 flex items-center justify-center p-2" style={{ borderStyle: 'inset' }}>
                <Cpu size={48} className="text-blue-900 animate-pulse" />
             </div>
          </div>
        </div>
      </Window>

      {/* Status Bar */}
      <div className="absolute bottom-10 w-full h-6 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 text-[9px] md:text-[10px] gap-2 md:gap-4 z-40 overflow-hidden">
           <div className="flex-1 flex gap-2 md:gap-4 truncate">
             <span>OBJ: 12</span>
             <span>LIBRE: 3.4 GB</span>
             <span className="text-blue-900 font-bold italic hidden sm:inline">CONECTADO: 56K MODEM</span>
           </div>
           <div className="w-16 h-4 border border-gray-500 bg-gray-300 px-1">
             <div className="h-full bg-blue-900" style={{ width: '65%' }}></div>
           </div>
        </div>

      {/* Taskbar */}
      <div className="absolute bottom-0 w-full h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 gap-1 z-50">
        <button 
          onClick={() => setIsPortfolioOpen(!isPortfolioOpen)}
          className="h-8 px-4 border-2 border-white border-r-gray-800 border-b-gray-800 bg-[#c0c0c0] flex items-center gap-2 active:border-r-white active:border-b-white active:border-gray-800 group"
        >
          <div className="w-4 h-4 bg-blue-600 rounded-sm group-active:translate-x-0.5 group-active:translate-y-0.5"></div>
          <span className="font-bold text-xs md:text-sm italic group-active:translate-x-0.5 group-active:translate-y-0.5 uppercase">Inicio</span>
        </button>
        <div className="w-[1px] h-6 bg-gray-500 mx-1"></div>
        <button 
          className={`h-8 px-2 md:px-4 border-2 flex items-center text-[9px] md:text-[10px] font-bold gap-1 md:gap-2 ${isPortfolioOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`} 
          style={isPortfolioOpen ? { borderStyle: 'inset' } : {}}
          onClick={() => setIsPortfolioOpen(!isPortfolioOpen)}
        >
          <Globe size={14} className="text-blue-900 shrink-0" />
          <span className="truncate">Portfolio_v2.0</span>
        </button>
        {isGuestbookOpen && (
          <button 
            onClick={() => setIsGuestbookOpen(!isGuestbookOpen)}
            className={`h-8 px-4 border-2 flex items-center text-[10px] font-bold gap-2 ${isGuestbookOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`}
            style={isGuestbookOpen ? { borderStyle: 'inset' } : {}}
          >
            <MessageSquare size={12} className="text-blue-900" />
            Guestbook.txt
          </button>
        )}
        {isContactOpen && (
          <button 
            onClick={() => setIsContactOpen(!isContactOpen)}
            className={`h-8 px-4 border-2 flex items-center text-[10px] font-bold gap-2 ${isContactOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`}
            style={isContactOpen ? { borderStyle: 'inset' } : {}}
          >
            <Monitor size={12} className="text-slate-800" />
            Mi PC
          </button>
        )}
        {isTicTacToeOpen && (
          <button 
            onClick={() => setIsTicTacToeOpen(!isTicTacToeOpen)}
            className={`h-8 px-4 border-2 flex items-center text-[10px] font-bold gap-2 ${isTicTacToeOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`}
            style={isTicTacToeOpen ? { borderStyle: 'inset' } : {}}
          >
            <Gamepad2 size={12} className="text-purple-700" />
            Tic Tac Toe
          </button>
        )}
        {isTerminalOpen && (
          <button 
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`h-8 px-4 border-2 flex items-center text-[10px] font-bold gap-2 ${isTerminalOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`}
            style={isTerminalOpen ? { borderStyle: 'inset' } : {}}
          >
            <TerminalIcon size={12} className="text-green-700" />
            Terminal
          </button>
        )}
        {isSpecsOpen && (
          <button 
            onClick={() => setIsSpecsOpen(!isSpecsOpen)}
            className={`h-8 px-4 border-2 flex items-center text-[10px] font-bold gap-2 ${isSpecsOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`}
            style={isSpecsOpen ? { borderStyle: 'inset' } : {}}
          >
            <ShieldCheck size={12} className="text-blue-800" />
            Specs
          </button>
        )}
        {isAchievementsOpen && (
          <button 
            onClick={() => setIsAchievementsOpen(!isAchievementsOpen)}
            className={`h-8 px-4 border-2 flex items-center text-[10px] font-bold gap-2 ${isAchievementsOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`}
            style={isAchievementsOpen ? { borderStyle: 'inset' } : {}}
          >
            <Award size={12} className="text-yellow-600" />
            Logros
          </button>
        )}
        {isMusicOpen && (
          <button 
            onClick={() => setIsMusicOpen(!isMusicOpen)}
            className={`h-8 px-4 border-2 flex items-center text-[10px] font-bold gap-2 ${isMusicOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`}
            style={isMusicOpen ? { borderStyle: 'inset' } : {}}
          >
            <Music size={12} className="text-pink-600" />
            Musica
          </button>
        )}
        {isGalleryOpen && (
          <button 
            onClick={() => setIsGalleryOpen(!isGalleryOpen)}
            className={`h-8 px-4 border-2 flex items-center text-[10px] font-bold gap-2 ${isGalleryOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`}
            style={isGalleryOpen ? { borderStyle: 'inset' } : {}}
          >
            <Grid3X3 size={12} className="text-orange-600" />
            Planos
          </button>
        )}
        {isMallaOpen && (
          <button 
            onClick={() => setIsMallaOpen(!isMallaOpen)}
            className={`h-8 px-4 border-2 flex items-center text-[10px] font-bold gap-2 ${isMallaOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`}
            style={isMallaOpen ? { borderStyle: 'inset' } : {}}
          >
            <Map size={12} className="text-emerald-700" />
            Malla
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
           <div className="h-8 px-3 border-2 border-gray-800 border-r-white border-b-white flex items-center gap-2 font-mono text-[10px] font-bold">
              {isMusicOn ? <Volume2 size={12} className="text-blue-800" /> : <VolumeX size={12} className="text-gray-400" />}
              {currentTime}
           </div>
        </div>
      </div>

      {/* Scanline pattern overlay (Visual Knick-knack) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] overflow-hidden" 
           style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}>
      </div>
    </div>
  );
}
