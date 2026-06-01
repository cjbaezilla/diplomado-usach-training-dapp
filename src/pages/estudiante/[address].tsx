import React, { useState, useEffect, useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { useRouter } from 'next/router';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { Navbar } from '@/components/Navbar';
import { PageHeader } from '@/components/PageHeader';
import { UserAvatar } from '@/components/UserAvatar';
import { TokenIcon } from '@/components/TokenIcon';
import { Footer } from '@/components/Footer';
import { useStudentProfile } from '@/hooks/useStudentIdentity';
import { useTokensByOwner, useAllTokens } from '@/hooks/useTokenFactory';
import { useBaseERC20, useERC20Balance } from '@/hooks/useBaseERC20';
import { useAllDEXPools, useDEXFactoryActions } from '@/hooks/useDEXFactory';
import { useDEXPool, useDEXPoolBalance } from '@/hooks/useDEXPool';
import { useHydrated } from '@/hooks/useHydrated';
import { BASE_ERC1155_CONTRACT, DEX_FACTORY_CONTRACT, DEPLOYMENT_BLOCK } from '@/contracts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Zap,
  Lock,
  Unlock,
  ExternalLink,
  Loader2,
  Mail,
  Sparkles,
  ShieldCheck,
  UserCheck,
  ArrowUpRight,
  BookOpen,
  Code,
  Check,
  Copy,
  ArrowLeft,
  Coins,
  Layers,
  Info
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

interface StudentPageProps {
  studentAddress: `0x${string}`;
  relics: RelicMetadata[];
}

// -------------------------------------------------------------
// Componente de Fila para Mostrar Tokens del Estudiante (ERC-20)
// -------------------------------------------------------------
interface StudentTokenRowProps {
  tokenAddress: `0x${string}`;
  studentAddress: `0x${string}`;
  showIfZeroBalance?: boolean;
  onHasBalance?: (address: `0x${string}`, has: boolean) => void;
}

function StudentTokenRow({ tokenAddress, studentAddress, showIfZeroBalance = false, onHasBalance }: StudentTokenRowProps) {
  const { metadata, isLoadingMetadata } = useBaseERC20(tokenAddress);
  const { balance, isLoading: isLoadingBalance } = useERC20Balance(tokenAddress, studentAddress);

  useEffect(() => {
    if (onHasBalance && !isLoadingBalance) {
      onHasBalance(tokenAddress, balance > 0n);
    }
  }, [balance, isLoadingBalance, tokenAddress, onHasBalance]);

  if (isLoadingMetadata || isLoadingBalance) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/10 rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="space-y-1">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-2.5 w-12 bg-muted rounded" />
          </div>
        </div>
        <div className="h-4 w-12 bg-muted rounded" />
      </div>
    );
  }

  // Ocultar si el balance es cero y no se requiere mostrar obligatoriamente (por ej. si no es creador)
  if (balance === 0n && !showIfZeroBalance) {
    return null;
  }

  const formattedBalance = balance
    ? (Number(balance) / 10 ** metadata.decimals).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      })
    : '0.00';

  const formattedTotalSupply = metadata.totalSupply
    ? (Number(metadata.totalSupply) / 10 ** metadata.decimals).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })
    : '0';

  const isOwner = metadata.owner.toLowerCase() === studentAddress.toLowerCase();

  return (
    <div className="flex items-center justify-between p-3.5 bg-card/40 hover:bg-card/75 border border-border/20 rounded-xl transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <TokenIcon address={tokenAddress} className="h-8 w-8 border border-border/10" />
        <div className="min-w-0">
          <div className="font-semibold text-foreground flex items-center gap-1.5 flex-wrap text-sm">
            <span className="truncate">{metadata.name || 'Token'}</span>
            {isOwner && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-500 border border-emerald-500/20">
                Creador
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{metadata.symbol}</span>
            <span className="text-[10px] font-mono text-muted-foreground/60 hidden sm:inline" title={tokenAddress}>
              {tokenAddress.substring(0, 6)}...{tokenAddress.substring(tokenAddress.length - 4)}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono font-bold text-foreground text-sm">{formattedBalance}</div>
        <div className="text-[9px] text-muted-foreground">
          Suministro: {formattedTotalSupply}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Componente de Fila para Mostrar Pools de Liquidez (DEX LP)
// -------------------------------------------------------------
interface StudentPoolRowProps {
  poolAddress: `0x${string}`;
  studentAddress: `0x${string}`;
  onPoolActive?: (address: `0x${string}`, isActive: boolean) => void;
}

function StudentPoolRow({ poolAddress, studentAddress, onPoolActive }: StudentPoolRowProps) {
  const { token0, token1, reserve0, reserve1, totalSupply, isLoading: isLoadingPool } = useDEXPool(poolAddress);
  const { metadata: metadata0, isLoadingMetadata: isLoadingMeta0 } = useBaseERC20(token0);
  const { metadata: metadata1, isLoadingMetadata: isLoadingMeta1 } = useBaseERC20(token1);
  const { balance: lpBalance, isLoading: isLoadingLpBalance } = useDEXPoolBalance(poolAddress, studentAddress);

  const publicClient = usePublicClient();
  const [isCreator, setIsCreator] = useState(false);
  const [isLoadingCreator, setIsLoadingCreator] = useState(true);

  useEffect(() => {
    async function checkCreator() {
      if (!publicClient || !poolAddress) {
        setIsLoadingCreator(false);
        return;
      }
      try {
        const logs = await publicClient.getLogs({
          address: DEX_FACTORY_CONTRACT.address,
          event: {
            type: 'event',
            name: 'PoolCreado',
            inputs: [
              { type: 'address', name: 'token0', indexed: true },
              { type: 'address', name: 'token1', indexed: true },
              { type: 'address', name: 'pool', indexed: false },
              { type: 'uint256', name: 'cantidadPools', indexed: false }
            ]
          },
          fromBlock: DEPLOYMENT_BLOCK,
        });

        const matchingLog = logs.find(
          (log) => (log.args as any).pool?.toLowerCase() === poolAddress.toLowerCase()
        );

        if (matchingLog && matchingLog.transactionHash) {
          const tx = await publicClient.getTransaction({
            hash: matchingLog.transactionHash,
          });
          setIsCreator(tx.from.toLowerCase() === studentAddress.toLowerCase());
        }
      } catch (err) {
        console.error('Error al obtener el creador de la piscina:', err);
      } finally {
        setIsLoadingCreator(false);
      }
    }

    checkCreator();
  }, [poolAddress, publicClient, studentAddress]);

  const isActive = lpBalance > 0n || isCreator;

  useEffect(() => {
    if (onPoolActive && !isLoadingPool && !isLoadingLpBalance && !isLoadingCreator) {
      onPoolActive(poolAddress, isActive);
    }
  }, [isActive, isLoadingPool, isLoadingLpBalance, isLoadingCreator, poolAddress, onPoolActive]);

  if (isLoadingPool || isLoadingMeta0 || isLoadingMeta1 || isLoadingLpBalance || isLoadingCreator) {
    return (
      <div className="p-4 bg-muted/20 border border-border/10 rounded-xl animate-pulse flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
        <div className="h-6 w-16 bg-muted rounded" />
      </div>
    );
  }

  // Ocultar si no provee liquidez ni es el creador de la piscina
  if (!isActive) {
    return null;
  }

  const formattedReserve0 = formatUnits(reserve0, metadata0.decimals);
  const formattedReserve1 = formatUnits(reserve1, metadata1.decimals);
  const formattedLPBalance = formatUnits(lpBalance, 18);

  const participationPercentage = totalSupply > 0n
    ? ((Number(lpBalance) * 100) / Number(totalSupply)).toFixed(2)
    : '0.00';

  return (
    <div className="p-4 bg-card/40 hover:bg-card/75 border border-border/20 rounded-xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center shrink-0">
            <TokenIcon address={token0 || ''} className="h-6 w-6" />
            <TokenIcon address={token1 || ''} className="h-6 w-6 -ml-2" />
          </div>
          <span className="font-bold text-sm text-foreground">
            {metadata0.symbol || '??'} / {metadata1.symbol || '??'}
          </span>
          <div className="flex gap-1 flex-wrap">
            {isCreator && (
              <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-medium text-cyan-400 border border-cyan-500/20">
                Creador
              </span>
            )}
            {lpBalance > 0n && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400 border border-emerald-500/20">
                Proveedor
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground block truncate max-w-[240px]" title={poolAddress}>
          Pool: {poolAddress}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-6 text-xs shrink-0">
        <div>
          <span className="block text-[9px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Reservas en Pool</span>
          <span className="font-mono text-foreground block">
            {parseFloat(formattedReserve0).toLocaleString(undefined, { maximumFractionDigits: 4 })} {metadata0.symbol}
          </span>
          <span className="font-mono text-foreground block">
            {parseFloat(formattedReserve1).toLocaleString(undefined, { maximumFractionDigits: 4 })} {metadata1.symbol}
          </span>
        </div>
        <div className="sm:text-right">
          <span className="block text-[9px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Participación LP</span>
          {lpBalance > 0n ? (
            <>
              <span className="font-mono font-bold text-primary block">
                {parseFloat(formattedLPBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })} LP
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {participationPercentage}% del pool
              </span>
            </>
          ) : (
            <span className="text-muted-foreground block font-mono">Sin tokens LP</span>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Página Principal de Estudiante
// -------------------------------------------------------------
const StudentProfilePage: NextPage<StudentPageProps> = ({ studentAddress, relics }) => {
  const router = useRouter();
  const isHydrated = useHydrated();
  const { address: connectedAddress, isConnected } = useAccount();

  // Obtener Perfil del Estudiante desde la dirección de la URL
  const { profile, isLoading: isLoadingProfile } = useStudentProfile(studentAddress);

  // Obtener tokens creados por el estudiante
  const { tokens: createdTokensAddresses, isLoading: isLoadingCreatedTokens } = useTokensByOwner(studentAddress);

  // Obtener todos los tokens en la plataforma para verificar tenencias (balances > 0)
  const { tokens: allPlatformTokens, isLoading: isLoadingAllTokens } = useAllTokens();

  // Obtener todas las pools de la dApp
  const { pools: allPools, isLoading: isLoadingAllPools } = useAllDEXPools();

  // Consultar en lote las reliquias (ERC-1155) de la dirección
  const { data: batchBalances, isLoading: isLoadingRelicBalances } = useReadContract({
    ...BASE_ERC1155_CONTRACT,
    functionName: 'balanceOfBatch',
    args: studentAddress && relics.length > 0 ? [
      Array(relics.length).fill(studentAddress),
      relics.map(r => BigInt(r.id))
    ] : undefined,
    query: {
      enabled: isHydrated && !!studentAddress && relics.length > 0,
    }
  });

  // Trackear si el visitante es el dueño del perfil
  const isOwnerOfProfile = useMemo(() => {
    return isConnected && !!connectedAddress && connectedAddress.toLowerCase() === studentAddress.toLowerCase();
  }, [isConnected, connectedAddress, studentAddress]);

  // Registro de qué tokens del listado general realmente poseen balance > 0
  const [tokensWithBalance, setTokensWithBalance] = useState<Record<string, boolean>>({});

  const handleHasBalance = (tokenAddr: `0x${string}`, has: boolean) => {
    setTokensWithBalance(prev => {
      if (prev[tokenAddr] === has) return prev;
      return { ...prev, [tokenAddr]: has };
    });
  };

  // Registro de qué pools están activas (tienen balance LP o creador)
  const [activePools, setActivePools] = useState<Record<string, boolean>>({});

  const handlePoolActive = (poolAddr: `0x${string}`, isActive: boolean) => {
    setActivePools(prev => {
      if (prev[poolAddr] === isActive) return prev;
      return { ...prev, [poolAddr]: isActive };
    });
  };

  // Estado para copiar la dirección al portapapeles
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(studentAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Metadatos de reliquias y gamificación
  const ownedBalances = batchBalances ? (batchBalances as bigint[]) : Array(relics.length).fill(0n);

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

  // Filtrar reliquias desbloqueadas
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

  // Filtrar tokens de los cuales el estudiante posee balances, excluyendo los creados (para no duplicar)
  const tokenAddressesWithBalance = useMemo(() => {
    return allPlatformTokens.filter((addr) => {
      const isAlreadyCreated = createdTokensAddresses.some(created => created.toLowerCase() === addr.toLowerCase());
      return !isAlreadyCreated && !!tokensWithBalance[addr];
    });
  }, [allPlatformTokens, createdTokensAddresses, tokensWithBalance]);

  // Contar piscinas donde participa el estudiante
  const activePoolCount = useMemo(() => {
    return Object.values(activePools).filter(Boolean).length;
  }, [activePools]);

  // Si no está hidratado
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <Head>
        <title>{profile?.isRegistered ? `Perfil Estudiante: ${profile.name}` : 'Perfil Público de Estudiante'} - USACH Web3</title>
        <meta
          content="Consulta la información pública on-chain de los estudiantes del programa Web3 de la USACH, incluyendo sus reliquias, tokens y pools de liquidez."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Navbar />

      <main className="flex-1 w-full p-4 sm:p-6 md:p-8 space-y-6 flex flex-col">
        {/* Encabezado Principal Homologado */}
        <PageHeader
          title={profile?.isRegistered ? `Perfil de ${profile.name}` : 'Perfil de Estudiante'}
          description="Ficha académica y reputación Web3 del estudiante en la blockchain de entrenamiento de la Universidad de Santiago de Chile."
          icon={UserCheck}
          breadcrumbItems={[
            { label: 'Directorio' },
            { label: profile?.isRegistered ? profile.name : 'Perfil' }
          ]}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/60 hover:bg-muted/80 text-xs font-semibold"
                onClick={() => {
                  navigator.clipboard.writeText(studentAddress);
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar Wallet
              </Button>
              {isOwnerOfProfile && (
                <Link href="/identity">
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/95 text-primary-foreground"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Editar Identidad
                  </Button>
                </Link>
              )}
            </div>
          }
        />

        {/* CONTENEDOR PRINCIPAL - 2 columnas en lg, fluida sin max-w */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          
          {/* COLUMNA IZQUIERDA: IDENTIDAD & GAMIFICACIÓN (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            
            {/* Tarjeta de Identidad Digital */}
            <div className="w-full p-5 rounded-2xl border border-border/80 bg-card/65 text-card-foreground shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-cyan-500"></div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-primary" />
                  Identidad Digital Académica
                </h2>
                {isOwnerOfProfile && (
                  <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/20 text-primary font-bold">
                    Tu Perfil
                  </Badge>
                )}
              </div>

              {isLoadingProfile ? (
                <div className="space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-muted size-16"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Avatar y Datos Principales */}
                  <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border/30">
                    <UserAvatar address={studentAddress} className="size-16 border-2 border-primary/20 shadow-sm" />

                    <div className="flex-1 min-w-0 text-left">
                      {profile?.isRegistered ? (
                        <>
                          <h3 className="font-extrabold text-lg truncate text-foreground flex items-center gap-1.5">
                            {profile.name}
                            <UserCheck className="h-4 w-4 text-green-500 shrink-0" />
                          </h3>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {profile.email}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-base text-muted-foreground italic">Estudiante no registrado</h3>
                          <p className="text-xs text-amber-500 font-medium">Billetera Activa en la red</p>
                        </>
                      )}

                      {/* Dirección Ethereum copiable */}
                      <div className="flex items-center gap-1.5 mt-2 bg-background/60 p-1 px-2 rounded border border-border/20 w-fit">
                        <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                          {studentAddress}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-muted-foreground hover:text-foreground hover:bg-transparent shrink-0"
                          onClick={handleCopyAddress}
                        >
                          {copiedAddress ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Redes Sociales si está Registrado */}
                  {profile?.isRegistered && (profile.linkedin || profile.twitter) && (
                    <div className="flex gap-2">
                      {profile.linkedin && (
                        <a
                          href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
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
                          href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter}`}
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

                  {/* Invitación a registrarse si es su perfil */}
                  {!profile?.isRegistered && isOwnerOfProfile && (
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-2 text-left">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        ¡Aún no registras tu identidad estudiantil en la blockchain! Completa tu perfil académico para vincular tu reputación Web3.
                      </p>
                      <Button
                        size="sm"
                        className="w-full text-xs font-bold"
                        onClick={() => router.push('/identity')}
                      >
                        Registrar Mi Identidad
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rango Académico y Barra de Nivel */}
            <div className="w-full p-5 rounded-2xl border border-border/80 bg-card/65 text-card-foreground shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>

              <h2 className="text-sm uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 mb-4">
                <Zap className="h-4.5 w-4.5 text-yellow-500" />
                Progreso Académico
              </h2>

              <div className="space-y-4 text-left">
                {/* Nivel y XP */}
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rango Actual</p>
                    <p className="text-2xl font-black text-foreground flex items-center gap-1.5">
                      Nivel {level}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({unlockedCount} / {relics.length} Reliquias)
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Experiencia Total</p>
                    <p className="text-xl font-bold text-primary">{totalXP} XP</p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Siguiente Nivel {level + 1}</span>
                    <span>{xpInCurrentLevel} / {xpToNextLevel} XP</span>
                  </div>
                  <Progress value={levelProgress} className="h-2.5 bg-muted/80" />
                </div>
              </div>
            </div>

            {/* Efectos Pasivos Activos */}
            <div className="w-full p-5 rounded-2xl border border-border/80 bg-card/65 text-card-foreground shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

              <h2 className="text-sm uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                Efectos Pasivos ({activeBuffs.length})
              </h2>

              <div className="space-y-3">
                {activeBuffs.length === 0 ? (
                  <div className="text-center py-5 bg-muted/10 border border-border/10 rounded-xl">
                    <p className="text-xs text-muted-foreground">Sin efectos pasivos activos.</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">Reclama insignias históricas para activar bonificaciones.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {activeBuffs.map((buff, idx) => {
                      const style = getRarityColor(buff.rarity);
                      return (
                        <div key={idx} className="p-2.5 rounded-xl border border-border/40 bg-muted/15 flex flex-col gap-1 text-left text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground truncate max-w-[70%]">{buff.relicName}</span>
                            <Badge className={`text-[8px] px-1.5 py-0.5 rounded-full ${style.bg} border-none font-semibold shrink-0`}>
                              {buff.rarity}
                            </Badge>
                          </div>
                          <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 p-1.5 rounded-lg mt-1">
                            ✨ {buff.effect}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: TOKENS, POOLS & RELIQUIAS (lg:col-span-8) */}
          <div className="lg:col-span-8 w-full flex flex-col gap-6">

            {/* SECCIÓN TOKENS ERC-20 */}
            <Card className="border border-border/80 bg-card/45 backdrop-blur-md shadow-lg relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-emerald-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Coins className="h-5 w-5 text-primary" />
                  Tokens ERC-20 Creados y Saldos
                </CardTitle>
                <CardDescription>
                  Visualiza los tokens creados por el estudiante y sus balances activos en la dApp.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* 1. Tokens creados por él */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground flex items-center gap-1.5">
                    Tokens Creados ({createdTokensAddresses.length})
                  </h4>
                  {isLoadingCreatedTokens ? (
                    <div className="space-y-2">
                      <div className="h-12 bg-muted/20 border border-border/10 rounded-xl animate-pulse" />
                    </div>
                  ) : createdTokensAddresses.length === 0 ? (
                    <div className="text-center py-4 bg-muted/10 border border-border/10 border-dashed rounded-xl">
                      <p className="text-xs text-muted-foreground">Este estudiante no ha desplegado tokens propios aún.</p>
                      {isOwnerOfProfile && (
                        <Button variant="link" size="sm" className="text-xs text-primary font-semibold" onClick={() => router.push('/erc20')}>
                          Crear un token ahora
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {createdTokensAddresses.map((addr) => (
                        <StudentTokenRow
                          key={addr}
                          tokenAddress={addr}
                          studentAddress={studentAddress}
                          showIfZeroBalance={true}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Balances de otros tokens */}
                <div className="space-y-2 pt-2 border-t border-border/20">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground flex items-center gap-1.5">
                    Saldos de Otros Tokens ERC-20
                  </h4>
                  
                  {isLoadingAllTokens ? (
                    <div className="space-y-2">
                      <div className="h-12 bg-muted/20 border border-border/10 rounded-xl animate-pulse" />
                    </div>
                  ) : (
                    <>
                      {/* Componentes invisibles para cargar balances y notificar dinámicamente */}
                      <div className="hidden">
                        {allPlatformTokens.map((addr) => (
                          <StudentTokenRow
                            key={`tracker-${addr}`}
                            tokenAddress={addr}
                            studentAddress={studentAddress}
                            onHasBalance={handleHasBalance}
                          />
                        ))}
                      </div>

                      {tokenAddressesWithBalance.length === 0 ? (
                        <div className="text-center py-4 bg-muted/10 border border-border/10 border-dashed rounded-xl">
                          <p className="text-xs text-muted-foreground">No posee saldos de otros tokens en su billetera.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {tokenAddressesWithBalance.map((addr) => (
                            <StudentTokenRow
                              key={`owned-${addr}`}
                              tokenAddress={addr}
                              studentAddress={studentAddress}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SECCIÓN POOLS DE LIQUIDEZ */}
            <Card className="border border-border/80 bg-card/45 backdrop-blur-md shadow-lg relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-primary"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Layers className="h-5 w-5 text-cyan-400" />
                  Piscinas de Liquidez y Participación (LP)
                </CardTitle>
                <CardDescription>
                  Piscinas del DEX del creador de mercado (AMM) donde el estudiante provee liquidez o ha sido creador.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingAllPools ? (
                  <div className="space-y-2">
                    <div className="h-16 bg-muted/20 border border-border/10 rounded-xl animate-pulse" />
                  </div>
                ) : allPools.length === 0 ? (
                  <div className="text-center py-6 bg-muted/10 border border-border/10 border-dashed rounded-xl">
                    <p className="text-xs text-muted-foreground">No se han creado piscinas de liquidez en la plataforma aún.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3">
                      {allPools.map((poolAddr) => (
                        <StudentPoolRow
                          key={poolAddr}
                          poolAddress={poolAddr}
                          studentAddress={studentAddress}
                          onPoolActive={handlePoolActive}
                        />
                      ))}
                    </div>

                    {activePoolCount === 0 && (
                      <div className="text-center py-6 bg-muted/10 border border-border/10 border-dashed rounded-xl mt-1">
                        <p className="text-xs text-muted-foreground">Este estudiante no participa en ninguna piscina de liquidez ni es creador.</p>
                        {isOwnerOfProfile && (
                          <Button variant="link" size="sm" className="text-xs text-primary font-semibold" onClick={() => router.push('/dex')}>
                            Añadir liquidez en el DEX
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* SECCIÓN RELIQUIAS HISTÓRICAS (ERC-1155) */}
            <Card className="border border-border/80 bg-card/45 backdrop-blur-md shadow-lg relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-primary"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Award className="h-5 w-5 text-amber-500" />
                  Insignias y Reliquias EAO ({unlockedCount} / {relics.length})
                </CardTitle>
                <CardDescription>
                  Insignias patrimoniales e históricas de la Escuela de Artes y Oficios de la USACH desbloqueadas en la blockchain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRelicBalances ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="h-32 bg-muted/20 border border-border/10 rounded-xl animate-pulse" />
                    <div className="h-32 bg-muted/20 border border-border/10 rounded-xl animate-pulse" />
                    <div className="h-32 bg-muted/20 border border-border/10 rounded-xl animate-pulse" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {relics.map((relic, idx) => {
                      const isUnlocked = ownedBalances[idx] > 0n;
                      const rarity = getRarity(relic);
                      const colors = getRarityColor(rarity);

                      return (
                        <div
                          key={relic.id}
                          className={`flex flex-col rounded-xl border transition-all duration-300 overflow-hidden bg-card/30 relative text-left shadow-sm ${
                            isUnlocked 
                              ? `${colors.border} ${colors.glow} hover:-translate-y-0.5` 
                              : 'border-border/30 opacity-60'
                          }`}
                        >
                          {/* Contenedor Imagen */}
                          <div className="relative aspect-video w-full overflow-hidden bg-muted/20 border-b border-border/15">
                            <img
                              src={relic.localImage}
                              alt={relic.name}
                              className={`w-full h-full object-cover transition-all duration-500 ${
                                isUnlocked ? '' : 'filter grayscale contrast-125 brightness-75 opacity-40'
                              }`}
                            />
                            
                            {/* Lock/Unlock Badge */}
                            <div className="absolute top-2 right-2">
                              {isUnlocked ? (
                                <div className="p-1 rounded-full bg-background/90 text-green-500 border border-green-500/10 shadow-sm">
                                  <Unlock className="h-3 w-3" />
                                </div>
                              ) : (
                                <div className="p-1 rounded-full bg-background/90 text-muted-foreground border border-border/20 shadow-sm">
                                  <Lock className="h-3 w-3" />
                                </div>
                              )}
                            </div>

                            {/* Rareza & XP */}
                            <div className="absolute bottom-2 left-2 flex items-center gap-1">
                              <Badge className={`text-[8px] px-1 py-0.5 font-bold uppercase rounded border-none ${colors.bg}`}>
                                {rarity}
                              </Badge>
                              <Badge variant="outline" className="text-[8px] bg-background/90 font-bold border-border/30 text-foreground">
                                +{getXP(relic)} XP
                              </Badge>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">
                                {relic.name.split(':')[1]?.trim() || relic.name}
                              </h4>
                              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                                {relic.description}
                              </p>
                            </div>

                            {isUnlocked && getTraitValue(relic, 'Efecto Pasivo') && (
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-1 px-1.5 rounded font-medium mt-1">
                                ⚡ {getTraitValue(relic, 'Efecto Pasivo')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { address } = context.params;

  // Validar dirección de Ethereum
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return {
      notFound: true,
    };
  }

  // Leer metadatos locales de reliquias
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
      studentAddress: address.toLowerCase() as `0x${string}`,
      relics,
    },
  };
}

export default StudentProfilePage;
