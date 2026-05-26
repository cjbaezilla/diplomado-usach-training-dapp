import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Navbar } from '@/components/Navbar';
import { PageHeader } from '@/components/PageHeader';
import { Footer } from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  User,
  Coins,
  ArrowRightLeft,
  Award,
  Terminal,
  Compass,
  FileCode,
  Blocks,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface SubCategory {
  id: string;
  label: string;
}

interface LearningSection {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  subcategories: SubCategory[];
}

const Aprender: NextPage = () => {
  const sections: LearningSection[] = [
    {
      id: 'introduccion',
      label: 'Guía de Inicio',
      icon: BookOpen,
      subcategories: [
        { id: 'intro-concepto', label: 'Conceptos Generales' },
        { id: 'intro-billetera', label: 'Conectar Billetera' },
        { id: 'intro-registro', label: 'Registrar Identidad' },
        { id: 'intro-fondos', label: 'Obtener Fondos' }
      ]
    },
    {
      id: 'identidad',
      label: 'Identidad Digital',
      icon: User,
      subcategories: [
        { id: 'identidad-concepto', label: '¿Qué es el Registro?' },
        { id: 'identidad-funciones', label: 'Funciones Clave' }
      ]
    },
    {
      id: 'erc20',
      label: 'Tokens ERC-20',
      icon: Coins,
      subcategories: [
        { id: 'erc20-fabrica', label: 'Fábrica de Tokens' },
        { id: 'erc20-operaciones', label: 'Operaciones Comunes' }
      ]
    },
    {
      id: 'dex',
      label: 'Exchange AMM',
      icon: ArrowRightLeft,
      subcategories: [
        { id: 'dex-concepto', label: 'El AMM' },
        { id: 'dex-defi', label: 'Conceptos DeFi' }
      ]
    },
    {
      id: 'reliquias',
      label: 'Reliquias Históricas',
      icon: Award,
      subcategories: [
        { id: 'reliquias-concepto', label: 'Insignias ERC-1155' },
        { id: 'reliquias-xp', label: 'Experiencia y Niveles' }
      ]
    },
    {
      id: 'glosario',
      label: 'Glosario Web3',
      icon: Terminal,
      subcategories: [
        { id: 'glosario-evm', label: 'EVM & ABI' },
        { id: 'glosario-conceptos', label: 'Conceptos Clave' }
      ]
    }
  ];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    introduccion: true,
  });
  const [activeSubSection, setActiveSubSection] = useState('intro-concepto');

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const isExpanded = !!prev[sectionId];
      // Si se va a expandir y no tiene una subcategoría de esta sección activa,
      // activar la primera subcategoría de esa sección.
      if (!isExpanded) {
        const section = sections.find(s => s.id === sectionId);
        if (section && section.subcategories.length > 0) {
          const alreadyActiveInSection = section.subcategories.some(sub => sub.id === activeSubSection);
          if (!alreadyActiveInSection) {
            setActiveSubSection(section.subcategories[0].id);
          }
        }
      }
      return {
        ...prev,
        [sectionId]: !isExpanded
      };
    });
  };

  const handleSubcategoryClick = (subId: string) => {
    setActiveSubSection(subId);
  };

  const getParentSectionId = (subId: string) => {
    for (const section of sections) {
      if (section.subcategories.some(sub => sub.id === subId)) {
        return section.id;
      }
    }
    return 'introduccion';
  };

  const activeParentId = getParentSectionId(activeSubSection);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <Head>
        <title>Centro de Aprendizaje Web3 - USACH</title>
        <meta
          content="Documentación, guías de usuario y explicaciones técnicas de los módulos DeFi del Laboratorio de Aprendizaje Web3 de la USACH."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Navbar />

      <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 space-y-6 w-full">
        {/* Encabezado Principal Homologado */}
        <PageHeader
          title="Centro de Aprendizaje DApp"
          description="Aprende cómo interactuar con los contratos inteligentes, emitir tus propios tokens ERC-20, proveer liquidez en el DEX, gestionar tu identidad digital estudiantil y desbloquear reliquias históricas de la Escuela de Artes y Oficios (EAO) en la red blockchain."
          icon={Compass}
          breadcrumbItems={[
            { label: 'Centro de Aprendizaje' }
          ]}
        />

        {/* Layout Principal de Dos Columnas: Sidebar Izquierdo + Contenido Derecho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* 1. NAVEGACIÓN MÓVIL (Compacta con acordeón o selector) */}
          <div className="lg:hidden w-full flex flex-col gap-2.5">
            <div className="bg-card border border-border p-3.5 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Tema Seleccionado</span>
                <span className="text-xs font-black text-foreground">
                  {sections.find(s => s.id === activeParentId)?.label}
                  {" › "}
                  {sections.flatMap(s => s.subcategories).find(sub => sub.id === activeSubSection)?.label}
                </span>
              </div>
            </div>
            
            {/* Carrusel compacto de categorías */}
            <div className="w-full overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4">
              <div className="flex gap-1.5 w-max">
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  const isParentActive = activeParentId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        // Expandir y seleccionar primera subcategoría
                        setExpandedSections(prev => ({
                          ...prev,
                          [sec.id]: true
                        }));
                        if (sec.subcategories.length > 0) {
                          setActiveSubSection(sec.subcategories[0].id);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer",
                        isParentActive
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10"
                          : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {sec.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategorías de la sección activa en horizontal para móvil */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
              <div className="flex gap-1.5 w-max">
                {sections.find(s => s.id === activeParentId)?.subcategories.map((sub) => {
                  const isSubActive = activeSubSection === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubSection(sub.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer",
                        isSubActive
                          ? "bg-muted border-border text-primary font-bold shadow-sm"
                          : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. SIDEBAR DE ESCRITORIO (Treeview compacto y responsivo) */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-2 bg-card border border-border p-3.5 rounded-2xl shadow-lg shadow-black/5 self-start sticky top-24">
            <h3 className="px-3 mb-2 text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider text-left">
              Módulos de Aprendizaje
            </h3>
            <div className="flex flex-col gap-1.5">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isExpanded = !!expandedSections[sec.id];
                const isParentActive = activeParentId === sec.id;
                
                return (
                  <div key={sec.id} className="flex flex-col gap-1 text-left">
                    {/* Botón de Categoría Principal */}
                    <button
                      onClick={() => toggleSection(sec.id)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border cursor-pointer",
                        isParentActive
                          ? "bg-muted border-border text-foreground font-bold shadow-sm"
                          : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4 shrink-0", isParentActive ? "text-primary animate-pulse" : "text-muted-foreground")} />
                        <span>{sec.label}</span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200",
                          isExpanded && "rotate-90 text-primary"
                        )}
                      />
                    </button>

                    {/* Subcategorías con Sangrado (Animado/Treeview) */}
                    {isExpanded && (
                      <div className="flex flex-col pl-4 ml-5 border-l border-border gap-1 mt-0.5 animate-in fade-in slide-in-from-left-1 duration-150">
                        {sec.subcategories.map((sub) => {
                          const isSubActive = activeSubSection === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleSubcategoryClick(sub.id)}
                              className={cn(
                                "flex items-center w-full px-3 py-1.5 rounded-lg text-xs transition-all duration-150 relative cursor-pointer",
                                isSubActive
                                  ? "text-primary font-bold bg-primary/10"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              )}
                            >
                              {isSubActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary -ml-[23px]" />
                              )}
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* 3. ÁREA DE CONTENIDO (lg:col-span-9) */}
          <div className="lg:col-span-9 w-full flex-1">
            {/* SUB-SECCIÓN: CONCEPTOS GENERALES DE INICIO */}
            {activeSubSection === 'intro-concepto' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch w-full animate-in fade-in duration-300">
                <Card className="md:col-span-8 border-border/80 bg-card/45 backdrop-blur-md flex flex-col justify-between text-left">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Guía de Inicio Rápido
                    </CardTitle>
                    <CardDescription>
                      Entorno de aprendizaje interactivo Web3 de la USACH.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      Esta dApp es un laboratorio interactivo desarrollado para el **Diplomado en Tecnologías Blockchain** de la **Universidad de Santiago de Chile (USACH)**. Aquí podrás interactuar directamente con contratos inteligentes desplegados en una blockchain compatible con Ethereum (EVM).
                    </p>
                    <p>
                      El objetivo principal es que experimentes con conceptos de identidad digital, finanzas descentralizadas (DeFi) como pools de liquidez y swaps de tokens, y coleccionables digitales (tokens semi-fungibles).
                    </p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-4 border-border/80 bg-card/45 backdrop-blur-md text-left flex flex-col justify-between">
                  <div>
                    <CardHeader>
                      <CardTitle className="text-lg font-bold flex items-center gap-2 text-amber-500">
                        <Info className="h-5 w-5" />
                        Reglas del Laboratorio
                      </CardTitle>
                      <CardDescription>
                        Aspectos clave a tener en cuenta.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                      <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl space-y-1">
                        <span className="block font-bold text-amber-500">Redes de Prueba Solamente</span>
                        <p>
                          **Nunca utilices fondos reales ni tu clave privada principal.** Este laboratorio utiliza tokens sin valor monetario real. Úsalo exclusivamente en redes locales o testnets.
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            {/* SUB-SECCIÓN: CONECTAR BILLETERA */}
            {activeSubSection === 'intro-billetera' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Paso 1: Conectar tu Billetera Web3
                  </CardTitle>
                  <CardDescription>
                    Configuración de tu cuenta para interactuar con la dApp.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Para interactuar con la blockchain necesitas un proveedor de identidad criptográfica o "billetera". La opción más recomendada es la extensión de navegador o aplicación móvil de **MetaMask** o cualquier billetera compatible con **WalletConnect**.
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Cómo proceder:</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-xs">
                      <li>Haz clic en el botón de **"Connect Wallet"** o **"Conectar Billetera"** en la esquina superior derecha del menú de navegación.</li>
                      <li>Selecciona tu proveedor de billetera preferido en la ventana emergente de RainbowKit.</li>
                      <li>Aprueba la conexión en tu billetera. ¡Y listo! Tu dirección de billetera pública ahora estará vinculada a la sesión del navegador.</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: REGISTRAR IDENTIDAD */}
            {activeSubSection === 'intro-registro' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Paso 2: Registrar tu Identidad Digital
                  </CardTitle>
                  <CardDescription>
                    Cómo crear tu perfil de estudiante en la blockchain.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Antes de interactuar con el resto de la plataforma, es fundamental que registres tu perfil de estudiante. Esto creará un registro descentralizado inmutable vinculado a tu billetera.
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">¿Por qué es necesario?</h3>
                    <p className="text-xs">
                      El registro habilita a tu dirección de billetera para participar en actividades del Diplomado, registrar tus logros e interactuar con contratos inteligentes que limitan funciones sólo a estudiantes registrados.
                    </p>
                    <p className="text-xs">
                      Puedes completar este registro navegando a la pestaña **Identidad** en el menú superior de la dApp.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: OBTENER FONDOS */}
            {activeSubSection === 'intro-fondos' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Paso 3: Obtener fondos de prueba (Gas & Tokens)
                  </CardTitle>
                  <CardDescription>
                    Cómo financiar tu billetera para pagar tarifas de transacción.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Cada operación de escritura en la blockchain requiere poder computacional que es cobrado en forma de **Gas** (en la criptomoneda nativa de la red). Como este es un entorno educativo, utilizamos tokens de prueba.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-2">
                      <span className="block font-bold text-foreground text-xs uppercase">1. Obtener ETH de Gas (Faucets)</span>
                      <p className="text-xs text-muted-foreground">
                        Si estás interactuando en la red Sepolia, puedes usar faucets públicas (grifos de monedas) como Sepolia Faucet de Alchemy, QuickNode o Infura para obtener fracciones de Sepolia ETH gratis.
                      </p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-2">
                      <span className="block font-bold text-foreground text-xs uppercase">2. Faucet Interno de Tokens</span>
                      <p className="text-xs text-muted-foreground">
                        Una vez conectado, usa la sección de Faucet integrada en la página de **Inicio** de la dApp para reclamar tokens de simulación (como el Token de Práctica) para realizar intercambios o proveer liquidez en el DEX.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: ¿QUÉ ES EL REGISTRO DE IDENTIDAD? */}
            {activeSubSection === 'identidad-concepto' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Identidad Digital Estudiantil (`StudentIdentity.sol`)
                  </CardTitle>
                  <CardDescription>
                    Registro en la blockchain del perfil de los estudiantes de la USACH.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    El contrato inteligente `StudentIdentity.sol` actúa como un registro público descentralizado donde las direcciones de billetera EVM se asocian de forma permanente (y modificable por el propietario) a un perfil académico.
                  </p>
                  <p>
                    Este perfil incluye información básica como **Nombre**, **Correo Electrónico**, **LinkedIn** y **Twitter**, además de registrar si el estudiante está debidamente validado en el sistema.
                  </p>
                  <div className="p-3 bg-muted/40 border border-border/20 rounded-xl">
                    <span className="block font-bold text-foreground text-xs uppercase mb-1">Estructura en Solidity (Profile):</span>
                    <pre className="text-[11px] font-mono text-primary bg-background/80 p-2.5 rounded border border-border/30 overflow-x-auto">
{`struct Profile {
    string name;
    string email;
    string linkedin;
    string twitter;
    bool isRegistered;
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: FUNCIONES CLAVE DE IDENTIDAD */}
            {activeSubSection === 'identidad-funciones' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Funciones Clave de `StudentIdentity.sol`
                  </CardTitle>
                  <CardDescription>
                    Interacciones disponibles con el contrato de identidad.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5 border-primary/30 text-primary font-mono text-[10px]">registerStudent</Badge>
                      <div>
                        <p className="text-xs text-foreground font-bold">Permite crear o actualizar el perfil</p>
                        <p className="text-xs text-muted-foreground">Toma los campos de texto e inicializa la estructura, asociándola a la dirección que invoca la función (`msg.sender`).</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5 border-primary/30 text-primary font-mono text-[10px]">getStudentProfile</Badge>
                      <div>
                        <p className="text-xs text-foreground font-bold">Consulta de perfil por dirección</p>
                        <p className="text-xs text-muted-foreground">Retorna la información del perfil del estudiante de forma pública e instantánea sin costo de gas (llamada constante `view`).</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5 border-primary/30 text-primary font-mono text-[10px]">getAllStudents</Badge>
                      <div>
                        <p className="text-xs text-foreground font-bold">Listado de Direcciones Registradas</p>
                        <p className="text-xs text-muted-foreground">Devuelve un arreglo con todas las direcciones que han registrado un perfil para mostrarlas en la UI.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl space-y-2 mt-4">
                    <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                      <FileCode className="h-4 w-4" />
                      Dirección de Contrato en Red
                    </h4>
                    <p className="text-[11px] font-mono break-all text-slate-300">
                      {process.env.NEXT_PUBLIC_STUDENT_IDENTITY_ADDRESS || 'Desplegado en red local / testnet'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: FÁBRICA DE TOKENS */}
            {activeSubSection === 'erc20-fabrica' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Fábrica de Tokens (`TokenFactory.sol`)
                  </CardTitle>
                  <CardDescription>
                    Despliegue simplificado de contratos ERC-20 desde el navegador.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Para evitar la complejidad de escribir, compilar y desplegar contratos individualmente, implementamos **`TokenFactory.sol`**. Esta fábrica permite a cualquier estudiante emitir un nuevo contrato ERC-20 enviando una simple transacción.
                  </p>
                  <p>
                    El estudiante especifica el **Nombre**, **Símbolo** y el **Suministro Inicial (Initial Supply)**. La fábrica despliega una instancia de `BaseERC20.sol`, asigna los tokens al creador y los añade al registro general del laboratorio.
                  </p>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl space-y-2 mt-4">
                    <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                      <Blocks className="h-4 w-4" />
                      Arquitectura del Despliegue
                    </h4>
                    <p className="text-xs">
                      Cada token creado a través de la fábrica es un contrato inteligente independiente con su propia dirección pública, la cual se agrega automáticamente al panel general del simulador para que otros estudiantes puedan interactuar.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: OPERACIONES COMUNES ERC-20 */}
            {activeSubSection === 'erc20-operaciones' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Operaciones Comunes de Tokens
                  </CardTitle>
                  <CardDescription>
                    Cómo operar y transferir tus activos en el estándar ERC-20.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-2 mb-4">
                    <span className="block font-bold text-foreground text-xs uppercase">Estándar ERC-20 Clásico:</span>
                    <p className="text-xs text-muted-foreground">
                      Es el estándar más popular de la red Ethereum para representar activos intercambiables o representaciones de valor. Todos los tokens ERC-20 implementan una interfaz matemática idéntica, lo que permite que billeteras, exchanges y pools DeFi interactúen con ellos de manera universal.
                    </p>
                  </div>
                  
                  <ul className="space-y-3 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground font-semibold">Transferir (Transfer):</strong> Envía tokens directamente desde tu saldo a la dirección de otro usuario.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground font-semibold">Aprobar y Concesión (Approve & Allowance):</strong> Le das permiso a un contrato inteligente (como el DEX) para gastar un número máximo de tus tokens. Este paso es fundamental para la seguridad Web3.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-foreground font-semibold">Acuñar y Quemar (Mint & Burn):</strong> Incrementar o reducir el suministro total de tokens de forma controlada.
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: EL AMM */}
            {activeSubSection === 'dex-concepto' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Creador de Mercado Automatizado (AMM)
                  </CardTitle>
                  <CardDescription>
                    Cómo funciona la fijación de precios algorítmica en pools de liquidez.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    A diferencia de los mercados tradicionales basados en un libro de órdenes de compra y venta, los exchanges descentralizados modernos utilizan **Pools de Liquidez** (reservas de tokens bloqueadas en un contrato inteligente).
                  </p>
                  <p>
                    El precio de intercambio se calcula matemáticamente basándose en la proporción de tokens en el pool siguiendo la fórmula de Uniswap V2:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center my-3">
                    <code className="text-xl font-mono text-primary font-bold">x * y = k</code>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Donde <strong className="text-foreground">x</strong> e <strong className="text-foreground">y</strong> son los balances de reserva de los dos tokens, y <strong className="text-foreground">k</strong> es una constante que no debe variar durante el intercambio.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: CONCEPTOS DEFI */}
            {activeSubSection === 'dex-defi' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Conceptos DeFi Clave
                  </CardTitle>
                  <CardDescription>
                    Principales mecánicas que ocurren en las finanzas descentralizadas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <div className="grid grid-cols-1 gap-3.5 text-xs">
                    <div className="bg-muted/40 p-3.5 rounded-xl border border-border/20">
                      <strong className="text-foreground block mb-0.5">Proveer Liquidez:</strong>
                      Aportas dos tokens en valor equivalente (ej. 50% Token A y 50% Token B). A cambio, recibes **Tokens LP** que representan tu participación en la piscina de reservas.
                    </div>
                    <div className="bg-muted/40 p-3.5 rounded-xl border border-border/20">
                      <strong className="text-foreground block mb-0.5">Slippage (Deslizamiento):</strong>
                      La variación de precio que ocurre entre el momento en que envías la transacción y el momento en que se confirma en bloque, debido al tamaño relativo de tu swap en comparación con la liquidez del pool.
                    </div>
                    <div className="bg-muted/40 p-3.5 rounded-xl border border-border/20">
                      <strong className="text-foreground block mb-0.5">Impermanent Loss (Pérdida Impermanente):</strong>
                      La pérdida porcentual que sufre un proveedor de liquidez en comparación con simplemente mantener los tokens en su billetera, ocasionada por la divergencia de precios de los tokens en el mercado.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: INSIGNIAS ERC-1155 */}
            {activeSubSection === 'reliquias-concepto' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Insignias Multi-Token (ERC-1155)
                  </CardTitle>
                  <CardDescription>
                    Gamificación en blockchain de la historia y el lore patrimonial de la Escuela de Artes y Oficios (EAO).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    El estándar **ERC-1155** es una evolución tecnológica que permite definir tokens fungibles, semi-fungibles y no fungibles en el mismo contrato. En este módulo, se utiliza para catalogar las Reliquias Históricas.
                  </p>
                  <p>
                    Cada reliquia representa un hito o elemento arquitectónico emblemático de la universidad (como el Péndulo de Foucault, el Planetario, la Campana de la EAO o las Calderas).
                  </p>
                  <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 space-y-2 mt-3">
                    <span className="font-bold text-emerald-500 flex items-center gap-1 text-xs">
                      <ShieldCheck className="h-4 w-4" /> Ventajas Pasivas (Buffs)
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Al reclamar y poseer una reliquia en tu billetera, el sistema detectará tu balance y activará efectos pasivos dinámicos visibles en tu perfil (ej. incremento de velocidad de minado de tokens, multiplicador de XP o acceso prioritario a pools).
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: EXPERIENCIA Y NIVELES */}
            {activeSubSection === 'reliquias-xp' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Sistema de Experiencia y Niveles
                  </CardTitle>
                  <CardDescription>
                    Mecánicas de nivel de cuenta según las reliquias obtenidas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Cada vez que minteas una reliquia, adquieres los puntos de experiencia (**XP**) que tiene configurada en su JSON de metadatos.
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between my-3">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Fórmula de Niveles</span>
                      <p className="text-base text-foreground font-bold">Nivel = (XP / 100) + 1</p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                      <Zap className="h-5 w-5 animate-pulse" />
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mt-4">¿Cómo se resuelven las imágenes y descripciones?</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El contrato inteligente almacena una dirección URL base de metadatos. Al realizar una consulta, la aplicación lee dinámicamente el identificador decimal del token, descarga el archivo JSON correspondiente desde el servidor descentralizado y renderiza sus propiedades.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: EVM Y ABI */}
            {activeSubSection === 'glosario-evm' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    EVM & ABI
                  </CardTitle>
                  <CardDescription>
                    Entorno de ejecución de contratos e interfaces binarias.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">EVM (Ethereum Virtual Machine)</span>
                      <p className="text-xs text-muted-foreground">
                        El entorno virtual ejecutable en el que corren los contratos inteligentes. Redes como Polygon, Arbitrum, Optimism y Base son compatibles con la EVM, lo que permite que el mismo código corra de forma idéntica en ellas.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">ABI (Application Binary Interface)</span>
                      <p className="text-xs text-muted-foreground">
                        Un archivo en formato JSON que detalla todas las funciones, argumentos y retornos de un contrato inteligente. Permite que el frontend en JavaScript/TypeScript sepa cómo comunicarse con la blockchain de forma tipada.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: CONCEPTOS CLAVE */}
            {activeSubSection === 'glosario-conceptos' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    Conceptos Clave de Blockchain
                  </CardTitle>
                  <CardDescription>
                    Términos y definiciones fundamentales en Web3.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">Smart Contract</span>
                      <p className="text-xs text-muted-foreground">
                        Código inmutable autoejecutable almacenado en la cadena de bloques. Sigue estrictamente las reglas escritas en su código sin posibilidad de intervención de terceros.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">Gas y Gas Limit</span>
                      <p className="text-xs text-muted-foreground">
                        El gas mide el esfuerzo de computación. El Gas Limit es el tope de gas que estás dispuesto a consumir. Si la ejecución excede este tope, la transacción se revierte conservando la tarifa pagada.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">Firma de Transacción</span>
                      <p className="text-xs text-muted-foreground">
                        Prueba criptográfica que verifica que una transacción fue generada por el dueño de la clave privada de una billetera, impidiendo la falsificación.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">RPC Node</span>
                      <p className="text-xs text-muted-foreground">
                        El servidor puente que conecta la aplicación Web3 frontend con la red blockchain para enviar transacciones o leer datos del ledger descentralizado.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Aprender;
