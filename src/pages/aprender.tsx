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
        { id: 'dex-concepto', label: 'El AMM y Producto Constante' },
        { id: 'dex-liquidez', label: 'Provisión de Liquidez' },
        { id: 'dex-impermanente', label: 'Pérdida Impermanente' },
        { id: 'dex-seguridad', label: 'Arquitectura y Seguridad' },
        { id: 'dex-mev', label: 'MEV y Ataques Sándwich' },
        { id: 'dex-aritmetica', label: 'Modelos de AMM y EVM' },
        { id: 'dex-bonding', label: 'Curvas de Vinculación' }
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
          title="Centro de Aprendizaje"
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

            {/* SUB-SECCIÓN: EL AMM Y PRODUCTO CONSTANTE */}
            {activeSubSection === 'dex-concepto' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    El AMM y la Fórmula del Producto Constante
                  </CardTitle>
                  <CardDescription>
                    Fundamentos matemáticos y el funcionamiento de la hipérbola de precios x * y = k.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    En los mercados financieros tradicionales (TradFi), la liquidez se gestiona a través de un <strong>Libro de Órdenes (Order Book)</strong>, donde compradores y vendedores registran sus intenciones de precios de manera asíncrona y un motor de emparejamiento centralizado liquida las transacciones cuando las curvas de oferta y demanda se cruzan. En el ecosistema de cadenas de bloques descentralizadas, replicar esta arquitectura resulta inviable debido a tres limitaciones estructurales: la latencia intrínseca en el consenso de bloques, el rendimiento computacional restringido (throughput) y el costo prohibitivo de gas asociado a la creación, modificación y cancelación de órdenes individuales en el almacenamiento global de Ethereum.
                  </p>
                  <p>
                    Para resolver este cuello de botella tecnológico, surgieron los <strong>Creadores de Mercado Automatizados (AMM)</strong>. En esta arquitectura, el libro de órdenes se sustituye por un contrato inteligente inmutable que custodia físicamente un par de activos en una <strong>Piscina de Liquidez (Liquidity Pool)</strong>. Los usuarios ya no negocian con otros participantes del mercado en un esquema *peer-to-peer*, sino que ejecutan transacciones de manera inmediata y determinista contra el pool, el cual actúa como una contraparte pasiva única que recalcula los precios algorítmicamente en cada transacción.
                  </p>

                  <div className="my-4 border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                    <img
                      src="/docs/dex/comparacion_del_descubrimiento_de_precios_libros_de_ordenes_vs_amm.png"
                      alt="Comparación Libro de Órdenes vs AMM"
                      className="w-full h-auto rounded-lg filter drop-shadow-md"
                    />
                    <p className="text-center text-xs text-muted-foreground mt-2 font-medium">
                      Diagrama: Descubrimiento de precios mediante Libro de Órdenes tradicional frente a una Piscina de Liquidez (AMM).
                    </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-xs space-y-2 mt-2">
                    <span className="font-bold text-primary">Análisis Académico: Descubrimiento de Precios y Liquidez</span>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      El diagrama anterior ilustra la transición estructural del modelo de emparejamiento discreto (Order Book) al modelo de liquidez continua en DeFi (AMM). Mientras que el libro de órdenes depende de creadores de mercado activos que aporten inventario y ajusten el diferencial (bid-ask spread) en base al flujo informativo, el AMM garantiza liquidez instantánea y determinista a través de una fórmula matemática. El pool de liquidez actúa como una bóveda inmutable cuya cotización spot se desplaza a lo largo de una curva predefinida de forma puramente algorítmica. Esto elimina los riesgos de front-running sistémico por parte de intermediarios centralizados y democratiza el rol de provisión de liquidez, permitiendo que cualquier usuario de la red participe y reciba tarifas por proveer capital.
                    </p>
                  </div>                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">1. La Ecuación Fundamental</h3>
                  <p>
                    El modelo más pedagógico (Uniswap V2) se rige por el modelo de producto constante:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center my-3">
                    <code className="text-xl font-mono text-primary font-bold">x * y = k</code>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Donde <strong>x</strong> e <strong>y</strong> son las reservas del par de tokens, y <strong>k</strong> es una constante que permanece inalterada durante los intercambios.
                    </p>
                  </div>
                  <p>
                    Dado que las reservas deben ser mayores a cero, la ecuación define una hipérbola. Esto tiene una implicación académica fundamental: <strong>la piscina nunca puede quedarse completamente sin ninguno de los dos tokens</strong>, ya que retirar todo un activo requeriría aportar una cantidad infinita del otro.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                      <img
                        src="/docs/dex/la_dinamica_de_la_curva_hiperbolica_y_el_deslizamiento_slippage.png"
                        alt="Curva Hiperbólica y Slippage - Parte 1"
                        className="w-full h-auto rounded-lg filter drop-shadow-md"
                      />
                      <p className="text-center text-[11px] text-muted-foreground mt-2 font-medium">
                        Diagrama: Dinámica de la curva de producto constante, el impacto de precios (pendiente secante) y deslizamiento.
                      </p>
                    </div>
                    <div className="border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                      <img
                        src="/docs/dex/la_dinamica_de_la_curva_hiperbolica_y_el_deslizamiento_slippage-2.png"
                        alt="Curva Hiperbólica y Slippage - Parte 2"
                        className="w-full h-auto rounded-lg filter drop-shadow-md"
                      />
                      <p className="text-center text-[11px] text-muted-foreground mt-2 font-medium">
                        Detalle: Relación entre el volumen del swap, la profundidad del pool y el impacto porcentual del deslizamiento.
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-xs space-y-2 mt-2">
                    <span className="font-bold text-primary">Análisis Académico: Curva de Producto Constante e Impacto de Precio (Slippage)</span>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      El conjunto de infografías expone el comportamiento geométrico y operativo de la curva $x \cdot y = k$. En el primer gráfico (Parte 1), observamos que el precio spot marginal es la pendiente de la línea tangente a la curva en el punto de coordenadas actual de las reservas $(x, y)$. Al ejecutar una transacción discreta de tamaño considerable ($\Delta x$), el punto de operación se desplaza a lo largo de la hipérbola hasta una nueva posición, resultando en un precio de ejecución efectivo equivalente a la pendiente de la recta secante que une ambas coordenadas. La diferencia entre este precio de ejecución y el precio spot inicial constituye el <em>deslizamiento o impacto de precio (slippage)</em>.
                    </p>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      En el segundo gráfico (Parte 2), se detalla la sensibilidad del slippage respecto al volumen del swap y a la profundidad de reservas (el valor de $k$). Para un mismo tamaño de swap, una piscina con mayor liquidez ($k_2 &gt; k_1$) presenta una curvatura mucho más plana en términos locales, lo que minimiza la desviación de precio. Por el contrario, en pools poco profundos, pequeños volúmenes empujan la transacción hacia los extremos de la hipérbola, encareciendo exponencialmente la compra del activo objetivo. Para contrarrestar este fenómeno, los enrutadores DeFi obligan a especificar una tolerancia máxima de deslizamiento (ej. $0.5\%$), actuando como un candado que revierte la ejecución si el deslizamiento matemático excede el rango tolerado por el usuario.
                    </p>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">2. Deducción de Fórmulas de Swap</h3>
                  <p>
                    Para calcular cuántos tokens de salida (<strong>Δy</strong>) se obtienen al depositar una cantidad de entrada (<strong>Δx</strong>), resolvemos:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-mono text-xs text-primary/95 space-y-1">
                    <p>x * y = (x + Δx) * (y - Δy)</p>
                    <p>Δy = (y * Δx) / (x + Δx)  ← Cantidad de Salida (getAmountOut)</p>
                  </div>

                  <p>
                    De forma inversa, si queremos obtener una cantidad exacta de salida (<strong>Δy</strong>), la cantidad de entrada requerida (<strong>Δx</strong>) se calcula como:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-mono text-xs text-primary/95">
                    <p>Δx = (x * Δy) / (y - Δy)  ← Cantidad de Entrada (getAmountIn)</p>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">3. Incorporación de Comisiones</h3>
                  <p>
                    Para incentivar a los proveedores, se cobra una tarifa (ej. 0.3%). Para evitar el uso de punto flotante en Solidity, se escalan las operaciones por 1000:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl font-mono text-xs text-slate-300 space-y-2">
                    <p className="text-primary font-bold">// getAmountOut en Solidity (0.3% tarifa)</p>
                    <p>uint256 cantidadEntradaConComision = cantidadEntrada * 997;</p>
                    <p>uint256 numerador = cantidadEntradaConComision * resSalida;</p>
                    <p>uint256 denominador = (resEntrada * 1000) + cantidadEntradaConComision;</p>
                    <p>cantidadSalida = numerador / denominador;</p>
                  </div>
                  <p>
                    Para el cálculo de entrada (<code>getAmountIn</code>), sumamos 1 al resultado de la división entera para redondear a favor del pool, mitigando la devaluación de reservas por redondeos hacia abajo:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl font-mono text-xs text-slate-300">
                    <p className="text-primary font-bold">// getAmountIn en Solidity (con redondeo hacia arriba +1)</p>
                    <p>uint256 numerador = resEntrada * cantidadSalida * 1000;</p>
                    <p>uint256 denominador = (resSalida - cantidadSalida) * 997;</p>
                    <p>cantidadEntrada = (numerador / denominador) + 1;</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: PROVISIÓN DE LIQUIDEZ */}
            {activeSubSection === 'dex-liquidez' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Provisión de Liquidez y LP Tokens
                  </CardTitle>
                  <CardDescription>
                    Cómo los proveedores aportan capital a los pools y el mecanismo de emisión de LP Tokens.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Aportar liquidez consiste en depositar ambos tokens del par en una proporción igual a la del precio de mercado actual. A cambio, el contrato emite <strong>LP Tokens</strong> (Liquidity Provider Tokens) que representan la participación del usuario en la piscina de reservas.
                  </p>

                  <div className="my-4 border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                    <img
                      src="/docs/dex/ciclo_de_vida_de_provision_de_liquidez_y_acunacion_de_lp_tokens.png"
                      alt="Ciclo de Vida de Liquidez y LP Tokens"
                      className="w-full h-auto rounded-lg filter drop-shadow-md"
                    />
                    <p className="text-center text-xs text-muted-foreground mt-2 font-medium">
                      Diagrama: Provisión inicial, depósitos proporcionales y remoción de liquidez con reclamo de comisiones.
                    </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-xs space-y-2 mt-2">
                    <span className="font-bold text-primary">Análisis Académico: Dinámica del Suministro de Liquidez y LP Tokens</span>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      El diagrama expone de forma secuencial las tres fases fundamentales en la interacción financiera con un creador de mercado automatizado: la provisión inicial, los depósitos subsecuentes y el rescate o retiro de activos. En la fase de provisión inicial, el primer proveedor de liquidez (LP) determina arbitrariamente la paridad cambiaria al inyectar las cantidades de ambos tokens. Esta acción fija el precio de mercado inicial y emite tokens de proveedor de liquidez (LP Tokens) en base a la raíz del producto de las cantidades depositadas. Los LP Tokens funcionan como un recibo contable fraccional que representa la copropiedad de la piscina de reserva.
                    </p>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      Durante el funcionamiento de la piscina, cada intercambio (swap) ejecutado por agentes externos genera una comisión comercial que se acumula directamente dentro de las reservas de la piscina en lugar de ser distribuida inmediatamente. Esto expande físicamente el valor del producto constante de la hipérbola. En la fase final de retiro, cuando un proveedor devuelve y quema sus LP Tokens en el contrato inteligente, este le devuelve las reservas subyacentes más la parte proporcional de todas las comisiones acumuladas durante su permanencia en el pool, garantizando un incentivo económico pasivo.
                    </p>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">1. Medición de la Liquidez (L)</h3>
                  <p>
                    En el modelo de producto constante, la liquidez de una hipérbola se define como la media geométrica de las reservas:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-mono text-center text-primary text-base font-bold">
                    L = sqrt(x * y)
                  </div>
                  <p>
                    Un incremento en la liquidez desplaza la curva de la hipérbola hacia afuera, aumentando la profundidad y disminuyendo el impacto de precio en las transacciones de los usuarios.
                  </p>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">2. Emisión Inicial de LP Tokens</h3>
                  <p>
                    Al inicializar la piscina por primera vez, no hay precios de referencia. El primer proveedor define la paridad y recibe LP tokens basados en la media geométrica:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-mono text-xs text-primary/95">
                    LP_inicial = sqrt(x_aportado * y_aportado)
                  </div>
                  <p>
                    La media geométrica garantiza que la cantidad de LP tokens emitidos dependa del valor real y no de la escala nominal de precios inicial escogida por el creador.
                  </p>

                  <div className="my-4 border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                    <img
                      src="/docs/dex/anatomia_funcion_sqrt.png"
                      alt="Anatomía de la Función Sqrt"
                      className="w-full h-auto rounded-lg filter drop-shadow-md"
                    />
                    <p className="text-center text-xs text-muted-foreground mt-2 font-medium">
                      Diagrama: Algoritmo de raíz cuadrada iterativa (Método de Babilonia) en Solidity para calcular la media geométrica sin coma flotante.
                    </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-xs space-y-2 mt-2">
                    <span className="font-bold text-primary">Análisis Académico: Aritmética de Raíz Cuadrada Entera (Solidity sqrt)</span>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      El diagrama técnico detalla el comportamiento del algoritmo iterativo de raíz cuadrada, un elemento crítico en DeFi ya que la máquina virtual de Ethereum (EVM) no dispone de instrucciones nativas ni de coprocesador matemático para operaciones de coma flotante o raíces cuadradas. Para computar $\sqrt&#123;x \cdot y&#125;$ en la inicialización del pool, se implementa el <strong>Método de Babilonia</strong>, una simplificación del algoritmo de Newton-Raphson. Este método aproxima de forma determinista la raíz cuadrada entera mediante estimaciones sucesivas de la forma $x_&#123;n+1&#125; = \frac&#123;y/x_n + x_n&#125;&#123;2&#125;$, convergiendo con rapidez cuadrática a la parte entera de la raíz real.
                    </p>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      Como se observa en el flujo lógico, la rutina inicializa el valor estimado $z$ con el dividendo original $y$ si este es mayor a 3, y establece un valor de aproximación inicial de arranque en $x = (y / 2) + 1$. A continuación, un bucle <code>while (x &lt; z)</code> refina iterativamente el valor hasta que la estimación deja de decrecer, asegurando que el cálculo final sea exacto al truncarse por división entera. Esta aproximación determinista es esencial para evitar bifurcaciones o discrepancias de redondeo entre diferentes nodos y clientes de ejecución, manteniendo la integridad del estado financiero global a un costo de gas predecible y optimizado.
                    </p>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">3. Mitigación del Ataque de Inflación</h3>
                  <p>
                    En producción, para evitar que un atacante infle artificialmente el precio de una acción de LP mediante donaciones directas (drenando a usuarios con depósitos pequeños debido al truncamiento entero), los contratos profesionales queman permanentemente una fracción infinitesimal de la liquidez inicial:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl font-mono text-xs text-slate-300">
                    LP_inicial = sqrt(x_aportado * y_aportado) - MINIMUM_LIQUIDITY;
                  </div>
                  <p>
                    Donde <code>MINIMUM_LIQUIDITY</code> (1000 wei) se envía de forma irreversible a la dirección cero (<code>address(0)</code>).
                  </p>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">4. Depósitos Subsecuentes</h3>
                  <p>
                    Una vez activo el pool, los depósitos subsecuentes deben mantener la proporción actual:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-mono text-xs text-primary/95">
                    x_nuevo / y_nuevo = x_reserva / y_reserva
                  </div>
                  <p>
                    La cantidad de LP tokens emitidos se calcula tomando el mínimo de las proporciones para proteger a los proveedores preexistentes contra la inyección de valor desbalanceado:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl font-mono text-xs text-slate-300">
                    LP_emitidos = min((x_aportado * LP_total) / x_reserva, (y_aportado * LP_total) / y_reserva)
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: PÉRDIDA IMPERMANENTE */}
            {activeSubSection === 'dex-impermanente' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Pérdida Impermanente y Arbitraje
                  </CardTitle>
                  <CardDescription>
                    Análisis matemático del riesgo de pérdida por variación de precios y la dinámica de arbitraje.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    La <strong>Pérdida Impermanente (Impermanent Loss - IL)</strong> es la pérdida de valor que experimenta un proveedor de liquidez al depositar fondos en un pool en lugar de simplemente mantenerlos en una billetera externa (estrategia HODL), debido a la divergencia de precios de los tokens en el mercado.
                  </p>

                  <div className="my-4 border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                    <img
                      src="/docs/dex/perdida_impermanente_y_arbitraje_entre_mercados.png"
                      alt="Pérdida Impermanente y Arbitraje"
                      className="w-full h-auto rounded-lg filter drop-shadow-md"
                    />
                    <p className="text-center text-xs text-muted-foreground mt-2 font-medium">
                      Diagrama: Brecha de precios externa e intervención del arbitrador, con el correspondiente cálculo del balance final del portafolio.
                    </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-xs space-y-2 mt-2">
                    <span className="font-bold text-primary">Análisis Académico: Pérdida Impermanente e Intervención del Arbitrador</span>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      El diagrama anterior ilustra el mecanismo microeconómico por el cual se materializa la pérdida impermanente en un AMM y cómo los precios del pool se mantienen alineados con los mercados externos a través del arbitraje financiero. Cuando ocurre una brecha de precios externa (por ejemplo, el precio spot de un activo aumenta en intercambios centralizados de referencia como Binance), la piscina de liquidez se convierte temporalmente en una oportunidad de descuento para operadores externos. Un <em>arbitrador</em> interviene extrayendo el activo infravalorado del pool e inyectando a cambio el otro activo, repitiendo este swap hasta que la relación interna de reservas empuje el precio del pool a la paridad exacta con el mercado externo.
                    </p>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      Este reequilibrio constante tiene un costo para los proveedores de liquidez. Al vender sistemáticamente el activo que se aprecia y acumular el activo que se deprecia, la composición de la piscina cambia desfavorablemente para el LP. En el balance final del portafolio, el valor total del capital en la piscina (que ahora tiene menos unidades del token que subió de precio) es matemáticamente inferior al valor que habría tenido el capital de haberse mantenido intacto (Buy and Hold) fuera del pool de reservas. La diferencia porcentual entre ambas trayectorias de valor constituye la pérdida impermanente, la cual es financiada por las tarifas recaudadas para que proveer liquidez resulte rentable en el mediano plazo.
                    </p>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">1. Deducción Matemática</h3>
                  <p>
                    Si la variación relativa del precio del par externo con respecto al original es <strong>r = P_final / P_inicial</strong>, la pérdida impermanente porcentual se calcula formalmente como:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center my-3 font-mono text-lg text-primary font-bold">
                    IL(r) = (2 * sqrt(r)) / (1 + r) - 1
                  </div>
                  <p>
                    Esta pérdida ocurre porque la piscina de producto constante vende continuamente el token que sube de precio y compra el token que se devalúa para reequilibrar la proporción. Se denomina "impermanente" debido a que si el ratio de precios regresa al valor original (<strong>r = 1</strong>), la pérdida se reduce a cero.
                  </p>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">2. Tabla de Referencia Práctica</h3>
                  <div className="overflow-x-auto my-3 border border-border rounded-xl">
                    <table className="w-full text-xs text-left text-muted-foreground">
                      <thead className="text-[10px] bg-muted/50 text-foreground uppercase font-bold border-b border-border">
                        <tr>
                          <th className="px-4 py-2">Variación de Precio (r)</th>
                          <th className="px-4 py-2">Cambio Relativo</th>
                          <th className="px-4 py-2">Pérdida Impermanente (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        <tr>
                          <td className="px-4 py-2 font-mono">0.25x</td>
                          <td className="px-4 py-2">Caída del 75%</td>
                          <td className="px-4 py-2 font-mono text-red-400">-20.00%</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono">0.50x</td>
                          <td className="px-4 py-2">Caída del 50%</td>
                          <td className="px-4 py-2 font-mono text-red-400">-5.72%</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono">1.00x</td>
                          <td className="px-4 py-2">Sin cambio</td>
                          <td className="px-4 py-2 font-mono text-emerald-400">0.00%</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono">2.00x</td>
                          <td className="px-4 py-2">Aumento de 2x</td>
                          <td className="px-4 py-2 font-mono text-red-400">-5.72%</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono">4.00x</td>
                          <td className="px-4 py-2">Aumento de 4x</td>
                          <td className="px-4 py-2 font-mono text-red-400">-20.00%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">3. Dinámica del Arbitraje Óptimo</h3>
                  <p>
                    Los agentes de arbitraje intervienen para igualar los precios de la piscina con el precio externo. Un arbitrador sofisticado calcula el swap óptimo (<strong>Δx_opt</strong>) que maximiza sus ganancias considerando la comisión del 0.3% del pool:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-mono text-xs text-primary/95 text-center">
                    Δx_opt = (sqrt(x * y * P_ext * 0.997) - x) / 0.997
                  </div>
                  <p>
                    Las comisiones del 0.3% cobradas por los swaps se acumulan de forma continua incrementando el invariante <code>k</code>. Esto permite que, a largo plazo y bajo suficiente volumen comercial, las tarifas acumuladas por los proveedores de liquidez superen el impacto de la pérdida impermanente.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: ARQUITECTURA Y SEGURIDAD */}
            {activeSubSection === 'dex-seguridad' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Arquitectura de Smart Contracts y Seguridad
                  </CardTitle>
                  <CardDescription>
                    Estructuras de diseño en producción y mitigación de vulnerabilidades de Reentrada.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Los pools de liquidez manejan millones de dólares y representan un objetivo prioritario para exploits en DeFi. Una de las vulnerabilidades más comunes es la <strong>Reentrada (Reentrancy)</strong>, que ocurre cuando un contrato malicioso vuelve a llamar a una función de retiro antes de que el contrato original actualice su estado o balance.
                  </p>

                  <div className="my-4 border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                    <img
                      src="/docs/dex/foranatomia_de_un_bloqueo_de_reentrada_en_smart_contracts_seguridad.png"
                      alt="Anatomía del Bloqueo de Reentrada"
                      className="w-full h-auto rounded-lg filter drop-shadow-md"
                    />
                    <p className="text-center text-xs text-muted-foreground mt-2 font-medium">
                      Diagrama: Secuencia recursiva de un ataque de reentrada y la protección mediante candado de exclusión mutua (Mutex).
                    </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-xs space-y-2 mt-2">
                    <span className="font-bold text-primary">Análisis Académico: Anatomía de la Reentrada y el Candado Mutex</span>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      El diagrama técnico superior expone de forma detallada la anatomía de un ataque de reentrada (Reentrancy) y la mecánica de protección mediante candados de exclusión mutua o guardias mutex. Un ataque de reentrada se produce cuando un contrato externo malicioso, que actúa como contraparte en un swap o retiro de liquidez, aprovecha una llamada de transferencia física (como <code>call.value()</code> o transferencias de tokens con ganchos de notificación como ERC-777) para ejecutar código arbitrario antes de que el pool actualice su estado interno. El contrato atacante vuelve a invocar recursivamente la función de retiro, encontrando las variables de balance en su estado original pre-transferencia, lo que le permite retirar fondos repetidamente hasta agotar las reservas de la piscina.
                    </p>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      Para mitigar este riesgo catastrófico, se introducen dos mecanismos de defensa fundamentales. En primer lugar, la <em>Guardia de Reentrada (nonReentrant)</em> utiliza un modificador basado en un estado binario inalterable (mutex) que transiciona de <code>_UNLOCKED</code> a <code>_LOCKED</code> al entrar en la función y exige que el estado esté desbloqueado. Si ocurre una llamada recursiva, la validación inicial falla de inmediato, abortando toda la transacción. En segundo lugar, el patrón de diseño Checks-Effects-Interactions garantiza que incluso en ausencia de guardias de reentrada, los balances internos del contrato se reduzcan en disco antes de interactuar externamente, eliminando el incentivo matemático de la llamada recursiva.
                    </p>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">1. El Patrón Checks-Effects-Interactions</h3>
                  <p>
                    Para evitar exploits de reentrada, todas las funciones de escritura críticas deben seguir este orden lógico estricto:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li><strong>Checks (Validaciones):</strong> Evaluar condiciones y requisitos lógicos iniciales usando <code>require</code>.</li>
                    <li><strong>Effects (Efectos):</strong> Actualizar el estado interno del contrato (modificar balances en disco, quemar LP tokens) <em>antes</em> de transferir fondos.</li>
                    <li><strong>Interactions (Interacciones):</strong> Realizar llamadas externas o transferencias físicas hacia direcciones o tokens externos.</li>
                  </ul>
                  <p>
                    Al quemar los LP tokens del usuario en los efectos antes de invocar la transferencia de tokens subyacentes en las interacciones, cualquier llamada recursiva maliciosa que intente reingresar leerá un balance de LP igual a cero y la transacción fallará.
                  </p>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">2. Guardia de Reentrada (nonReentrant)</h3>
                  <p>
                    Además del patrón de diseño, se utiliza un candado de exclusión mutua (mutex) mediante variables de estado:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl font-mono text-xs text-slate-300">
                    <p className="text-primary font-bold">// Mutex simplificado en Solidity</p>
                    <p>bool private _locked;</p>
                    <p>modifier nonReentrant() &#123;</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;require(!_locked, "ReentrancyGuard: reentrant call");</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;_locked = true;</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;_;</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;_locked = false;</p>
                    <p>&#125;</p>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">3. Desacoplamiento en Core y Periphery</h3>
                  <p>
                    En la industria (Uniswap), la arquitectura se divide para optimizar gas y seguridad:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs">
                    <li><strong>Core (Núcleo):</strong> Contratos inmutables de bajo nivel (<code>Factory</code> y <code>Pair</code>). Su única función es la custodia física y segura de fondos, y la ejecución matemática directa del swap. No contienen lógica compleja para reducir superficie de ataque.</li>
                    <li><strong>Periphery (Periferia):</strong> Contratos mutables actualizables (<code>Router</code>) que interactúan con el usuario. Manejan el enrutamiento multisalto (multi-hop), validan tolerancias al deslizamiento y tiempos de expiración.</li>
                  </ul>
                  <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl space-y-1 text-xs">
                    <span className="block font-bold text-primary">Nota Didáctica</span>
                    <p>
                      Nuestro contrato <code>DEXPool.sol</code> unifica deliberadamente ambas responsabilidades de forma monolítica para facilitar la lectura del código, aunque en producción industrial se desacoplan de forma estricta.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: MEV Y ATAQUES SÁNDWICH */}
            {activeSubSection === 'dex-mev' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    MEV y Ataques Sándwich
                  </CardTitle>
                  <CardDescription>
                    Efectos del Valor Máximo Extraíble en la mempool y oráculos de precios TWAP.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    El diseño transparente de la mempool pública permite que operadores de nodos y bots analicen transacciones pendientes para reordenarlas de forma ventajosa antes de ser minadas, dando origen al <strong>Valor Máximo Extraíble (MEV)</strong>.
                  </p>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">1. Anatomía del Ataque Sándwich</h3>
                  <p>
                    Es el ataque de MEV más perjudicial para los traders del AMM:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 text-xs">
                    <li>El bot detecta un swap grande pendiente en la mempool que alterará significativamente el precio.</li>
                    <li><strong>Front-run:</strong> El bot compra el mismo token objetivo con una tarifa de gas alta para asegurar que su transacción se procese inmediatamente antes de la víctima, inflando el precio.</li>
                    <li>La transacción de la víctima se ejecuta al precio inflado, sufriendo un alto impacto y elevando aún más la cotización.</li>
                    <li><strong>Back-run:</strong> El bot vende inmediatamente sus tokens al precio inflado por la víctima en la misma transacción de bloque, reclamando una ganancia neta libre de riesgo.</li>
                  </ol>

                  <div className="my-4 border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                    <img
                      src="/docs/dex/fundamentos_dex.png"
                      alt="Fundamentos DEX y MEV"
                      className="w-full h-auto rounded-lg filter drop-shadow-md"
                    />
                    <p className="text-center text-xs text-muted-foreground mt-2 font-medium">
                      Diagrama: Flujo operativo de un bot MEV que realiza un ataque sándwich a una transacción de swap de gran volumen.
                    </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-xs space-y-2 mt-2">
                    <span className="font-bold text-primary">Análisis Académico: Anatomía del MEV y Ataques Sándwich</span>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      El diagrama anterior esquematiza la dinámica del Valor Máximo Extraíble (MEV) mediante un <em>ataque sándwich</em>, una técnica de manipulación del orden de transacciones que explota la visibilidad pública de la mempool de Ethereum. La secuencia comienza cuando un bot MEV detecta una transacción de intercambio de gran volumen pendiente en la mempool, la cual inevitablemente desplazará de forma significativa el precio spot en el pool. Para capitalizar este movimiento, el bot transmite dos transacciones propias: la primera (Front-run) compra el activo objetivo con una tarifa de gas (priority fee) superior para asegurar que los validadores la ordenen inmediatamente antes de la transacción de la víctima, encareciendo artificialmente el activo.
                    </p>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      Posteriormente, la transacción de la víctima se ejecuta, absorbiendo todo el impacto del deslizamiento de precios (slippage) y empujando el valor de cotización aún más hacia arriba. Inmediatamente en el mismo bloque, la segunda transacción del bot (Back-run) vende el activo adquirido al nuevo precio inflado. Al ejecutarse ambas órdenes de compra y venta del bot rodeando ("sándwich") la transacción de la víctima, el atacante asegura un retorno libre de riesgo a expensas de la pérdida directa de eficiencia cambiaria del usuario legítimo. Para mitigar esta vulnerabilidad, se han desarrollado redes de mempools privadas (como Flashbots Protect/MEV-Share) que envían transacciones directamente a los constructores de bloques sin exponerlas públicamente.
                    </p>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">2. Protección: Slippage y Deadlines</h3>
                  <p>
                    Para mitigar estos ataques, el Router del AMM incluye parámetros estrictos de validación:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li><code>amountOutMin</code>: Si el precio es empujado más allá del límite de deslizamiento permitido, la transacción de la víctima se cancela (revert), anulando la ganancia del bot atacante.</li>
                    <li><code>deadline</code>: Marca de tiempo límite UNIX de red. Si una transacción queda en cola por gas bajo y se procesa después de esta marca, expira automáticamente para proteger al trader de volatilidades tardías.</li>
                  </ul>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">3. Oráculos de Precios: Spot vs. TWAP</h3>
                  <p>
                    Usar el precio spot marginal instantáneo del pool (<code>y / x</code>) como oráculo para otros contratos es altamente vulnerable a manipulación mediante préstamos rápidos (<strong>Flash Loans</strong>).
                  </p>
                  <p>
                    Para blindar los sistemas contra esto, se utiliza el <strong>Precio Promedio Ponderado en el Tiempo (TWAP)</strong>. En lugar de registrar el precio spot actual, el pool almacena un acumulador persistente que multiplica el precio spot por la diferencia de tiempo entre bloques:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center my-3 font-mono text-base text-primary font-bold">
                    TWAP_[t1, t2] = (precioAcumulado(t2) - precioAcumulado(t1)) / (t2 - t1)
                  </div>
                  <p>
                    Dado que las manipulaciones con préstamos rápidos solo duran un instante dentro del mismo bloque de transacción, su efecto sobre los acumuladores es prácticamente nulo en periodos prolongados.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: MODELOS DE AMM Y EVM */}
            {activeSubSection === 'dex-aritmetica' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Modelos de AMM y Aritmética de Máquina (EVM)
                  </CardTitle>
                  <CardDescription>
                    Taxonomía de creadores de mercado y técnicas de programación de bajo nivel en Solidity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    El diseño de los AMM varía en su formulación matemática en función de la naturaleza de los activos involucrados y las optimizaciones físicas de almacenamiento que impone la máquina virtual de Ethereum.
                  </p>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">1. Familias de AMM (CFMM)</h3>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li><strong>Suma Constante (x + y = k):</strong> Permite swaps con deslizamiento cero, pero si hay una desviación de precio externo, los bots drenan por completo la piscina del activo subvaluado.</li>
                    <li><strong>Producto Constante (x * y = k):</strong> Resiliencia de liquidez infinita (el pool nunca se agota), pero tiene una baja eficiencia en el uso de capital para swaps cotidianos.</li>
                    <li><strong>Invariante Híbrido (Curve Stableswap):</strong> Combina suma y producto con un factor de apalancamiento dinámico. Diseñado para tokens con valor correlacionado (stablecoins), ofreciendo deslizamiento mínimo.</li>
                    <li><strong>Liquidez Concentrada (Uniswap V3):</strong> Los proveedores definen rangos de precios [Pa, Pb] específicos para sus depósitos, aumentando drásticamente la eficiencia de capital pero elevando el riesgo de pérdida impermanente si el precio sale del rango.</li>
                  </ul>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">2. Aritmética de Punto Fijo (UQ112x112)</h3>
                  <p>
                    Para operar con fracciones de forma exacta y determinista en la EVM, se utiliza el estándar <code>UQ112x112</code>. Este formato codifica un entero sin signo de 224 bits, donde los 112 bits menos significativos representan la parte fraccionaria y los 112 bits más significativos la parte entera:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-primary/95 text-center">
                    Valor Almacenado (X) = piso(x * 2^112)
                  </div>
                  <p>
                    Esto permite realizar multiplicaciones y divisiones a nivel de bits (desplazamientos con <code>shr</code> y <code>shl</code>) con una precisión extremadamente alta, ideal para calcular oráculos de precios eficientes en gas.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                      <img
                        src="/docs/dex/aritmetica_de_punto_fijo_y_la_estructura_de_datos_uq112x112_en_la_evm.png"
                        alt="Aritmética UQ112x112 y Storage - Parte 1"
                        className="w-full h-auto rounded-lg filter drop-shadow-md"
                      />
                      <p className="text-center text-[11px] text-muted-foreground mt-2 font-medium">
                        Diagrama: Estructura física de datos en memoria para el formato de punto fijo UQ112x112 y empaquetado de variables de almacenamiento.
                      </p>
                    </div>
                    <div className="border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                      <img
                        src="/docs/dex/aritmetica_de_punto_fijo_y_la_estructura_de_datos_uq112x112_en_la_evm-2.png"
                        alt="Aritmética UQ112x112 y Storage - Parte 2"
                        className="w-full h-auto rounded-lg filter drop-shadow-md"
                      />
                      <p className="text-center text-[11px] text-muted-foreground mt-2 font-medium">
                        Detalle: Representación binaria, operaciones de desplazamiento de bits y rango de valores soportados en la EVM.
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-xs space-y-2 mt-2">
                    <span className="font-bold text-primary">Análisis Académico: Aritmética UQ112x112 y Optimización de Gas</span>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      Las infografías anteriores ilustran detalladamente el estándar aritmético de punto fijo <code>UQ112x112</code> y el empaquetado de variables de almacenamiento (Packed Storage), técnicas fundamentales para realizar cálculos fraccionarios exactos y optimizar el consumo de gas en Solidity. En la Parte 1, observamos cómo se asignan los bits dentro del tipo primitivo de 256 bits (<code>uint256</code>) para representar fracciones. Al no contar con soporte nativo para números decimales (coma flotante) en la EVM, se divide el espacio de almacenamiento asignando los 112 bits más significativos a la parte entera y los 112 bits menos significativos a la parte decimal o fraccionaria. Esto permite almacenar ratios de precios con hasta 34 decimales de precisión, blindando al oráculo frente a ataques de manipulación aritmética sutil.
                    </p>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      En la Parte 2, se expone la interacción con el almacenamiento físico de la EVM (Storage Slots). Un slot completo mide exactamente 256 bits. Al limitar las variables de reservas a <code>uint112</code> cada una, y el timestamp de bloque a <code>uint32</code>, Uniswap V2 logra empaquetar de manera óptima las tres variables (112 + 112 + 32 = 256 bits) en un solo slot consecutivo. Como consecuencia directa, durante la ejecución de swaps, el contrato realiza una única lectura y una única escritura del storage, evitando los costosos cargos de gas asociados a modificar múltiples slots de forma independiente (ahorrando aproximadamente 15,000 unidades de gas por transacción).
                    </p>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">3. Empaquetado físico de variables (Packed Storage)</h3>
                  <p>
                    Dado que las lecturas y escrituras de storage en Solidity (opcodes <code>sload</code> y <code>sstore</code>) son los procesos que más consumen recursos de gas, se aplica empaquetado para agrupar variables menores a 32 bytes consecutivas en el mismo slot de 256 bits:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl font-mono text-xs text-slate-300">
                    uint112 private reserve0; // 112 bits
                    <br />
                    uint112 private reserve1; // 112 bits
                    <br />
                    uint32 private blockTimestampLast; // 32 bits (Total = 256 bits)
                  </div>
                  <p>
                    Al realizar un swap, el pool actualiza ambas reservas y la marca de tiempo de la última transacción ejecutando un único opcode de lectura y uno de escritura, reduciendo a la mitad los costos de gas.
                  </p>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">4. Tokens Deflacionarios (Fee-on-Transfer)</h3>
                  <p>
                    Si un pool recibe un token deflacionario que cobra impuestos internos por transacción, el saldo real de entrada transferido diferirá del nominal declarado, lo que corrompe la constante <code>k</code>. Para evitar vulnerabilidades de integración, se miden los balances dinámicos:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl font-mono text-xs text-primary/95 text-center">
                    Δx_real = balanceActual - balancePrevio
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SUB-SECCIÓN: CURVAS DE VINCULACIÓN */}
            {activeSubSection === 'dex-bonding' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Curvas de Vinculación y Algoritmo de Bancor
                  </CardTitle>
                  <CardDescription>
                    Mecánicas de emisión autónoma de tokens respaldados por un tesoro de colateral.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Una <strong>Curva de Vinculación (Bonding Curve)</strong> es un contrato inteligente que actúa como el emisor autónomo y único contraparte de un token, gestionando directamente la acuñación (minting) y quema (burning) en respuesta a la demanda, eliminando la necesidad de proveedores de liquidez pasivos.
                  </p>

                  <div className="my-4 border border-border rounded-xl overflow-hidden bg-background p-1.5 shadow-inner">
                    <img
                      src="/docs/dex/curvas_de_vinculacion_bonding_curves.png"
                      alt="Curvas de Vinculación y Bancor"
                      className="w-full h-auto rounded-lg filter drop-shadow-md"
                    />
                    <p className="text-center text-xs text-muted-foreground mt-2 font-medium">
                      Diagrama: Relación entre suministro, colateral de reserva y precio spot marginal en curvas de vinculación (Bancor).
                    </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-xs space-y-2 mt-2">
                    <span className="font-bold text-primary">Análisis Académico: Dinámica de Curvas de Vinculación e Invariantes</span>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      El diagrama expone el funcionamiento matemático de una curva de vinculación de Bancor, una alternativa de emisión de liquidez soberana. En lugar de emparejar dos activos en una hipérbola de producto constante, el contrato acuña y emite un token de utilidad nativo a cambio de un colateral de reserva físico (como ETH o DAI) depositado y custodiado de forma exclusiva por el contrato inteligente. El precio del token se determina de forma continua en función de la oferta circulante actual (Suministro), siguiendo una ecuación predefinida por el <em>Reserve Ratio (CRR) o peso del conector (F)</em>.
                    </p>
                    <p className="text-muted-foreground leading-relaxed font-normal">
                      Como se detalla en el gráfico, un peso del conector inferior al $100\%$ establece una curva de precios de apreciación exponencial. Esto garantiza liquidez matemática infinita y una rampa de precios en la que cada nueva unidad emitida se encarece progresivamente, incentivando la inyección de capital en etapas tempranas. La integral del área bajo la curva representa la cantidad total de colateral custodiada físicamente por el contrato inteligente. Cuando un usuario desea liquidar sus posiciones, el contrato quema sus tokens y le devuelve de manera garantizada y determinista la cantidad correspondiente de colateral, operando como un banco de reserva inmutable y automatizado sin riesgo de insolvencia.
                    </p>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">1. Algoritmo de Bancor y Reserve Ratio (CRR)</h3>
                  <p>
                    La <strong>Relación de Reserva Constante (CRR o Connector Weight - F)</strong> define una proporción fija que el contrato inteligente debe mantener entre el balance del colateral guardado (<strong>R</strong>) y la capitalización de mercado virtual del token emitido:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center my-3 font-mono text-lg text-primary font-bold">
                    F = R / (S * P)
                  </div>
                  <p>
                    Donde <strong>S</strong> es el suministro circulante del token y <strong>P</strong> es el precio unitario spot marginal. 
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
                    <li>Un <strong>F = 100%</strong> define un precio constante insensible al suministro (respaldo total 1:1, como en una stablecoin colateralizada).</li>
                    <li>Un <strong>F &lt; 100%</strong> (ej. 20%) define una curva polinómica de apreciación acelerada que premia financieramente a los primeros compradores.</li>
                  </ul>

                  <h3 className="text-base font-bold text-foreground mt-6 mb-2">2. Costo de Compra y Retorno de Venta</h3>
                  <p>
                    Como el precio spot cambia infinitesimalmente con el suministro, el costo de adquirir un lote discreto de tokens (<strong>ΔS</strong>) se calcula resolviendo la integral definida del área bajo la curva de precios:
                  </p>
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl font-mono text-xs text-slate-300 space-y-2">
                    <p className="text-primary font-bold">// Costo de Compra (Cargas de Colateral a depositar)</p>
                    <p>Costo = R * [ ( 1 + ΔS/S )^(1/F) - 1 ]</p>
                    <p className="text-primary font-bold mt-3">// Retorno de Venta (Colateral a devolver al quemar tokens)</p>
                    <p>Retorno = R * [ 1 - ( 1 - ΔS/S )^(1/F) ]</p>
                  </div>
                  <p>
                    Para codificar potencias reales fraccionarias de manera eficiente y determinista en la EVM sin consumir demasiado gas, los contratos de producción implementan aproximaciones polinómicas rápidas (Series de Taylor).
                  </p>
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

                    <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/10 p-4 space-y-3">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">Representación de Decimales en Ethereum: De Wei a Ether</span>
                      <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                        Dado que la EVM no admite internamente números decimales (punto flotante), todos los saldos y cálculos se realizan utilizando la unidad mínima indivisible: el <strong>Wei</strong> (1 Ether = 10<sup>18</sup> Wei).
                      </p>
                      <div className="my-3 border border-border/80 rounded-lg overflow-hidden bg-background p-1.5 shadow-inner">
                        <img src="/docs/dex/representacion_de_decimales_en_ethereum_de_wei_a_ether.png" alt="Representación de Decimales" className="w-full h-auto rounded filter drop-shadow" />
                        <p className="text-center text-[10px] text-muted-foreground mt-2 font-medium">Diagrama: Escala y denominación de unidades en Ethereum.</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/10 p-3.5 rounded-lg text-xs space-y-2 mt-2">
                        <span className="font-bold text-primary">Análisis Académico: Precisión Entera en la Capa de Ejecución</span>
                        <p className="text-muted-foreground leading-relaxed font-normal">
                          El diagrama anterior esquematiza la denominación de magnitudes en Ethereum, un pilar del diseño de sistemas de registros distribuidos. Al no contar con representación de punto flotante en la EVM (lo que introduciría indeterminación y problemas de consenso debido al redondeo de coma flotante de hardware), Ethereum maneja toda la contabilidad financiera con aritmética entera de 256 bits (<code>uint256</code>). La unidad estándar, Ether, se expresa internamente escalada por $10^&#123;18&#125;$ unidades de Wei. Otras denominaciones históricas intermedias incluyen el Gwei ($10^9$ Wei), utilizado primordialmente para cuantificar el costo del gas en el mercado de subastas de bloques (EIP-1559).
                        </p>
                        <p className="text-muted-foreground leading-relaxed font-normal">
                          En el desarrollo de interfaces de usuario (frontends), este diseño obliga a realizar una conversión de unidades constante. Las librerías de cliente como Viem y ethers.js proveen utilidades de formateo (tales como <code>formatEther</code> y <code>parseEther</code>) que desplazan el punto decimal para presentar cifras legibles al usuario, mientras que todas las transacciones físicas enviadas a la red y operaciones matemáticas de contratos inteligentes continúan operando estrictamente en la escala discreta de Wei para evitar cualquier pérdida de valor por redondeo.
                        </p>
                      </div>
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
