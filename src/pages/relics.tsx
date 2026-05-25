import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import { useAccount, useReadContract } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { UserAvatar } from '@/components/UserAvatar';
import { useStudentProfile } from '@/hooks/useStudentIdentity';
import { useBaseERC1155 } from '@/hooks/useBaseERC1155';
import { useHydrated } from '@/hooks/useHydrated';
import { BASE_ERC1155_CONTRACT } from '@/contracts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Trophy,
  Award,
  Zap,
  Lock,
  Unlock,
  ExternalLink,
  Loader2,
  Mail,
  Sparkles,
  ShieldCheck,
  UserCheck,
  ArrowUpRight
} from 'lucide-react';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

interface Attribute {
  trait_type: string;
  value: string | number;
}

interface RelicMetadata {
  id: number;
  name: string;
  description: string;
  image: string;
  localImage: string;
  external_url: string;
  attributes: Attribute[];
}

interface RelicsPageProps {
  relics: RelicMetadata[];
}

export async function getStaticProps() {
  const relicsDir = path.join(process.cwd(), 'public', 'nft', 'usach', 'relics');
  const relics: RelicMetadata[] = [];

  for (let i = 0; i < 10; i++) {
    const filePath = path.join(relicsDir, `${i}.json`);
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        data.id = i;
        data.localImage = `/nft/usach/relics/${i}.png`;
        relics.push(data);
      }
    } catch (e) {
      console.error(`Error al leer metadatos de reliquia ${i}:`, e);
    }
  }

  return {
    props: {
      relics,
    },
  };
}

