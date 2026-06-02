import React, { useState, useEffect, useMemo } from 'react';
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
  BookOpen,
  AlertCircle,
  Loader2,
  ChevronRight,
  Info,
  ExternalLink,
  Compass
} from 'lucide-react';
import { useBaseERC1155 } from '@/hooks/useBaseERC1155';
import { useChallenges } from '@/hooks/useChallenges';
import { BASE_ERC1155_CONTRACT } from '@/contracts';

interface Challenge {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  difficultyColor?: string;
  xp: number;
  estimatedTime: string;
  rewardRelicNft: number;
  relicName: string;
  relicBuff: string;
  accomplishmentFactor: string;
  actionLabel: string;
  actionUrl: string;
  description: string;
  hints: string[];
}

const DesafiosPage: NextPage = () => {
  const isHydrated = useHydrated();
  const { isConnected, address, chain } = useAccount();
  const { 
    isCompleted, 
    hasNft, 
    activeChallengeIndex, 
    isLoading: isLoadingBalances, 
    refetch: refetchBalances 
  } = useChallenges();
  const explorerUrl = chain?.blockExplorers?.default?.url || 'https://sepolia.etherscan.io';

  // Carga de desafíos desde desafios.json
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);

  // ID de la reliquia que se está minteando
  const [mintingId, setMintingId] = useState<number | null>(null);

  // Notificaciones flotantes
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; txHash?: string } | null>(null);

  // Hook para minteo de reliquias
  const { mint, isPending: isMintPending, isSuccess: isMintSuccess, error: mintError, txHash: mintHash } = useBaseERC1155(BASE_ERC1155_CONTRACT.address);

  // Cargar desafíos en el montaje
  useEffect(() => {
    fetch('/desafios.json')
      .then((res) => res.json())
      .then((data) => {
        setChallenges(data);
        setIsLoadingChallenges(false);
      })
      .catch((err) => {
        console.error('Error al cargar desafios.json:', err);
        setIsLoadingChallenges(false);
      });
  }, []);

  // Las reliquias on-chain se consultan de manera centralizada en el hook useChallenges

  // Manejar el éxito del minteo de reliquias
  useEffect(() => {
    if (isMintSuccess && mintingId !== null) {
      setNotification({
        type: 'success',
        message: `¡Reliquia #${mintingId} reclamada y acuñada con éxito en la blockchain!`,
        txHash: mintHash
      });
      // Refrescar balances para actualizar la interfaz
      refetchBalances();
      setMintingId(null);
    }
  }, [isMintSuccess, mintingId, mintHash, refetchBalances]);

  // Manejar errores de transacción
  useEffect(() => {
    if (mintError) {
      setNotification({
        type: 'error',
        message: `Error al reclamar la reliquia: ${mintError.message || 'Transacción rechazada o fallida.'}`
      });
      setMintingId(null);
    }
  }, [mintError]);

  // Cerrar notificaciones automáticamente
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // El índice del desafío activo actual se calcula de manera centralizada en el hook useChallenges

  // Desafío activo actual a mostrar en pantalla
  const activeChallenge = useMemo(() => {
    if (challenges.length === 0) return null;
    if (activeChallengeIndex >= challenges.length) return null; // Todo completado
    return challenges[activeChallengeIndex];
  }, [challenges, activeChallengeIndex]);

  // Determinar si el desafío activo ya se completó en el cliente y está listo para ser reclamado
  const isActiveChallengeClaimable = useMemo(() => {
    if (activeChallengeIndex >= challenges.length) return false;
    return isCompleted(activeChallengeIndex);
  }, [activeChallengeIndex, challenges, isCompleted]);

  // Handler para iniciar el reclamo de la reliquia
  const handleClaimReward = async (id: number) => {
    if (!address) return;
    setMintingId(id);
    mint(address, BigInt(id), 1n, '0x');
  };

  // Formateador pedagógico de descripción de markdown básico
  const renderDescription = (text: string) => {
    if (!text) return null;
    return text.split('\n\n').map((para, i) => {
      if (para.startsWith('###')) {
        return (
          <h3 key={i} className="text-base font-bold text-foreground mt-4 mb-2 border-b border-border/10 pb-1 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-primary shrink-0" />
            {para.replace('###', '').trim()}
          </h3>
        );
      }
      if (para.startsWith('##')) {
        return (
          <h3 key={i} className="text-lg font-bold text-foreground mt-5 mb-2 flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary shrink-0" />
            {para.replace('##', '').trim()}
          </h3>
        );
      }
      if (para.startsWith('-') || para.startsWith('*')) {
        return (
          <ul key={i} className="list-disc pl-5 space-y-2 my-3">
            {para.split('\n').map((item, j) => {
              const cleanedItem = item.replace(/^[-*]/, '').trim();
              const boldParts = cleanedItem.split(/(\*\*.*?\*\*)/g);
              return (
                <li key={j} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {boldParts.map((part, k) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={k} className="text-foreground">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </li>
              );
            })}
          </ul>
        );
      }
      if (/^\d+\./.test(para.trim())) {
        return (
          <ol key={i} className="list-decimal pl-5 space-y-2 my-3">
            {para.split('\n').map((item, j) => {
              const cleanedItem = item.replace(/^\d+\./, '').trim();
              const boldParts = cleanedItem.split(/(\*\*.*?\*\*)/g);
              return (
                <li key={j} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {boldParts.map((part, k) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={k} className="text-foreground">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </li>
              );
            })}
          </ol>
        );
      }

      // Procesamiento de negritas en párrafos comunes
      const boldParts = para.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="text-xs sm:text-sm text-muted-foreground leading-relaxed my-2.5">
          {boldParts.map((part, k) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={k} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={k} className="text-muted-foreground/90 italic">{part.slice(1, -1)}</em>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  // Determinar color de badge de dificultad
  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'principiante':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'intermedio':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'avanzado':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  if (!isHydrated) {
    return null;
  }

  // Comprobar estado de carga
  const isCheckingProgress = isConnected && (isLoadingBalances || isLoadingChallenges);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <Head>
        <title>Desafíos Web3 e Identidad de Explorador - USACH</title>
        <meta
          content="Sigue tu senda de desafíos on-chain. Completa cada reto secuencial para descifrar contratos inteligentes y reclamar reliquias históricas."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Navbar />

      {/* Notificaciones flotantes */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-2xl animate-in slide-in-from-bottom duration-300 bg-card/95 backdrop-blur-md text-card-foreground border-border/80">
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            )}
            <div>
              <h4 className="font-semibold text-sm">
                {notification.type === 'success' ? 'Logro Registrado' : 'Ocurrió un error'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px] break-all leading-normal">
                {notification.message}
              </p>
              {notification.txHash && (
                <a
                  href={`${explorerUrl}/tx/${notification.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary hover:underline font-semibold"
                >
                  Ver transacción
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full p-4 sm:p-6 md:p-8 space-y-6 flex flex-col">
        {/* Encabezado Principal */}
        <PageHeader
          title="Senda de Desafíos Académicos"
          description="Supera pruebas criptográficas en la red para desbloquear el acceso a reliquias históricas y avanzar en tu rango de desarrollador. Las pruebas futuras permanecen encriptadas hasta que resuelvas la tarea actual."
          icon={Trophy}
          breadcrumbItems={[
            { label: 'Desafíos' }
          ]}
          actions={
            <Link href="/aprender">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/60 hover:bg-muted/80 text-xs font-semibold"
              >
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                Aprender
              </Button>
            </Link>
          }
        />

        {isCheckingProgress ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Sincronizando progreso académico on-chain...</p>
          </div>
        ) : activeChallengeIndex >= challenges.length && challenges.length > 0 ? (
          /* ================= PANTALLA: SENDAS COMPLETADAS TOTALMENTE ================= */
          <div className="w-full space-y-8 animate-in fade-in-50 duration-500">
            <div className="w-full p-8 rounded-3xl border border-primary/20 bg-card/45 backdrop-blur-md shadow-2xl relative overflow-hidden text-center max-w-4xl mx-auto space-y-6">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-primary to-cyan-500"></div>
              
              <div className="mx-auto bg-amber-500/10 border border-amber-500/30 p-5 rounded-full w-fit animate-bounce text-amber-500 shadow-md">
                <Sparkles className="h-12 w-12" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                  ¡Maestro Forjador de la USACH!
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Has superado exitosamente todos los desafíos de la senda criptográfica, demostrando destreza en
                  identidad soberana, estándares ERC-20, provisión de liquidez en el AMM y auditoría Web3.
                  ¡Tu reputación profesional reside inmutablemente en el ledger!
                </p>
              </div>

              <div className="border border-border/20 bg-muted/10 p-5 rounded-2xl max-w-lg mx-auto text-left space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Award className="h-5 w-5 text-amber-500" />
                  Resumen de Logros Académicos
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex justify-between border-b border-border/10 pb-1.5">
                    <span>Nivel de Desarrollador:</span>
                    <span className="font-bold text-foreground">Nivel 10 (Maestro)</span>
                  </li>
                  <li className="flex justify-between border-b border-border/10 pb-1.5">
                    <span>Reliquias Coleccionadas:</span>
                    <span className="font-bold text-foreground">10 / 10 Reliquias</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Experiencia Criptográfica Acumulada:</span>
                    <span className="font-bold text-primary">300 XP</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Link href={`/estudiante/${address}`}>
                  <Button variant="default" className="font-bold text-sm">
                    Ver Mi Perfil Público
                  </Button>
                </Link>
                <Link href="/relics">
                  <Button variant="outline" className="font-bold text-sm border-border/60">
                    Galería de Reliquias
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : activeChallenge ? (
          /* ================= LAYOUT DE DOS COLUMNAS PARA EL DESAFÍO ACTIVO ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full animate-in fade-in-50 duration-500 flex-1">
            
            {/* COLUMNA IZQUIERDA: SIDEBAR INFORMATIVO (5 de 12 columnas) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/65 text-card-foreground shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:border-primary/20 text-left">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-cyan-500"></div>

              <div className="space-y-4">
                {/* Categoría y Número */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full w-fit block animate-pulse">
                    Desafío #0{activeChallenge.id + 1}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {activeChallenge.category}
                  </span>
                </div>

                {/* Título Grande */}
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                  {activeChallenge.title}
                </h2>

                {/* Recompensa y Dificultad */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Badge variant="secondary" className="font-bold text-[11px] bg-muted/80 px-2 py-0.5 flex items-center gap-1 text-foreground border border-border/30">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    +{activeChallenge.xp} XP Recompensa
                  </Badge>
                  <Badge className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyBadgeColor(activeChallenge.difficulty)}`}>
                    {activeChallenge.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] font-mono font-semibold text-muted-foreground border-border/40">
                    ⏱️ {activeChallenge.estimatedTime}
                  </Badge>
                </div>

                {/* Descripción Pedagógica Formateada */}
                <div className="pt-2 max-h-[350px] lg:max-h-[500px] overflow-y-auto pr-1">
                  {renderDescription(activeChallenge.description)}
                </div>
              </div>

              {/* Lore Histórico al pie */}
              <div className="pt-4 mt-6 border-t border-border/10 text-[11px] text-muted-foreground/80 leading-relaxed space-y-1.5">
                <div className="flex items-start gap-2 bg-muted/20 p-2.5 rounded-xl border border-border/10">
                  <BookOpen className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Tradición del Forjador:</strong> En la antigua Escuela de Artes y Oficios (EAO), los alumnos avanzaban un peldaño técnico a la vez, demostrando maestría en cada taller antes de revelar el secreto del siguiente oficio.
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: CONTENIDO INTERACTIVO (7 de 12 columnas) */}
            <div className="lg:col-span-7 flex flex-col justify-center w-full">
              {!isConnected ? (
                /* ================= SUB-PANTALLA: BILLETERA NO CONECTADA ================= */
                <Card className="border border-primary/20 shadow-md bg-card/45 backdrop-blur-md rounded-2xl h-full flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-primary/40 text-left">
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
                        <div className="h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center border border-border/60 shadow-sm shrink-0 overflow-hidden relative">
                          <img src="/nft/usach/relics/0.png" alt="Reliquia 0" className="h-full w-full object-cover" />
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
              ) : isActiveChallengeClaimable ? (
                /* ================= SUB-PANTALLA: RECLAMAR RECOMPENSA (LOGRADO LOCALMENTE) ================= */
                <Card className="border border-green-500/30 shadow-lg bg-card/45 backdrop-blur-md rounded-2xl h-full flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-green-500/50 text-left">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500 animate-pulse"></div>
                  
                  <div className="bg-green-500/10 border-b border-green-500/20 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-green-400">¡Desafío Superado!</p>
                        <p className="text-[10px] text-muted-foreground">Logro verificado en el cliente local.</p>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                      Reclamar Recompensa Académica
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Acuña tu Reliquia NFT inmutable en la blockchain como prueba de tu logro.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6 flex-1 flex flex-col justify-center items-center py-6">
                    {/* Visual de la Reliquia NFT */}
                    <div className="w-full max-w-sm border border-emerald-500/20 bg-muted/20 p-4 rounded-2xl flex flex-col items-center gap-4 relative overflow-hidden group shadow-md">
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent"></div>
                      
                      {/* Imagen NFT real de public */}
                      <div className="h-32 w-32 rounded-xl border border-border/80 overflow-hidden shadow-lg relative group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={`/nft/usach/relics/${activeChallenge.rewardRelicNft}.png`} 
                          alt={activeChallenge.relicName} 
                          className="h-full w-full object-cover" 
                        />
                      </div>

                      <div className="text-center space-y-1">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-bold text-[10px]">
                          Reliquia #{activeChallenge.rewardRelicNft}
                        </Badge>
                        <h4 className="font-extrabold text-sm text-foreground line-clamp-1">
                          {activeChallenge.relicName}
                        </h4>
                        <p className="text-xs text-emerald-400 font-medium">
                          ✨ {activeChallenge.relicBuff}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center max-w-sm leading-relaxed">
                      Haz clic en el botón de abajo para interactuar con el contrato `BaseERC1155.sol` y acuñar tu insignia. Esto requiere aprobar una transacción rápida en tu billetera.
                    </p>

                    <div className="flex justify-center w-full max-w-sm">
                      <Button 
                        onClick={() => handleClaimReward(activeChallenge.id)}
                        disabled={mintingId !== null}
                        className="w-full font-bold text-sm bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        {mintingId !== null ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1.5 shrink-0" />
                            Acuñando en la red...
                          </>
                        ) : (
                          <>
                            <Award className="h-4.5 w-4.5 mr-1.5 shrink-0" />
                            Acuñar Reliquia NFT
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/10 border-t border-border/20 p-4 justify-center text-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                      Requiere una fracción mínima de gas en Sepolia para el almacenamiento on-chain.
                    </span>
                  </CardFooter>
                </Card>
              ) : (
                /* ================= SUB-PANTALLA: DESAFÍO EN PENDIENTE / BLOQUEADO LOCALMENTE ================= */
                <Card className="border border-border/80 shadow-md bg-card/45 backdrop-blur-md rounded-2xl h-full flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-primary/20 text-left">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-primary"></div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <Lock className="h-5 w-5 text-amber-500" />
                      Instrucciones del Desafío
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Completa la siguiente tarea académica para certificar tu progreso.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5 flex-1 flex flex-col justify-center py-6">
                    {/* Caja Informativa de Acción */}
                    <div className="bg-muted/30 border border-border/30 p-4 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        Pendiente de Completación
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">
                        Para superar este desafío, realiza la siguiente acción en el aplicativo:
                      </p>
                      <div className="flex items-center gap-2 mt-2 bg-background/50 p-2.5 rounded-lg border border-border/10">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs font-bold text-foreground">
                          {activeChallenge.actionLabel}
                        </span>
                      </div>
                    </div>

                    {/* Lista de Pistas / Checklist */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pistas y Recomendaciones:</h4>
                      <div className="space-y-2">
                        {activeChallenge.hints.map((hint, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <span className="h-4.5 w-4.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{hint}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center pt-2">
                      <Link href={activeChallenge.actionUrl} className="w-full">
                        <Button className="w-full font-bold text-sm gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground">
                          {activeChallenge.actionLabel}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/10 border-t border-border/20 p-4 justify-center text-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                      Una vez completada la acción en la página indicada, regresa aquí para reclamar tu reliquia.
                    </span>
                  </CardFooter>
                </Card>
              )}
            </div>

          </div>
        ) : null}

        {/* ================= SECCIÓN: RESUMEN DE PROGRESO DE LA RUTA COMPLETA ================= */}
        {challenges.length > 0 && (
          <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden group transition-all duration-300 w-full mt-4 text-left">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-cyan-500"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Trophy className="h-5 w-5 text-primary" />
                Mapa de la Senda Criptográfica ({activeChallengeIndex} / {challenges.length} Completado)
              </CardTitle>
              <CardDescription className="text-xs">
                Visualiza el camino completo de tu aprendizaje. Los desafíos ya resueltos otorgan reliquias en verde, mientras que los futuros permanecen bloqueados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Grid de Desafíos */}
              <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
                {challenges.map((c, idx) => {
                  const hasRelic = hasNft(idx);
                  const isActive = isConnected && idx === activeChallengeIndex;
                  const isClaimable = isConnected && idx === activeChallengeIndex && isCompleted(idx);
                  
                  let borderClass = 'border-border/30 bg-muted/5';
                  let textClass = 'text-muted-foreground/60';
                  let icon = <Lock className="h-4 w-4 text-muted-foreground/40" />;

                  if (hasRelic) {
                    borderClass = 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_8px_rgba(16,185,129,0.1)]';
                    textClass = 'text-emerald-400 font-bold';
                    icon = <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
                  } else if (isClaimable) {
                    borderClass = 'border-green-500 bg-green-500/10 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.2)]';
                    textClass = 'text-green-400 font-bold';
                    icon = <Award className="h-4 w-4 text-green-400" />;
                  } else if (isActive) {
                    borderClass = 'border-primary bg-primary/10 shadow-[0_0_12px_rgba(249,115,22,0.15)]';
                    textClass = 'text-primary font-bold';
                    icon = <Unlock className="h-4 w-4 text-primary animate-pulse" />;
                  }

                  return (
                    <div 
                      key={c.id} 
                      className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center gap-2 transition-all duration-200 ${borderClass}`}
                      title={c.title}
                    >
                      <span className={`text-[10px] font-mono ${textClass}`}>
                        Paso {c.id + 1}
                      </span>
                      
                      {/* Imagen miniatura del NFT o Candado */}
                      <div className="h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center bg-background/50 border border-border/10 relative">
                        {hasRelic || isClaimable ? (
                          <img src={`/nft/usach/relics/${c.rewardRelicNft}.png`} alt={`Insignia ${c.id}`} className="h-full w-full object-cover" />
                        ) : (
                          icon
                        )}
                      </div>

                      <span className="text-[9px] font-medium text-muted-foreground truncate w-full" title={c.title}>
                        {c.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DesafiosPage;
