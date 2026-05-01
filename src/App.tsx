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
  Window
} from './components/VintageUI';
import { CursorTrail } from './components/CursorTrail';
import { Mail, Linkedin, FolderOpen, Star, AlertTriangle, Monitor, HardDrive, Cpu, Globe, Volume2, VolumeX, MessageSquare, FileText, Award, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  serverTimestamp, 
  doc, 
  increment,
  setDoc,
  getDoc,
  limit
} from 'firebase/firestore';
import { db, auth } from './lib/firebase';

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
}

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
  const [isFunZoneOpen, setIsFunZoneOpen] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState('classic');

  useEffect(() => {
    // Visitor counter logic
    const visitorDoc = doc(db, 'visitors', 'total');
    
    // Increment count on load
    const updateCount = async () => {
      try {
        const snap = await getDoc(visitorDoc);
        if (!snap.exists()) {
          // Use setDoc for first time
          await setDoc(visitorDoc, { count: 1 });
        } else {
          // Use updateDoc for subsequent increments
          await updateDoc(visitorDoc, { count: increment(1) });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'visitors/total');
      }
    };

    updateCount();

    // Listen to count
    const unsubVisitors = onSnapshot(visitorDoc, (doc) => {
      if (doc.exists()) {
        setVisitorCount(doc.data().count);
      }
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
    };
  }, []);

  function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
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
    classic: { bg: '#008080', pattern: 'https://www.transparenttextures.com/patterns/marble-similar.png' },
    space: { bg: '#000000', pattern: 'https://www.transparenttextures.com/patterns/stardust.png' },
    blueprint: { bg: '#003366', pattern: 'https://www.transparenttextures.com/patterns/grid-me.png' },
    clouds: { bg: '#87CEEB', pattern: 'https://www.transparenttextures.com/patterns/cloudy-day.png' }
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
      tag: "EMBEDDED / IoT",
      desc: "PCB propia con ATmega328PB, sensores y SigFox IoT. Incluye gemelo digital.",
      img: "https://picsum.photos/seed/pcb/600/400"
    },
    {
      title: "Pick-to-Light System",
      tag: "AUTOMATION",
      desc: "Sistema de guiado lumínico para depósitos optimizado mediante análisis Ishikawa.",
      img: "https://picsum.photos/seed/storage/600/400"
    },
    {
      title: "Robot Seguidor de Línea",
      tag: "ROBOTICS",
      desc: "Robot de competencia con control PID ajustado para máxima velocidad en trayectorias curvas.",
      img: "https://picsum.photos/seed/robot/600/400"
    }
  ];

  const professionalCompetencies = [
    {
      id: "pro1",
      title: "Area 01 — Operacion",
      area: "PRO",
      description: "Implementar sw/hw para procesos industriales y monitorear capacidad operacional mediante el uso de herramientas específicas de la mecatrónica.",
      evidences: [
        { name: "Labs EAA - Transistores", type: "Doc", link: "#" },
        { name: "Labs ED1 - Logic Gates", type: "Logic", link: "#" },
        { name: "Proyecto PIC II (SigFox)", type: "Board", link: "#" }
      ],
      reflection: "A través del trabajo en laboratorios de Electrónica Analógica y Digital, logré comprender la importancia de la precisión en el monitoreo de señales industriales. La implementación en el PIC II me permitió aplicar estos conceptos en un entorno IoT real.",
      resources: [
        { name: "Principios de Electrónica Analógica", url: "#" },
        { name: "Datasheet ATmega328PB", url: "https://ww1.microchip.com/downloads/en/DeviceDoc/40001906A.pdf" },
        { name: "Guía de Instrumentación Industrial", url: "#" }
      ],
      link: "https://drive.google.com/drive/u/1/folders/1vV15lVgWN9c30LRsY4HgE3z9dhCtd2Ue"
    },
    {
      id: "pro2",
      title: "Area 02 — Mantenimiento",
      area: "PRO",
      description: "Ejecutar planes de mantenimiento preventivo y correctivo en sistemas mecatrónicos complejos para asegurar la continuidad operativa.",
      evidences: [
        { name: "Plan de Mantenimiento PIC I", type: "Doc", link: "#" },
        { name: "Reparación Fuente Conmutada", type: "Img", link: "#" }
      ],
      reflection: "El mantenimiento no es solo arreglar lo roto, sino prever fallos. En el Lab 4 de TMPR, optimizamos los tiempos de parada mediante un análisis exhaustivo de puntos críticos.",
      resources: [
        { name: "Manual de Mantenimiento Clase A", url: "#" },
        { name: "Normas de Seguridad Eléctrica ISA", url: "#" },
        { name: "Guía ISA-S5.1", url: "#" }
      ],
      link: "https://drive.google.com/drive/u/1/folders/17Retv7992rLRJWRwvWbupOL5darzVy8d"
    },
    {
      id: "pro3",
      title: "Area 03 — Diseño",
      area: "ENG",
      description: "Fabricar equipos segun especificaciones y rediseñar sistemas mecatrónicos utilizando CAD/CAM y herramientas de simulación.",
      evidences: [
        { name: "Diseño PCB en KiCad", type: "Schematic", link: "#" },
        { name: "Modelado 3D Carcasa PIC", type: "STL", link: "#" }
      ],
      reflection: "El diseño es la etapa donde la creatividad se encuentra con la norma. Rediseñar la placa del PIC II para que sea SigFox-ready fue un desafío de ruteado y gestión de interferencias.",
      resources: [
        { name: "Best Practices in PCB Design", url: "#" },
        { name: "Simulación en Multisim/KiCad", url: "#" },
        { name: "KiCad Documentation", url: "https://docs.kicad.org/" }
      ],
      link: "https://drive.google.com/drive/u/1/folders/1O-TYA7JWIHOSZWaqeKgqRc4MnKlkk5El"
    },
    {
      id: "pro4",
      title: "Area 04 — Innovacion",
      area: "R&D",
      description: "Investigar e implementar soluciones innovadoras en hardware y firmware para resolver problemas no convencionales.",
      evidences: [
        { name: "Algoritmo PID Optimizado", type: "Code", link: "#" },
        { name: "Integración LPWAN/SigFox", type: "IoT", link: "#" }
      ],
      reflection: "La innovación en mecatrónica requiere estar al día con las nuevas tecnologías. Implementar conectividad de larga distancia en un dispositivo de bajo consumo cambió mi perspectiva sobre el alcance de mis proyectos.",
      resources: [
        { name: "LPWAN Technologies Overview", url: "#" },
        { name: "Investigación: Edge Computing en IoT", url: "#" },
        { name: "IEEE Xplore - Robotics", url: "#" }
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
        { name: "Presentación Congreso CTG", type: "Slides", link: "#" },
        { name: "Informe Técnico PIC II", type: "PDF", link: "#" },
        { name: "LinguaSkill Result (B2)", type: "Crt", link: "#" }
      ],
      reflection: "Desarrollé mis habilidades de comunicación a través de la presentación de proyectos en clase y la redacción de informes detallados. El examen LinguaSkill B2 validó mi capacidad de operar en entornos internacionales.",
      resources: [
        { name: "Cambridge Preparation Materials", url: "#" }
      ]
    },
    {
      id: "soft2",
      title: "Trabajo en Equipo",
      area: "SOFT",
      description: "Colaboracion efectiva en entornos multidisciplinarios, asumiendo roles de liderazgo o apoyo según la necesidad del proyecto.",
      evidences: [
        { name: "Bitácora PIC II (Grupal)", type: "Log", link: "#" },
        { name: "Organización Estudiantil", type: "Doc", link: "#" }
      ],
      reflection: "El trabajo en equipo en mecatrónica es esencial dado que nadie es experto en todo. Aprender a delegar tareas de software mientras yo me enfocaba en el hardware fue clave para el éxito del PIC II.",
      resources: [
        { name: "Agile Methodologies for Teams", url: "#" }
      ]
    },
    {
      id: "soft3",
      title: "Autorregulación",
      area: "EXE",
      description: "Gestión autónoma del aprendizaje y mejora continua de habilidades mecatrónicas, adaptándose a nuevos desafíos.",
      evidences: [
        { name: "LinguaSkill B2", type: "Cert", link: "#" },
        { name: "Tutorías Académicas", type: "Doc", link: "#" },
        { name: "Curso de Corte Láser", type: "Doc", link: "#" }
      ],
      reflection: "La autorregulación me ha permitido mantenerme al día con las exigencias de la carrera y buscar formaciones complementarias fuera del currículo obligatorio.",
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
        { name: "Análisis de Fallos Lab 4 TMPR", type: "PDF", link: "#" },
        { name: "Optimización PIC II", type: "Doc", link: "#" },
        { name: "Tutorías de Electrónica", type: "Doc", link: "#" }
      ],
      reflection: "El pensamiento crítico es el corazón de la ingeniería. Cuestionar por qué un circuito no funciona y analizar los datos de salida me ha permitido resolver problemas que parecían insolubles.",
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

  return (
    <div 
      className="fixed inset-0 font-serif text-black selection:bg-blue-900 selection:text-white overflow-hidden select-none"
      style={{ 
        backgroundImage: `url("${backgrounds[backgroundStyle as keyof typeof backgrounds].pattern}")`,
        backgroundColor: backgrounds[backgroundStyle as keyof typeof backgrounds].bg,
        backgroundRepeat: 'repeat'
      }}
    >
      <CursorTrail />
      
      {/* Top Banner / Marquee Area */}
      <div className="absolute top-0 w-full bg-blue-900 text-white h-8 flex items-center border-b-2 border-black overflow-hidden z-50 shadow-md">
        <Marquee scrollamount={3}>
          *** PORTFOLIO DE COMPETENCIAS :: SOFIA CAROLINA MODERNELL PEÑALOZA :: UTEC - MECATRONICA :: PLAN 2023 :: 5TO SEMESTRE *** CAUTION: TOO MUCH ENGINEERING CAN CAUSE UNEXPECTED C++ COMPILATION ERRORS IN REAL LIFE *** HANDLE WITH PROPER ESD PROTECTION ***
        </Marquee>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-12 left-6 grid grid-cols-1 gap-8 text-center z-10 w-24">
        <a 
          href="https://drive.google.com/drive/u/1/folders/1PJozcpmSTPEWUJyWsWH0GECPV4-CmeGv" 
          target="_blank" 
          rel="noreferrer"
          className="group cursor-pointer flex flex-col items-center no-underline"
        >
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <FolderOpen size={24} className="text-yellow-600" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Mis Documentos</span>
        </a>
        <div 
          className="group cursor-pointer flex flex-col items-center" 
          onClick={() => setIsPortfolioOpen(true)}
        >
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Globe size={24} className="text-blue-800" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold uppercase">Portfolio.exe</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center" onClick={() => setIsGuestbookOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <div className="w-6 h-6 bg-yellow-400 border border-black flex items-center justify-center text-[8px] font-bold">TEXT</div>
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Guestbook.txt</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center" onClick={() => setIsContactOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Monitor size={24} className="text-slate-800" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Mi PC</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center" onClick={cycleBackground}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <ImageIcon size={24} className="text-pink-600" />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Personalizar</span>
        </div>
        <div className="group cursor-pointer flex flex-col items-center" onClick={() => setIsFunZoneOpen(true)}>
          <div className="w-10 h-10 bg-gray-300 border-2 border-white border-r-gray-700 border-b-gray-700 flex items-center justify-center shadow-md group-active:translate-y-px">
             <Star size={24} className="text-purple-600 animate-spin-slow" style={{ animationDuration: '10s' }} />
          </div>
          <span className="text-[10px] text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] mt-1 font-bold">Fun_Zone.exe</span>
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
          <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-white">
            {/* Internal Sidebar - The Nav Frame */}
            <aside className="w-full md:w-[150px] bg-slate-300 border-r-2 border-gray-600 p-2 flex flex-col gap-2 overflow-y-auto overflow-x-hidden shrink-0 font-sans">
             <div className="bg-[#a0a0a0] border-2 border-inset border-slate-500 p-2 text-center mb-2" style={{ borderStyle: 'inset' }}>
              <div className="w-10 h-10 bg-blue-900 border-2 border-slate-300 mx-auto mb-1 flex items-center justify-center text-lg font-bold text-yellow-400 italic shadow-md">
                SM
              </div>
              <p className="text-[9px] font-bold text-blue-900 border-t border-gray-500 pt-1">MECATRÓNICA</p>
             </div>
             
             <SidebarBox title="Explorar">
                <div className="flex flex-col gap-1 w-full overflow-hidden">
                  <RetroButton className="w-full text-[9px] px-2" active={activeSection === 'home'} onClick={() => {setActiveSection('home'); setSelectedComp(null);}}>
                    INICIO
                  </RetroButton>
                  <RetroButton className="w-full text-[9px] px-2" active={activeSection === 'about'} onClick={() => {setActiveSection('about'); setSelectedComp(null);}}>
                    SOBRE_MI
                  </RetroButton>
                  <RetroButton className="w-full text-[9px] px-2" active={activeSection === 'competencias'} onClick={() => {setActiveSection('competencias'); setSelectedComp(null);}}>
                    COMPETENCIAS
                  </RetroButton>
                  <RetroButton className="w-full text-[9px] px-2" active={activeSection === 'proyectos'} onClick={() => {setActiveSection('proyectos'); setSelectedComp(null);}}>
                    PROYECTOS
                  </RetroButton>
                  <RetroButton className="w-full text-[9px] px-2" active={activeSection === 'contacto'} onClick={() => {setActiveSection('contacto'); setSelectedComp(null);}}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <VintageCard title="Misión_Científica.txt">
                        <p className="text-[11px]">Convertirme en una referente en la integración de hardware y firmware para la industria nacional, promoviendo la innovación y la eficiencia en sistemas automatizados.</p>
                      </VintageCard>
                      <VintageCard title="Bitácora_Carga.exe" area="HARDWARE">
                        <p className="text-[11px]">Actualmente cursando el 5to semestre. Explora las secciones para ver mis PICs (Proyectos Integradores) y certificados.</p>
                      </VintageCard>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-400 p-3 italic text-[11px] flex items-center gap-3">
                       <MessageSquare size={20} className="text-yellow-600 shrink-0" />
                       <div>
                         <span className="font-bold">¿Te gusta lo que ves?</span> Déjame un saludo en el <button onClick={() => setIsGuestbookOpen(true)} className="text-blue-700 underline font-bold hover:text-blue-900 cursor-pointer">Guestbook.txt</button> para saber que pasaste por aquí. ¡Tus comentarios son muy valorados!
                       </div>
                    </div>

                    <div className="flex justify-center py-4">
                       <img src="https://picsum.photos/seed/mecatronica-tech/800/150" alt="Mecatronica" className="grayscale border-2 border-gray-800 shadow-lg" />
                    </div>

                    <div className="border-t-2 border-gray-200 pt-6 text-center">
                      <div className="mb-4 inline-block">
                        <Blink>
                          <span className="text-sm font-bold text-red-600 border-2 border-red-600 px-4 py-1">*** WORK IN PROGRESS ***</span>
                        </Blink>
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Optimizado para resolución de 800 x 600 píxeles</p>
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
                    <SectionHeader title="01_PERFIL" />
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="shrink-0 w-full md:w-56 space-y-4">
                         <div className="bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 p-1">
                            <img src="https://picsum.photos/seed/portrait/200/250" alt="Avatar" className="w-full grayscale border border-black" />
                            <div className="text-center text-[9px] font-bold mt-1 uppercase font-mono tracking-tighter">IMG_PROFILE_001.JPG</div>
                         </div>
                         
                         <VintageCard title="Formación">
                            <ul className="text-[11px] space-y-1 font-serif italic font-bold">
                               <li>• UTEC: Ing. Mecatrónica</li>
                            </ul>
                         </VintageCard>
                         
                         <VintageCard title="Intereses">
                            <ul className="text-[11px] space-y-1 font-mono tracking-tighter">
                               <li>• Soldar</li>
                               <li>• Prototipado</li>
                               <li>• Documentación Técnica</li>
                               <li>• IoT y Redes</li>
                            </ul>
                         </VintageCard>
                      </div>
                      <div className="flex-1 font-serif">
                         <div className="bg-white border-2 border-inset border-gray-300 p-4 h-full" style={{ borderStyle: 'inset' }}>
                            <h2 className="text-xl font-bold text-blue-900 border-b border-gray-200 mb-2">Sobre_mi</h2>
                            <p className="text-sm leading-relaxed">
                              Estudiante avanzada de mecatrónica en UTEC Fray Bentos. Me apasiona el diseño de PCBs, la programación de sistemas embebidos y la resolución de problemas industriales complejos. 
                            </p>
                            <p className="mt-2 text-sm leading-relaxed">
                              He servido como <strong>Tutora Académica</strong> para estudiantes de primer año, reforzando mis propios conocimientos mientras ayudo a otros en el desafiante camino de la ingeniería.
                            </p>
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
                       <p className="text-sm mb-4 leading-relaxed">{selectedComp.description}</p>
                       
                       <h3 className="text-sm font-bold text-slate-700 underline mb-2">Evidencias de Desempeño</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                          {selectedComp.evidences.map((ev: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200">
                               <FileText size={14} className="text-blue-900" />
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-bold">{ev.name}</span>
                                  <span className="text-[8px] text-gray-500 uppercase tracking-tighter">[{ev.type}]</span>
                               </div>
                            </div>
                          ))}
                       </div>

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
        left="20%"
        width="450px"
        icon={<MessageSquare size={12} className="text-blue-900" />}
      >
        <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {messages.map(m => (
            <div key={m.id} className="text-[11px] border-b border-dotted border-gray-300 pb-2">
               <div className="flex justify-between font-bold text-blue-900">
                  <span>{m.name}</span>
                  <span className="text-gray-400">{m.date}</span>
               </div>
               <p className="italic">"{m.text}"</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSignGuestbook} className="bg-[#c0c0c0] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-2">
           <div className="text-[10px] font-bold mb-1">FIRMAR LIBRO:</div>
           <input 
              type="text" 
              placeholder="Identidad..." 
              className="w-full text-[10px] p-1 border-2 border-gray-800 border-r-white border-b-white bg-white"
              value={newName}
              onChange={e => setNewName(e.target.value)}
           />
           <textarea 
              placeholder="Mensaje para el sistema..." 
              className="w-full text-[10px] p-1 border-2 border-gray-800 border-r-white border-b-white bg-white h-16"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
           ></textarea>
           <div className="text-right">
             <RetroButton>ENVIAR_FIRMA.EXE</RetroButton>
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
             <div>SYSTEM_INFO_REPORT :: 2026</div>
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

      {/* Fun Zone Window */}
      <Window
        title="Engineering_Fun_Zone.vxd"
        isOpen={isFunZoneOpen}
        onClose={() => setIsFunZoneOpen(false)}
        top="30%"
        left="40%"
        width="320px"
        icon={<Star size={12} className="text-yellow-600" />}
      >
        <div className="space-y-4">
          <SectionHeader title="MECATRONIC_VIBES" />
          <div className="bg-slate-900 p-4 border-2 border-inset border-slate-600" style={{ borderStyle: 'inset' }}>
             <div className="text-center mb-4">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="w-16 h-16 border-4 border-dashed border-yellow-500 rounded-full mx-auto flex items-center justify-center"
               >
                 <Cpu size={32} className="text-blue-400" />
               </motion.div>
             </div>
             <div className="font-mono text-[10px] text-yellow-500 text-center uppercase tracking-widest">
               <Blink>¡Precaución: Alta Tensión Creativa!</Blink>
             </div>
          </div>
          <div className="flex flex-col gap-2">
             <RetroButton onClick={() => alert("¡ZAP! - Estática retro descargada.")}>TEST_VOLTAGE.SH</RetroButton>
             <RetroButton onClick={() => window.open('https://patorjk.com/software/taag/', '_blank')}>ASCII_ART_GENERATOR.EXE</RetroButton>
          </div>
          <div className="mt-2 p-2 bg-blue-100 border border-blue-300 text-[9px] italic">
            "En la ingeniería, el café es el combustible y los bugs son solo características no documentadas."
          </div>
        </div>
      </Window>

      {/* Status Bar */}
      <div className="absolute bottom-10 w-full h-6 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 text-[10px] gap-4 z-40">
           <div className="flex-1 flex gap-4 truncate">
             <span>Objeto(s): 12</span>
             <span>Libre: 3.4 GB</span>
             <span className="text-blue-900 font-bold italic">CONECTADO: 56K MODEM</span>
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
          <span className="font-bold text-sm italic group-active:translate-x-0.5 group-active:translate-y-0.5 uppercase tracking-tighter">Inicio</span>
        </button>
        <div className="w-[1px] h-6 bg-gray-500 mx-1"></div>
        <button 
          className={`h-8 px-4 border-2 flex items-center text-[10px] font-bold gap-2 ${isPortfolioOpen ? 'border-gray-800 bg-[#d4d0c8] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]' : 'border-gray-800 border-r-white border-b-white bg-[#c0c0c0] shadow-[inset_1px_1px_0px_white]'}`} 
          style={isPortfolioOpen ? { borderStyle: 'inset' } : {}}
          onClick={() => setIsPortfolioOpen(!isPortfolioOpen)}
        >
          <Globe size={14} className="text-blue-900" />
          Portfolio_v2.0
        </button>
        {isGuestbookOpen && (
          <button 
            onClick={() => setIsGuestbookOpen(true)}
            className="h-8 px-4 border-2 border-gray-800 border-r-white border-b-white bg-[#c0c0c0] flex items-center text-[10px] font-bold gap-2 shadow-[inset_1px_1px_0px_white]"
          >
            <MessageSquare size={12} className="text-blue-900" />
            Guestbook.txt
          </button>
        )}
        {isContactOpen && (
          <button 
            onClick={() => setIsContactOpen(true)}
            className="h-8 px-4 border-2 border-gray-800 border-r-white border-b-white bg-[#c0c0c0] flex items-center text-[10px] font-bold gap-2 shadow-[inset_1px_1px_0px_white]"
          >
            <Monitor size={12} className="text-slate-800" />
            Mi PC
          </button>
        )}
        {isFunZoneOpen && (
          <button 
            onClick={() => setIsFunZoneOpen(true)}
            className="h-8 px-4 border-2 border-gray-800 border-r-white border-b-white bg-[#c0c0c0] flex items-center text-[10px] font-bold gap-2 shadow-[inset_1px_1px_0px_white]"
          >
            <Star size={12} className="text-yellow-600" />
            Fun Zone
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