const RelicsPage: NextPage<RelicsPageProps> = ({ relics }) => {
  const isHydrated = useHydrated();
  const { isConnected, address } = useAccount();
  const { profile, isLoading: isLoadingProfile } = useStudentProfile(address);

  // Consultar balances en lote (balanceOfBatch) para el usuario conectado
  const { data: balances, refetch: refetchBalances, isLoading: isLoadingBalances } = useReadContract({
    ...BASE_ERC1155_CONTRACT,
    functionName: 'balanceOfBatch',
    args: address && relics.length > 0 ? [
      Array(relics.length).fill(address),
      relics.map(r => BigInt(r.id))
    ] : undefined,
    query: {
      enabled: isHydrated && !!address && relics.length > 0,
    }
  });

  const ownedBalances = balances ? (balances as bigint[]) : Array(relics.length).fill(0n);

  // Hook para mintear reliquias
  const { mint, isPending: isMintPending, isSuccess: isMintSuccess, error: mintError } = useBaseERC1155(BASE_ERC1155_CONTRACT.address);
  const [mintingId, setMintingId] = useState<number | null>(null);

  // Estado para el modal de detalle
  const [selectedRelic, setSelectedRelic] = useState<RelicMetadata | null>(null);

  // Refrescar balances cuando la transacción de mint tenga éxito
  useEffect(() => {
    if (isMintSuccess && mintingId !== null) {
      refetchBalances();
      setMintingId(null);
    }
  }, [isMintSuccess]);

  // Si hay error en la transacción, liberar el ID de minteo
  useEffect(() => {
    if (mintError) {
      setMintingId(null);
    }
  }, [mintError]);

  const handleMint = (id: number) => {
    if (!address) return;
    setMintingId(id);
    mint(address, BigInt(id), 1n, '0x');
  };

  // Helper para obtener atributos de una reliquia
  const getTraitValue = (relic: RelicMetadata, type: string) => {
    const attr = relic.attributes.find(a => a.trait_type === type);
    return attr ? attr.value : '';
  };

  const getXP = (relic: RelicMetadata) => {
    const val = getTraitValue(relic, 'Experiencia');
    return typeof val === 'number' ? val : 0;
  };

  const getRarity = (relic: RelicMetadata): string => {
    return String(getTraitValue(relic, 'Clase de Item') || 'Común');
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendario':
        return {
          border: 'border-amber-500/80 shadow-amber-500/20 dark:shadow-amber-500/10',
          text: 'text-amber-500 dark:text-amber-400',
          bg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          gradient: 'from-amber-500/5 to-amber-950/10'
        };
      case 'épico':
        return {
          border: 'border-purple-500/80 shadow-purple-500/20 dark:shadow-purple-500/10',
          text: 'text-purple-500 dark:text-purple-400',
          bg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300',
          glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]',
          gradient: 'from-purple-500/5 to-purple-950/10'
        };
      case 'raro':
        return {
          border: 'border-blue-500/80 shadow-blue-500/20 dark:shadow-blue-500/10',
          text: 'text-blue-500 dark:text-blue-400',
          bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
          gradient: 'from-blue-500/5 to-blue-950/10'
        };
      default:
        return {
          border: 'border-slate-500/80 shadow-slate-500/10 dark:shadow-slate-500/5',
          text: 'text-slate-500 dark:text-slate-400',
          bg: 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
          glow: '',
          gradient: 'from-slate-500/5 to-slate-950/5'
        };
    }
  };

  // Estadísticas del Estudiante
  let totalXP = 0;
  const unlockedRelics = relics.filter((relic, idx) => {
    const isUnlocked = ownedBalances[idx] > 0n;
    if (isUnlocked) {
      totalXP += getXP(relic);
    }
    return isUnlocked;
  });

  const unlockedCount = unlockedRelics.length;
  const level = Math.floor(totalXP / 100) + 1;
  const xpInCurrentLevel = totalXP % 100;
  const xpToNextLevel = 100;
  const levelProgress = (xpInCurrentLevel / xpToNextLevel) * 100;

  // Coleccionar Buffs activos
  const activeBuffs = unlockedRelics.map(relic => {
    const buff = getTraitValue(relic, 'Efecto Pasivo');
    return buff ? {
      relicName: relic.name.split(':')[1]?.trim() || relic.name,
      effect: String(buff),
      rarity: getRarity(relic)
    } : null;
  }).filter(Boolean) as { relicName: string; effect: string; rarity: string }[];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <Head>
        <title>Reliquias Históricas USACH - Web3 dApp</title>
        <meta
          content="Colecciona las reliquias e insignias de la Escuela de Artes y Oficios (EAO) y acumula experiencia y ventajas pasivas en la blockchain."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Navbar />

      <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 space-y-6 w-full">
        {/* Encabezado Principal */}
        <div className="flex flex-col gap-2 border-b border-border/30 pb-6 text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sistema de Gamificación Educativa</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-foreground via-foreground/90 to-cyan-500 bg-clip-text text-transparent">
            Reliquias y Logros Académicos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-4xl">
            Descubre e interactúa con la rica historia de la Escuela de Artes y Oficios (EAO) y la Universidad de Santiago de Chile. Colecciona insignias históricas representadas por tokens ERC-1155, sube de nivel estudiantil y activa ventajas pasivas basadas en nuestro lore universitario.
          </p>
        </div>

        {/* Diseño General en Dos Columnas (Sidebar Estudiante + Cuadrícula de Reliquias) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          
          {/* Columna Izquierda: Tarjeta del Estudiante & Estadísticas (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            
            {/* Tarjeta de Perfil Estudiantil */}
            <div className="w-full p-5 rounded-2xl border border-border/80 bg-card/65 text-card-foreground shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-cyan-500"></div>
              
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-primary" />
                Estudiante Web3
              </h2>

              {!isHydrated ? (
                <div className="space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-muted size-16"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : !isConnected ? (
                <div className="text-center py-6 space-y-3">
                  <div className="rounded-full bg-muted/65 p-3 w-fit mx-auto text-muted-foreground">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-sm">Billetera Desconectada</h3>
                  <p className="text-xs text-muted-foreground">
                    Conecta tu billetera en la parte superior para visualizar tu perfil y consultar tus reliquias desbloqueadas.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Datos del Perfil */}
                  <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border/30">
                    <UserAvatar address={address} className="size-16 border-2 border-primary/20 shadow-sm" />
                    
                    <div className="flex-1 min-w-0">
                      {profile?.isRegistered ? (
                        <>
                          <h3 className="font-bold text-base truncate text-foreground flex items-center gap-1.5">
                            {profile.name}
                            <UserCheck className="h-4 w-4 text-green-500 shrink-0" />
                          </h3>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <Mail className="h-3 w-3 shrink-0" />
                            {profile.email}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-base text-muted-foreground italic">Estudiante Invitado</h3>
                          <p className="text-xs text-primary font-medium">Perfil no registrado</p>
                        </>
                      )}
                      
                      <p className="text-[10px] font-mono text-muted-foreground break-all mt-1 bg-background/50 p-1.5 rounded border border-border/20">
                        {address}
                      </p>
                    </div>
                  </div>

                  {/* Redes Sociales si está Registrado */}
                  {profile?.isRegistered && (profile.linkedin || profile.twitter) && (
                    <div className="flex gap-2">
                      {profile.linkedin && (
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/40 px-2 py-1 rounded-md transition-colors w-full justify-center"
                        >
                          <LinkedinIcon className="h-3.5 w-3.5" />
                          <span>LinkedIn</span>
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        </a>
                      )}
                      {profile.twitter && (
                        <a
                          href={profile.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/40 px-2 py-1 rounded-md transition-colors w-full justify-center"
                        >
                          <TwitterIcon className="h-3.5 w-3.5" />
                          <span>Twitter</span>
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Si no está registrado, botón para registrarse */}
                  {!profile?.isRegistered && !isLoadingProfile && (
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        ¡Aún no registras tu identidad estudiantil en la blockchain! Crea tu perfil académico para vincular tu reputación Web3.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
                        onClick={() => window.location.href = '/identity'}
                      >
                        Registrar Identidad
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Estadísticas de Nivel y Progreso */}
            {isHydrated && isConnected && (
              <div className="w-full p-5 rounded-2xl border border-border/80 bg-card/65 text-card-foreground shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>

                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Progreso y Rango
                </h2>

                <div className="space-y-4">
                  {/* Fila Nivel y XP */}
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rango Estudiantil</p>
                      <p className="text-2xl font-extrabold text-foreground flex items-center gap-1.5">
                        Nivel {level}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({unlockedCount} / {relics.length} insignias)
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Experiencia Total</p>
                      <p className="text-xl font-bold text-primary">{totalXP} XP</p>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progreso al Nivel {level + 1}</span>
                      <span>{xpInCurrentLevel} / {xpToNextLevel} XP</span>
                    </div>
                    <Progress value={levelProgress} className="h-2.5 bg-muted/80" />
                  </div>

                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    💡 Cada reliquia te otorga puntos de experiencia (XP) al reclamarse en la blockchain. ¡Obtén 100 XP para avanzar al siguiente nivel!
                  </p>
                </div>
              </div>
            )}

            {/* Ventajas Activas (Buffs) */}
            {isHydrated && isConnected && (
              <div className="w-full p-5 rounded-2xl border border-border/80 bg-card/65 text-card-foreground shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  Efectos Pasivos Activos ({activeBuffs.length})
                </h2>

                <div className="space-y-3">
                  {activeBuffs.length === 0 ? (
                    <div className="text-center py-4 bg-muted/20 border border-border/20 rounded-xl">
                      <p className="text-xs text-muted-foreground">No tienes efectos activos.</p>
                      <p className="text-[10px] text-muted-foreground/80 mt-1">Reclama tu primera reliquia para activar sus ventajas pasivas.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                      {activeBuffs.map((buff, idx) => {
                        const style = getRarityColor(buff.rarity);
                        return (
                          <div key={idx} className="p-2.5 rounded-xl border border-border/40 bg-muted/20 flex flex-col gap-1 text-left text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground truncate max-w-[70%]">{buff.relicName}</span>
                              <Badge className={`text-[9px] px-1.5 py-0.5 rounded-full ${style.bg} border-none font-semibold shrink-0`}>
                                {buff.rarity}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 p-1.5 rounded-lg">
                              ✨ {buff.effect}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Cuadrícula de Reliquias (lg:col-span-8) */}
          <div className="lg:col-span-8 w-full flex flex-col gap-4">
            
            {/* Cabecera de Cuadrícula */}
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Catálogo de Reliquias
              </h3>
              {isHydrated && isConnected && isLoadingBalances && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span>Sincronizando...</span>
                </div>
              )}
            </div>

            {/* Grid de Reliquias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
              {relics.map((relic, idx) => {
                const isUnlocked = isHydrated && isConnected && ownedBalances[idx] > 0n;
                const isMinting = mintingId === relic.id;
                const rarity = getRarity(relic);
                const colors = getRarityColor(rarity);

                return (
                  <div
                    key={relic.id}
                    className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden bg-card/45 shadow-sm text-left group/card relative ${
                      isUnlocked
                        ? `${colors.border} ${colors.glow} hover:shadow-md hover:-translate-y-0.5`
                        : 'border-border/40 hover:border-border/80'
                    }`}
                  >
                    {/* Imagen de la Reliquia */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted/40 border-b border-border/20">
                      <img
                        src={relic.localImage}
                        alt={relic.name}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover/card:scale-105 ${
                          isUnlocked ? '' : 'filter grayscale contrast-125 brightness-95 opacity-55'
                        }`}
                      />
                      
                      {/* Estado Lock/Unlock */}
                      <div className="absolute top-2.5 right-2.5">
                        {isUnlocked ? (
                          <div className={`p-1.5 rounded-full bg-background/90 text-green-500 shadow-sm border border-green-500/20`}>
                            <Unlock className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-full bg-background/90 text-muted-foreground shadow-sm border border-border/20">
                            <Lock className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Rarity & XP Badge */}
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                        <Badge className={`text-[9px] px-1.5 py-0.5 font-bold uppercase rounded-md border-none ${colors.bg}`}>
                          {rarity}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] bg-background/90 font-bold border-border/40">
                          +{getXP(relic)} XP
                        </Badge>
                      </div>
                    </div>

                    {/* Contenido de la Tarjeta */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover/card:text-primary transition-colors">
                          {relic.name.split(':')[1]?.trim() || relic.name}
                        </h4>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                          {relic.description}
                        </p>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-2 items-center w-full pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs w-full py-1.5 h-auto text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted/40"
                          onClick={() => setSelectedRelic(relic)}
                        >
                          Ver Detalles
                        </Button>

                        {isHydrated && isConnected && !isUnlocked && (
                          <Button
                            size="sm"
                            disabled={isMinting || isMintPending}
                            className="text-xs w-full py-1.5 h-auto font-semibold"
                            onClick={() => handleMint(relic.id)}
                          >
                            {isMinting ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Reclamando
                              </>
                            ) : (
                              'Reclamar'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal / Dialog de Detalles de la Reliquia */}
        <Dialog open={selectedRelic !== null} onOpenChange={(open) => !open && setSelectedRelic(null)}>
          {selectedRelic && (
            <DialogContent className="max-w-md md:max-w-4xl bg-card border border-border/80 shadow-2xl p-0 overflow-hidden text-left rounded-2xl w-[94%] transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-12 w-full h-full items-stretch">
                
                {/* Lateral izquierdo: Imagen de la Reliquia */}
                <div className="md:col-span-5 relative w-full min-h-[220px] md:min-h-[460px] overflow-hidden bg-muted/40 flex">
                  <img
                    src={selectedRelic.localImage}
                    alt={selectedRelic.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradiente sutil para acoplar la imagen en móvil vs desktop */}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Rarity & XP overlay sobre la imagen */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Badge className={`text-xs px-2 py-1 font-bold uppercase rounded-md border-none ${getRarityColor(getRarity(selectedRelic)).bg}`}>
                      {getRarity(selectedRelic)}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-background/95 font-bold border-border/40 px-2 py-1">
                      +{getXP(selectedRelic)} XP
                    </Badge>
                  </div>
                </div>

                {/* Lateral derecho: Información detallada */}
                <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <DialogHeader className="gap-1">
                      <DialogTitle className="text-xl sm:text-2xl font-black text-foreground leading-tight">
                        {selectedRelic.name}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                        ID de Token: {selectedRelic.id}
                      </DialogDescription>
                    </DialogHeader>

                    {/* Lore / Historia */}
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                        Historia y Lore Universitario
                      </h5>
                      <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-muted/20 border border-border/20 p-4 rounded-xl max-h-[170px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
                        {selectedRelic.description.split('\n').map((para, i) => (
                          <p key={i} className="mb-2 last:mb-0">
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Atributos / Grid de Atributos */}
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                        Atributos y Propiedades
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
                        {selectedRelic.attributes.map((attr, index) => {
                          if (attr.trait_type === 'Clase de Item' || attr.trait_type === 'Experiencia') return null;
                          const isBuff = attr.trait_type === 'Efecto Pasivo';
                          return (
                            <div
                              key={index}
                              className={`p-2 rounded-lg border border-border/30 bg-muted/10 flex flex-col gap-0.5 ${
                                isBuff ? 'col-span-2 sm:col-span-3 border-emerald-500/20 bg-emerald-500/5' : ''
                              }`}
                            >
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase">{attr.trait_type}</span>
                              <span className={`text-xs font-bold ${
                                isBuff ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground/90'
                              }`}>
                                {isBuff ? `✨ ${attr.value}` : attr.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer del Modal */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center border-t border-border/20 pt-4 mt-2">
                    <a
                      href={selectedRelic.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline self-start sm:self-center"
                    >
                      <span>Ver en Archivo Patrimonial USACH</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    <Button
                      variant="outline"
                      className="w-full sm:w-auto text-xs"
                      onClick={() => setSelectedRelic(null)}
                    >
                      Cerrar Detalle
                    </Button>
                  </div>
                </div>

              </div>
            </DialogContent>
          )}
        </Dialog>
      </main>

      <footer className="w-full border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-muted/40 mt-auto">
        <p>Universidad de Santiago de Chile &bull; Diplomado en Tecnologías Blockchain</p>
      </footer>
    </div>
  );
};

export default RelicsPage;
