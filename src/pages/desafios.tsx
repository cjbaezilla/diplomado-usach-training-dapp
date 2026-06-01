import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Navbar } from '@/components/Navbar';
import { PageHeader } from '@/components/PageHeader';
import { Footer } from '@/components/Footer';
import { useHydrated } from '@/hooks/useHydrated';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Trophy,
  Award,
  Lock,
  Unlock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  Zap,
  HelpCircle as QuestionIcon,
  BookOpen
} from 'lucide-react';

const DesafiosPage: NextPage = () => {
  const isHydrated = useHydrated();
  const { isConnected } = useAccount();

  // Paso actual (Desafío activo)
  const challengeId = isConnected ? 2 : 1;
  
  // Datos del desafío activo
  const activeChallenge = challengeId === 1 
    ? {
        id: 1,
        title: 'Vincular Billetera Web3',
        difficulty: 'Principiante',
        difficultyColor: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-300 border-green-500/20',
        xp: 10,
        description: 'El punto de partida de tu aventura on-chain en la USACH. Debes conectar tu billetera digital autorizada a la dApp para establecer tu firma criptográfica en el cliente. Esto habilitará la interacción con contratos inteligentes y te dará acceso a las pruebas avanzadas.',
        relicName: 'Insignia #0: El Alambique y Recipiente (Taller de la EAO)',
        relicBuff: 'Destilación de Conocimiento (+5 de Transmutación)',
        relicXp: 10
      }
    : {
        id: 2,
        title: 'Desafío Secreto (Encriptado)',
        difficulty: '???',
        difficultyColor: 'bg-muted border-border text-muted-foreground',
        xp: '??',
        description: 'Esta prueba académica permanece encriptada bajo el protocolo de la Escuela de Artes y Oficios (EAO). Se revelará de manera automática y progresiva a medida que el laboratorio de desarrollo libere los contratos en la red de pruebas. ¡Mantente atento!',
        relicName: 'Reliquia Bloqueada',
        relicBuff: 'Efecto Pasivo Desconocido',
        relicXp: '??'
      };

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <Head>
        <title>Desafíos Web3 e Identidad de Explorador</title>
        <meta
          content="Sigue tu senda de desafíos on-chain. Completa cada reto secuencial para descifrar contratos inteligentes y reclamar reliquias históricas."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Navbar />

      <main className="flex-1 w-full p-4 sm:p-6 md:p-8 space-y-8 flex flex-col justify-center">
        {/* Encabezado Principal Homologado (Fluid) */}
        <div className="w-full">
          <PageHeader
            title="Senda de Desafíos Académicos"
            description="Supera pruebas criptográficas en la red para desbloquear el acceso a reliquias históricas y avanzar en tu rango de desarrollador. Las pruebas futuras permanecen encriptadas hasta que resuelvas la tarea actual."
            icon={Trophy}
            breadcrumbItems={[
              { label: 'Desafíos' }
            ]}
            actions={
              <Link href="/relics">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-border/60 hover:bg-muted/80 text-xs font-semibold"
                >
                  <Award className="h-3.5 w-3.5 text-primary" />
                  Ver Reliquias
                </Button>
              </Link>
            }
          />
        </div>

        {/* LAYOUT PRINCIPAL DE DOS COLUMNAS: SIDEBAR INFORMATIVO (IZQUIERDA) + CONTENIDO INTERACTIVO (DERECHA) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
          
          {/* COLUMNA IZQUIERDA: SIDEBAR INFORMATIVO (5 de 12 columnas) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-border/70 bg-card/45 backdrop-blur-md shadow-lg space-y-6 relative overflow-hidden transition-all duration-300 hover:border-primary/20">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-cyan-500"></div>

            <div className="space-y-4">
              {/* Número del Desafío */}
              <span className="text-xs font-mono font-extrabold tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full w-fit block animate-pulse">
                Desafío #0{activeChallenge.id}
              </span>

              {/* Título Grande */}
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {activeChallenge.title}
              </h2>

              {/* Recompensa y Dificultad */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="secondary" className="font-bold text-xs bg-muted/80 px-2.5 py-1 flex items-center gap-1.5 text-foreground">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  +{activeChallenge.xp} XP Recompensa
                </Badge>
                <Badge className={`text-xs font-bold px-2.5 py-1 rounded-full border ${activeChallenge.difficultyColor}`}>
                  {activeChallenge.difficulty}
                </Badge>
              </div>

              {/* Descripción */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2">
                {activeChallenge.description}
              </p>
            </div>

            {/* Lore de la EAO al pie del sidebar */}
            <div className="pt-6 border-t border-border/10 text-xs text-muted-foreground/80 leading-relaxed space-y-2">
              <p className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Tradición del Forjador:</strong> En la antigua Escuela de Artes y Oficios (EAO), los alumnos avanzaban un peldaño técnico a la vez, demostrando maestría en cada taller antes de revelar el secreto del siguiente oficio.
                </span>
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA: CONTENIDO INTERACTIVO (7 de 12 columnas) */}
          <div className="lg:col-span-7 flex flex-col justify-center w-full">
            {!isConnected ? (
              /* ================= CONTENIDO DESAFÍO 1: CONECTAR BILLETERA ================= */
              <Card className="border border-primary/20 shadow-md bg-card/45 backdrop-blur-md rounded-3xl h-full flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-primary/40">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Unlock className="h-5 w-5 text-primary" />
                    Acción Requerida
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Vincula tu cliente criptográfico para validar el estado de tus desafíos.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 flex-1 flex flex-col justify-center items-center py-8">
                  {/* Caja de Recompensa Visual */}
                  <div className="w-full max-w-md bg-muted/40 border border-border/30 p-4 rounded-2xl text-left space-y-2 shadow-inner">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                      Reliquia Vinculada
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center border border-border/60 shadow-sm shrink-0">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">
                          {activeChallenge.relicName}
                        </h4>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✨ Pasivo: {activeChallenge.relicBuff}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center max-w-sm leading-relaxed">
                    Presiona el botón de conexión de abajo. Una vez que tu firma Web3 esté disponible, este paso se marcará como completado y se desbloqueará el siguiente hito secreto.
                  </p>

                  <div className="flex justify-center pt-2">
                    <ConnectButton label="Vincular Billetera Web3" />
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/10 border-t border-border/20 p-4 justify-center text-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    Billetera protegida. No se solicitarán gas ni firmas de transferencia para este paso.
                  </span>
                </CardFooter>
              </Card>
            ) : (
              /* ================= CONTENIDO DESAFÍO 2: SECRETO (ENCRIPTADO) ================= */
              <Card className="border border-border/80 shadow-md bg-card/45 backdrop-blur-md rounded-3xl h-full flex flex-col justify-between relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
                
                {/* Banner de paso 1 completado con éxito */}
                <div className="bg-green-500/10 border-b border-green-500/20 px-6 py-3.5 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-green-600 dark:text-green-400">¡Paso 1 Completado!</p>
                      <p className="text-[10px] text-muted-foreground">Tu billetera está vinculada.</p>
                    </div>
                  </div>
                  <Link href="/relics">
                    <Button size="xs" variant="outline" className="text-[10px] font-bold border-green-500/20 text-green-500 hover:bg-green-500/5 h-7 px-2.5">
                      Reclamar Reliquia #0
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    Contenido Encriptado
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Completa la secuencia académica para revelar este contrato inteligente.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 flex-1 flex flex-col justify-center items-center py-8">
                  {/* Icono de candado misterioso */}
                  <div className="bg-muted/50 border border-border/40 p-5 rounded-full w-fit mb-2 animate-pulse text-muted-foreground shadow-sm">
                    <Lock className="h-10 w-10" />
                  </div>

                  <div className="w-full max-w-md bg-muted/20 border border-border/20 p-5 rounded-2xl text-center space-y-2">
                    <h4 className="font-bold text-sm text-foreground">
                      Bóveda de Desafíos de la EAO
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      Has forjado con éxito el vínculo criptográfico del Paso 1. Los detalles del siguiente desafío están siendo estructurados por el equipo docente.
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground/80 text-center max-w-sm leading-relaxed">
                    💡 Los desafíos futuros evaluarán la creación de tokens, inyección de liquidez y swaps automáticos. Te recomendamos repasar los conceptos teóricos.
                  </p>
                </CardContent>

                <CardFooter className="bg-muted/10 border-t border-border/20 p-4 justify-center text-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <QuestionIcon className="h-4 w-4 text-primary shrink-0" />
                    Prueba en desarrollo. Se habilitará tras la liberación de la versión final.
                  </span>
                </CardFooter>
              </Card>
            )}
          </div>

        </div>

        {/* Sección de Lore y Ayuda Académica */}
        <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden group hover:shadow-xl transition-all duration-300 w-full mt-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-cyan-500"></div>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-foreground font-bold">
              <BookOpen className="h-5 w-5 text-primary" />
              La Ruta del Explorador Criptográfico
            </CardTitle>
            <CardDescription>
              Cómo la superación de desafíos on-chain forja tu reputación como desarrollador Web3.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground text-left leading-relaxed">
            <p>
              El programa académico del Diplomado de la Universidad de Santiago de Chile está estructurado para que experimentes la Web3 de forma totalmente interactiva. Al resolver tareas directamente en la blockchain, tu dirección acumula experiencia (XP), lo que te califica para reclamar insignias digitales representadas por el estándar de tokens <strong>ERC-1155</strong>.
            </p>
            <p>
              Cada insignia representa un hito de nuestra memoria universitaria y aporta habilidades pasivas a tu perfil estudiantil. Avanza paso a paso, descubre los contratos y prepárate para revelar los desafíos secretos que el laboratorio tiene reservados.
            </p>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-primary" />
              ¿Tienes dudas sobre los contratos inteligentes o la interacción? Revisa el material explicativo en la sección de <Link href="/aprender" className="text-primary hover:underline font-semibold">Aprender</Link>.
            </span>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default DesafiosPage;
