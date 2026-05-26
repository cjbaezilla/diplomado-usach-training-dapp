import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Navbar } from '@/components/Navbar';
import { PageHeader } from '@/components/PageHeader';
import { Footer } from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  HelpCircle,
  BookOpen,
  User,
  Coins,
  ArrowRightLeft,
  Award,
  Terminal,
  Compass,
  FileCode,
  Blocks,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

const Aprender: NextPage = () => {
  const [activeSection, setActiveSection] = useState('introduccion');

  const sections = [
    { id: 'introduccion', label: 'Guía de Inicio', icon: BookOpen },
    { id: 'identidad', label: 'Identidad Digital', icon: User },
    { id: 'erc20', label: 'Tokens ERC-20', icon: Coins },
    { id: 'dex', label: 'Exchange AMM', icon: ArrowRightLeft },
    { id: 'reliquias', label: 'Reliquias Históricas', icon: Award },
    { id: 'glosario', label: 'Glosario Web3', icon: Terminal },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <Head>
        <title>Aprender y Wiki Web3 - USACH</title>
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
          title="Aprender y Wiki DApp"
          description="Aprende cómo interactuar con los contratos inteligentes, emitir tus propios tokens ERC-20, proveer liquidez en el DEX, gestionar tu identidad digital estudiantil y desbloquear reliquias históricas de la Escuela de Artes y Oficios (EAO) en la red blockchain."
          icon={Compass}
          breadcrumbItems={[
            { label: 'Wiki / Aprender' }
          ]}
        />

        {/* Layout Principal de Dos Columnas: Sidebar Izquierdo + Contenido Derecho */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* 1. NAVEGACIÓN MÓVIL HORIZONTAL (Visible solo en pantallas pequeñas) */}
          <div className="lg:hidden w-full overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
            <div className="flex gap-2 w-max">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/40"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SIDEBAR DE ESCRITORIO (Visible solo en pantallas grandes) */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-2 bg-slate-900 border border-slate-800/80 p-4 rounded-2xl shadow-lg shadow-black/20 self-start sticky top-20">
            <h3 className="px-3 mb-2 text-[10px] text-slate-400 uppercase font-extrabold tracking-wider text-left">
              Módulos de la Wiki
            </h3>
            <div className="flex flex-col gap-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 text-left border-l-2 cursor-pointer",
                      isActive
                        ? "bg-primary/15 text-primary border-primary font-black shadow-sm"
                        : "text-slate-300 border-transparent hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* 3. ÁREA DE CONTENIDO (lg:col-span-9) */}
          <div className="lg:col-span-9 w-full flex-1">
            {/* SECCIÓN: INTRODUCCIÓN */}
            {activeSection === 'introduccion' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch w-full animate-in fade-in duration-300">
                {/* Información General */}
                <Card className="md:col-span-8 border-border/80 bg-card/45 backdrop-blur-md flex flex-col justify-between text-left">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Guía de Inicio Rápido
                    </CardTitle>
                    <CardDescription>
                      Cómo configurar tu entorno de aprendizaje para interactuar con la dApp.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      Esta dApp es un laboratorio interactivo para el **Diplomado en Tecnologías Blockchain** de la **Universidad de Santiago de Chile (USACH)**. Funciona interactuando directamente con contratos inteligentes desplegados en una blockchain compatible con Ethereum Virtual Machine (EVM).
                    </p>

                    <div className="space-y-3">
                      <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Paso 1: Conectar tu Billetera Web3
                      </h3>
                      <p className="text-xs pl-5">
                        Usa una extensión como **MetaMask** o cualquier billetera compatible con WalletConnect. Asegúrate de configurar la red correcta (la red de prueba Sepolia si el curso está en línea o localhost si estás corriendo el nodo local de Hardhat).
                      </p>

                      <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Paso 2: Registrar tu Identidad Digital
                      </h3>
                      <p className="text-xs pl-5">
                        Antes de operar en los otros módulos, ve a la sección de **Identidad** para registrar tu perfil de estudiante con tu nombre, correo electrónico institucional y redes sociales. Esto desplegará tu identidad en la blockchain.
                      </p>

                      <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Paso 3: Obtener fondos de prueba (Gas & Tokens)
                      </h3>
                      <p className="text-xs pl-5">
                        Para realizar cualquier transacción (escribir datos, hacer swaps, reclamar reliquias) necesitas pagar **Gas** (en ETH). Puedes obtener gas a través de faucets públicas o del sistema local, y tokens de prueba usando la sección de Faucet en el Inicio.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips de Seguridad */}
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
                    <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                      <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl space-y-2">
                        <span className="block font-bold text-amber-500">Redes de Prueba Solamente</span>
                        <p>
                          **Nunca utilices fondos reales ni tu clave privada principal.** Este laboratorio utiliza tokens de simulación sin valor monetario real. Úsalo exclusivamente en redes locales o testnets.
                        </p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
                        <span className="block font-bold text-foreground">El Rol del Gas Fee</span>
                        <p>
                          Cada interacción de escritura modifica el estado de la blockchain y requiere poder computacional. Los validadores cobran una pequeña comisión llamada **Gas Fee**. Si tu transacción falla, revisa si tienes suficiente saldo en tu billetera.
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            {/* SECCIÓN: IDENTIDAD */}
            {activeSection === 'identidad' && (
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
                <CardContent className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground text-base">¿Qué es el Registro de Identidad?</h3>
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
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground text-base">Funciones Clave del Contrato</h3>
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
                          Dirección del Contrato en Red
                        </h4>
                        <p className="text-[11px] font-mono break-all text-slate-300">
                          {`process.env.NEXT_PUBLIC_STUDENT_IDENTITY_ADDRESS`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECCIÓN: ERC20 */}
            {activeSection === 'erc20' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Módulo de Tokens ERC-20 (`BaseERC20.sol` & `TokenFactory.sol`)
                  </CardTitle>
                  <CardDescription>
                    Creación automatizada de tokens estándar y simulación de su ciclo de vida.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground text-base">Fábrica de Tokens (TokenFactory)</h3>
                      <p>
                        Para evitar la complejidad de escribir, compilar y desplegar contratos individualmente, implementamos **`TokenFactory.sol`**. Esta fábrica permite a cualquier estudiante emitir un nuevo contrato ERC-20 enviando una simple transacción.
                      </p>
                      <p>
                        El estudiante especifica el **Nombre**, **Símbolo** y el **Suministro Inicial (Initial Supply)**. La fábrica despliega una instancia de `BaseERC20.sol`, asigna los tokens al creador y los añade al registro general del laboratorio.
                      </p>

                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2">
                        <span className="block font-bold text-foreground text-xs uppercase">Estándar ERC-20 Clásico:</span>
                        <p className="text-xs">
                          Es el estándar más popular de la red Ethereum para representar activos intercambiables o representaciones de valor. Todos los tokens ERC-20 implementan una interfaz matemática idéntica, lo que permite que billeteras, exchanges y pools DeFi interactúen con ellos de manera universal.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground text-base">Operaciones Comunes de Tokens</h3>
                      <ul className="space-y-2.5 text-xs text-muted-foreground">
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

                      <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl space-y-2 mt-4">
                        <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                          <Blocks className="h-4 w-4" />
                          Arquitectura del Despliegue
                        </h4>
                        <p className="text-xs">
                          Cada token creado a través de la fábrica es un contrato inteligente independiente con su propia dirección pública, la cual se agrega automáticamente al panel general del simulador para que otros estudiantes puedan interactuar.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECCIÓN: DEX */}
            {activeSection === 'dex' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Exchange Descentralizado (DEX AMM)
                  </CardTitle>
                  <CardDescription>
                    Funcionamiento de Pools de Liquidez y Creadores de Mercado Automatizados (Constant Product AMM).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground text-base">El Creador de Mercado Automatizado (AMM)</h3>
                      <p>
                        A diferencia de los mercados tradicionales basados en un libro de órdenes de compra y venta, los exchanges descentralizados modernos utilizan **Pools de Liquidez** (reservas de tokens bloqueadas en un contrato inteligente).
                      </p>
                      <p>
                        El precio de intercambio se calcula matemáticamente basándose en la proporción de tokens en el pool siguiendo la fórmula de Uniswap V2:
                      </p>
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                        <code className="text-xl font-mono text-primary font-bold">x * y = k</code>
                        <p className="text-[11px] text-muted-foreground mt-2">
                          Donde <strong className="text-foreground">x</strong> e <strong className="text-foreground">y</strong> son los balances de reserva de los dos tokens, y <strong className="text-foreground">k</strong> es una constante que no debe variar durante el intercambio.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground text-base">Conceptos DeFi Clave</h3>
                      <ul className="space-y-3 text-xs">
                        <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20">
                          <strong className="text-foreground block mb-0.5">Proveer Liquidez:</strong>
                          Aportas dos tokens en valor equivalente (ej. 50% Token A y 50% Token B). A cambio, recibes **Tokens LP** que representan tu participación en la piscina de reservas.
                        </li>
                        <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20">
                          <strong className="text-foreground block mb-0.5">Slippage (Deslizamiento):</strong>
                          La variación de precio que ocurre entre el momento en que envías la transacción y el momento en que se confirma en bloque, debido al tamaño relativo de tu swap en comparación con la liquidez del pool.
                        </li>
                        <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20">
                          <strong className="text-foreground block mb-0.5">Impermanent Loss (Pérdida Impermanente):</strong>
                          La pérdida porcentual que sufre un proveedor de liquidez en comparación con simplemente mantener los tokens en su billetera, ocasionada por la divergencia de precios de los tokens en el mercado.
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECCIÓN: RELIQUIAS */}
            {activeSection === 'reliquias' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Reliquias e Insignias del Lore USACH (`BaseERC1155.sol`)
                  </CardTitle>
                  <CardDescription>
                    Gamificación en blockchain de la historia y el lore patrimonial de la Escuela de Artes y Oficios (EAO).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground text-base">Insignias Multi-Token (ERC-1155)</h3>
                      <p>
                        El estándar **ERC-1155** es una evolución tecnológica que permite definir tokens fungibles, semi-fungibles y no fungibles en el mismo contrato. En este módulo, se utiliza para catalogar las Reliquias Históricas.
                      </p>
                      <p>
                        Cada reliquia representa un hito o elemento arquitectónico emblemático de la universidad (como el Péndulo de Foucault, el Planetario, la Campana de la EAO o las Calderas).
                      </p>

                      <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 space-y-2">
                        <span className="font-bold text-emerald-500 flex items-center gap-1 text-xs">
                          <ShieldCheck className="h-4 w-4" /> Ventajas Pasivas (Buffs)
                        </span>
                        <p className="text-xs">
                          Al reclamar y poseer una reliquia en tu billetera, el sistema detectará tu balance y activará efectos pasivos dinámicos visibles en tu perfil (ej. incremento de velocidad de minado de tokens, multiplicador de XP o acceso prioritario a pools).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground text-base">Sistema de Experiencia y Niveles</h3>
                      <p>
                        Cada vez que minteas una reliquia, adquieres los puntos de experiencia (**XP**) que tiene configurada en su JSON de metadatos.
                      </p>
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Fórmula de Niveles</span>
                          <p className="text-base text-foreground font-bold">Nivel = (XP / 100) + 1</p>
                        </div>
                        <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                          <Zap className="h-5 w-5 animate-pulse" />
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mt-4">¿Cómo se resuelven las imágenes y descripciones?</h4>
                      <p className="text-xs leading-relaxed">
                        El contrato inteligente almacena una dirección URL base de metadatos. Al realizar una consulta, la aplicación lee dinámicamente el identificador decimal del token, descarga el archivo JSON correspondiente desde el servidor descentralizado y renderiza sus propiedades.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECCIÓN: GLOSARIO */}
            {activeSection === 'glosario' && (
              <Card className="border-border/80 bg-card/45 backdrop-blur-md text-left w-full animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    Glosario de Términos Web3
                  </CardTitle>
                  <CardDescription>
                    Conceptos fundamentales para el entendimiento del desarrollo en Ethereum y EVM.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">EVM (Ethereum Virtual Machine)</span>
                      <p className="text-xs">
                        El entorno virtual ejecutable en el que corren los contratos inteligentes. Redes como Polygon, Arbitrum, Optimism y Base son compatibles con la EVM, lo que permite que el mismo código corra de forma idéntica en ellas.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">ABI (Application Binary Interface)</span>
                      <p className="text-xs">
                        Un archivo en formato JSON que detalla todas las funciones, argumentos y retornos de un contrato inteligente. Permite que el frontend en JavaScript/TypeScript sepa cómo comunicarse con la blockchain de forma tipada.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">Smart Contract (Contrato Inteligente)</span>
                      <p className="text-xs">
                        Código inmutable autoejecutable almacenado en la cadena de bloques. Una vez desplegado, sigue estrictamente las reglas escritas en su código sin posibilidad de intervención de terceros.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">Gas y Gas Limit</span>
                      <p className="text-xs">
                        El gas es la unidad que mide el esfuerzo de computación para realizar transacciones. El Gas Limit es el tope de gas que estás dispuesto a consumir. Si la ejecución excede este tope, la transacción se revierte conservando la tarifa pagada.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">Firma de Transacción (Signature)</span>
                      <p className="text-xs">
                        Una prueba criptográfica que verifica que una transacción fue generada por el dueño de la clave privada de una billetera, impidiendo la falsificación de identidad o saldo.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900">
                      <span className="font-mono text-primary font-bold text-xs block mb-1">RPC Node (Remote Procedure Call)</span>
                      <p className="text-xs">
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
