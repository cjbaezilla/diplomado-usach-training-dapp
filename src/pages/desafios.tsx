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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
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
  Compass,
  FileText,
  ListTodo,
  History,
  LockKeyhole,
  Sparkle,
  ArrowUpRight,
  Copy,
  Check
} from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { useChallengeMinter } from '@/hooks/useChallengeMinter';
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

interface Attribute {
  trait_type: string;
  value: string | number;
}

interface RelicMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Attribute[];
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

  // ID del desafío seleccionado en el panel interactivo
  const [selectedChallengeId, setSelectedChallengeId] = useState<number>(0);

  // ID de la reliquia que se está minteando
  const [mintingId, setMintingId] = useState<number | null>(null);

  // Notificaciones flotantes
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; txHash?: string } | null>(null);

  // Hook para reclamo de desafíos mediante ECDSA
  const { claimChallenge, isPending: isMintPending, isSuccess: isMintSuccess, error: mintError, txHash: mintHash } = useChallengeMinter();

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

  // Inicializar o ajustar el desafío seleccionado al cargar el progreso
  useEffect(() => {
    if (activeChallengeIndex !== undefined && activeChallengeIndex !== null) {
      setSelectedChallengeId(Math.min(activeChallengeIndex, 9));
    }
  }, [activeChallengeIndex]);

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

  // Función para determinar el estado de un desafío específico
  const getChallengeState = (id: number) => {
    if (!isConnected) return 'locked';
    const hasRelic = hasNft(id);
    const isClaimable = isCompleted(id) && !hasRelic;
    const isActive = id === activeChallengeIndex;
    
    if (hasRelic) return 'completed';
    if (isClaimable) return 'claimable';
    if (isActive) return 'active';
    return 'locked';
  };

  // Desafío seleccionado actual a mostrar en pantalla
  const selectedChallenge = useMemo(() => {
    if (challenges.length === 0) return null;
    if (selectedChallengeId >= challenges.length) return null;
    return challenges[selectedChallengeId];
  }, [challenges, selectedChallengeId]);

  // Metadatos específicos de la reliquia seleccionada cargados dinámicamente
  const [relicMetadata, setRelicMetadata] = useState<RelicMetadata | null>(null);

  // Estado para copiar la dirección del contrato NFT
  const [copiedContract, setCopiedContract] = useState(false);

  // Estado para controlar la apertura de la modal de detalles de la reliquia
  const [isRelicModalOpen, setIsRelicModalOpen] = useState(false);

  // Cargar metadatos del NFT al seleccionar un desafío
  useEffect(() => {
    if (selectedChallenge) {
      fetch(`/nft/usach/relics/${selectedChallenge.rewardRelicNft}.json`)
        .then((res) => {
          if (!res.ok) throw new Error('Error al cargar metadatos');
          return res.json();
        })
        .then((data) => setRelicMetadata(data))
        .catch((err) => {
          console.error('Error al cargar metadatos de la reliquia:', err);
          setRelicMetadata(null);
        });
    } else {
      setRelicMetadata(null);
    }
  }, [selectedChallenge]);

  // Copiar dirección de contrato al portapapeles
  const handleCopyContract = () => {
    navigator.clipboard.writeText(BASE_ERC1155_CONTRACT.address);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  // Helper para obtener atributos específicos de la reliquia
  const getTraitValue = (metadata: RelicMetadata | null, type: string) => {
    if (!metadata || !metadata.attributes) return '';
    const attr = metadata.attributes.find((a) => a.trait_type === type);
    return attr ? attr.value : '';
  };

  // Traducir factor de cumplimiento a español legible
  const getAccomplishmentLabel = (factor: string) => {
    switch (factor) {
      case 'CONEXION_BILLETERA':
        return 'Conexión de Billetera';
      case 'REGISTRO_IDENTIDAD':
        return 'Registro de Identidad';
      case 'CREACION_TOKEN_ERC20':
        return 'Creación de Token ERC-20';
      case 'MINTEO_TRANSFERENCIA_ERC20':
        return 'Acuñación y Transferencia';
      case 'SWAP_DEX':
        return 'Intercambio (Swap) en DEX';
      case 'PROVISION_LIQUIDEZ':
        return 'Provisión de Liquidez';
      case 'CREACION_POOL_DEX':
        return 'Creación de Piscina DEX';
      case 'INTERACCION_WETH':
        return 'Envoltura de Ether (WETH)';
      case 'VER_HISTORIAL_TRANSACCIONES':
        return 'Consulta de Transacciones';
      case 'INTERACCION_FAUCET':
        return 'Reclamo de Faucet';
      default:
        return factor;
    }
  };

  // Obtener estilos de color basados en la rareza (Clase de Item)
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendario':
        return {
          text: 'text-amber-500 dark:text-amber-400',
          bg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
        };
      case 'épico':
        return {
          text: 'text-purple-500 dark:text-purple-400',
          bg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300',
        };
      case 'raro':
        return {
          text: 'text-blue-500 dark:text-blue-400',
          bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
        };
      default:
        return {
          text: 'text-slate-500 dark:text-slate-400',
          bg: 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
        };
    }
  };

  // Determinar si el desafío seleccionado es reclamable
  const isSelectedChallengeClaimable = useMemo(() => {
    if (selectedChallengeId >= challenges.length) return false;
    return isCompleted(selectedChallengeId) && !hasNft(selectedChallengeId);
  }, [selectedChallengeId, challenges, isCompleted, hasNft]);

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

  // Handler para iniciar el reclamo de la reliquia mediante firmas ECDSA
  const handleClaimReward = async (id: number) => {
    if (!address) return;
    setMintingId(id);
    
    try {
      // 1. Obtener la firma y el salt del backend local
      const response = await fetch('/api/challenge/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          id: id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener la firma del servidor.');
      }

      const data = await response.json();
      const { salt, signature } = data;

      // 2. Ejecutar la transacción en la blockchain
      claimChallenge(BigInt(id), salt, signature);
    } catch (err: any) {
      console.error('Error en el reclamo de la reliquia:', err);
      setNotification({
        type: 'error',
        message: `Error al solicitar firma o transacción: ${err.message || 'Error desconocido'}`
      });
      setMintingId(null);
    }
  };

  // Formateador pedagógico de descripción de markdown básico
  const renderDescription = (text: string) => {
    if (!text) return null;

    // 1. Procesador en línea para dar formato a negritas, itálicas, código y fórmulas matemáticas en línea.
    const renderInline = (inlineText: string) => {
      if (!inlineText) return '';
      // Expresión regular para separar: **negrita**, *itálica*, `código`, $matemática en línea$
      const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\$.*?\$)/g;
      const parts = inlineText.split(regex);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="text-foreground font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={index} className="text-muted-foreground/90 italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={index}
              className="px-1.5 py-0.5 rounded bg-muted/50 font-mono text-[11px] border border-border/40 text-foreground/90 font-medium"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return (
            <span
              key={index}
              className="font-mono bg-primary/5 text-primary px-1.5 py-0.5 rounded text-xs font-semibold border border-primary/10"
            >
              {part.slice(1, -1)}
            </span>
          );
        }
        return part;
      });
    };

    // 2. Parser a nivel de bloque
    const lines = text.split('\n');
    interface Block {
      type: 'p' | 'h2' | 'h3' | 'ul' | 'ol' | 'math';
      lines: string[];
    }
    const blocks: Block[] = [];
    let currentBlock: Block | null = null;

    const commitBlock = () => {
      if (currentBlock) {
        if (currentBlock.type === 'p' && currentBlock.lines.every(l => !l.trim())) {
          // No añadir bloques vacíos
        } else {
          blocks.push(currentBlock);
        }
        currentBlock = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detectar fin o inicio de bloque matemático de bloque $$
      if (trimmed.startsWith('$$')) {
        commitBlock();
        if (trimmed.endsWith('$$') && trimmed.length > 2) {
          blocks.push({
            type: 'math',
            lines: [trimmed.slice(2, -2).trim()],
          });
        } else {
          const mathLines: string[] = [];
          i++; // avanzar a la siguiente línea
          while (i < lines.length && !lines[i].trim().startsWith('$$')) {
            mathLines.push(lines[i]);
            i++;
          }
          blocks.push({
            type: 'math',
            lines: [mathLines.join('\n').trim()],
          });
        }
        continue;
      }

      // Título H3
      if (trimmed.startsWith('###')) {
        commitBlock();
        blocks.push({
          type: 'h3',
          lines: [trimmed.slice(3).trim()],
        });
        continue;
      }

      // Título H2
      if (trimmed.startsWith('##')) {
        commitBlock();
        blocks.push({
          type: 'h2',
          lines: [trimmed.slice(2).trim()],
        });
        continue;
      }

      // Listas No Ordenadas (comienzan con - o *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemContent = trimmed.slice(2).trim();
        if (currentBlock && currentBlock.type === 'ul') {
          currentBlock.lines.push(itemContent);
        } else {
          commitBlock();
          currentBlock = {
            type: 'ul',
            lines: [itemContent],
          };
        }
        continue;
      }

      // Listas Ordenadas (comienzan con número y punto, ej: 1. o 2.)
      const matchOl = line.match(/^\s*(\d+)\.\s(.*)/);
      if (matchOl) {
        const itemContent = matchOl[2].trim();
        if (currentBlock && currentBlock.type === 'ol') {
          currentBlock.lines.push(itemContent);
        } else {
          commitBlock();
          currentBlock = {
            type: 'ol',
            lines: [itemContent],
          };
        }
        continue;
      }

      // Línea vacía
      if (trimmed === '') {
        commitBlock();
        continue;
      }

      // De lo contrario, tratar como párrafo continuo
      if (currentBlock && currentBlock.type === 'p') {
        currentBlock.lines.push(line);
      } else {
        commitBlock();
        currentBlock = {
          type: 'p',
          lines: [line],
        };
      }
    }
    commitBlock();

    // 3. Renderizar los bloques agrupados a JSX
    return blocks.map((block, i) => {
      switch (block.type) {
        case 'h3':
          return (
            <h3
              key={i}
              className="text-base font-bold text-foreground mt-5 mb-2 border-b border-border/10 pb-1 flex items-center gap-1.5"
            >
              <Info className="h-4 w-4 text-primary shrink-0" />
              {renderInline(block.lines[0])}
            </h3>
          );
        case 'h2':
          return (
            <h2
              key={i}
              className="text-lg font-bold text-foreground mt-6 mb-2 flex items-center gap-2"
            >
              <Compass className="h-5 w-5 text-primary shrink-0" />
              {renderInline(block.lines[0])}
            </h2>
          );
        case 'ul':
          return (
            <ul key={i} className="list-disc pl-5 space-y-1.5 my-3">
              {block.lines.map((item, j) => (
                <li key={j} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        case 'ol':
          return (
            <ol key={i} className="list-decimal pl-5 space-y-1.5 my-3">
              {block.lines.map((item, j) => (
                <li key={j} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        case 'math':
          return (
            <div
              key={i}
              className="my-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center font-mono text-sm font-semibold text-primary overflow-x-auto"
            >
              {block.lines.join('\n')}
            </div>
          );
        case 'p':
        default:
          return (
            <p key={i} className="text-xs sm:text-sm text-muted-foreground leading-relaxed my-2.5">
              {renderInline(block.lines.join(' '))}
            </p>
          );
      }
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
            <p className="text-sm text-muted-foreground font-medium">Sincronizando progreso académico on-chain...</p>
          </div>
        ) : activeChallengeIndex >= challenges.length && challenges.length > 0 ? (
          /* ================= PANTALLA: SENDAS COMPLETADAS TOTALMENTE ================= */
          <div className="w-full space-y-8 animate-in fade-in-50 duration-500 text-left flex-1 flex flex-col justify-center">
            <div className="w-full p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-card/45 backdrop-blur-md shadow-2xl relative overflow-hidden space-y-6 flex flex-col justify-between">
              {/* Barra de color dorada superior */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Columna Izquierda: Mensaje y Logro */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl w-fit text-amber-500 shadow-md">
                    <Sparkles className="h-10 w-10 animate-bounce" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">
                      ¡Maestro Forjador de la USACH!
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      Has superado con éxito la totalidad de la senda criptográfica académica. Demostraste destreza e ingenio
                      resolviendo pruebas de identidad digital soberana, contratos ERC-20, interacciones AMM en el DEX y envolturas WETH.
                      ¡Tu reputación criptográfica ha quedado forjada de forma inmutable en el ledger!
                    </p>
                  </div>

                  {/* Tabla de Resumen de Logros */}
                  <div className="border border-border/20 bg-muted/10 p-5 rounded-2xl space-y-4">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Award className="h-5 w-5 text-amber-500" />
                      Certificación de Mérito Criptográfico
                    </h3>
                    <ul className="space-y-2.5 text-xs text-muted-foreground">
                      <li className="flex justify-between border-b border-border/10 pb-1.5">
                        <span>Rango Académico:</span>
                        <span className="font-bold text-foreground">
                          Nivel 10 (Maestro Forjador EAO)
                        </span>
                      </li>
                      <li className="flex justify-between border-b border-border/10 pb-1.5">
                        <span>Reliquias Criptográficas en Billetera:</span>
                        <span className="font-bold text-foreground">10 / 10 Coleccionadas</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Experiencia Acumulada (XP):</span>
                        <span className="font-bold text-primary">300 XP Totales</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href={`/estudiante/${address}`}>
                      <Button variant="default" className="font-bold text-sm bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white border-none shadow-md">
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

                {/* Columna Derecha: Vitrina del Logro Completo */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full border border-amber-500/20 bg-muted/20 p-6 rounded-2xl flex flex-col items-center gap-4 relative overflow-hidden group shadow-md text-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent"></div>
                    
                    <div className="h-40 w-40 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center relative shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <Trophy className="h-20 w-20 text-amber-500" />
                    </div>

                    <div className="space-y-1">
                      <Badge className="bg-amber-500/20 text-amber-400 border-none font-bold text-[10px]">
                        Senda de la EAO Forjada
                      </Badge>
                      <h4 className="font-extrabold text-sm text-foreground">
                        Insignia del Alumno Distinguido
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Desbloquea el honor y reconocimiento perpetuo del Patio de Talleres.
                      </p>
                    </div>

                    {/* Cuadrícula de Reliquias */}
                    <div className="grid grid-cols-5 gap-1.5 pt-2">
                      {challenges.map((c) => (
                        <div key={c.id} className="h-7 w-7 rounded border border-border/50 overflow-hidden bg-background/80" title={c.relicName}>
                          <img src={`/nft/usach/relics/${c.rewardRelicNft}.png`} alt={`Reliquia ${c.id}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : selectedChallenge ? (
          /* ================= LAYOUT DE DASHBOARD INTERACTIVO ================= */
          <div className="w-full flex-1 flex flex-col lg:flex-row gap-6 items-stretch animate-in fade-in-50 duration-500">
            {/* Panel lateral izquierdo: Selector de Desafíos */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-4 lg:self-start">
              <div className="bg-card/45 backdrop-blur-md rounded-2xl border border-border/80 p-4 flex flex-col gap-3 h-fit">
                <div className="flex items-center justify-between border-b border-border/10 pb-2">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-primary" />
                    Senda Académica
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-bold">
                    {isConnected ? `${challenges.filter((_, idx) => hasNft(idx)).length} / 10` : '0 / 10'} completados
                  </span>
                </div>
                
                {/* Contenedor de scroll horizontal en móviles, lista vertical en lg */}
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-thin select-none">
                  {challenges.map((c, idx) => {
                    const state = getChallengeState(idx);
                    const isSel = idx === selectedChallengeId;
                    
                    let stateIcon = <Lock className="h-3.5 w-3.5 text-muted-foreground/30" />;
                    let stateBadgeColor = "bg-muted text-muted-foreground border-border/30";
                    let stateText = "Bloqueado";
                    let itemBorder = "border-border/20";
                    let itemBg = "bg-transparent";
                    let titleColor = "text-muted-foreground/60";

                    if (state === 'completed') {
                      stateIcon = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
                      stateBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                      stateText = "Completado";
                      titleColor = "text-emerald-500/90 font-medium";
                    } else if (state === 'claimable') {
                      stateIcon = <Award className="h-3.5 w-3.5 text-amber-500" />;
                      stateBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                      stateText = "Reclamar";
                      itemBorder = "border-amber-500/30";
                      titleColor = "text-amber-500 font-semibold";
                    } else if (state === 'active') {
                      stateIcon = <Unlock className="h-3.5 w-3.5 text-primary" />;
                      stateBadgeColor = "bg-primary/10 text-primary border-primary/20";
                      stateText = "Activo";
                      itemBorder = "border-primary/40";
                      titleColor = "text-foreground font-bold";
                    }

                    if (isSel) {
                      itemBg = "bg-primary/10 dark:bg-primary/5";
                      itemBorder = state === 'completed' ? "border-emerald-500" : state === 'claimable' ? "border-amber-500" : state === 'active' ? "border-primary" : "border-muted-foreground";
                    }

                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedChallengeId(c.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 min-w-[220px] lg:min-w-0 w-full shrink-0 group ${itemBg} ${itemBorder} hover:bg-muted/10`}
                      >
                        {/* Número grande */}
                        <div className={`h-8 w-8 rounded-lg font-mono font-black text-xs flex items-center justify-center border shrink-0 ${
                          isSel ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border/40"
                        }`}>
                          {c.id + 1}
                        </div>
                        
                        {/* Título y Badge */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className={`text-xs truncate ${titleColor} group-hover:text-foreground transition-colors`}>
                            {c.title}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border ${stateBadgeColor}`}>
                              {stateText}
                            </span>
                            <span className="text-[8px] text-muted-foreground/80 font-mono">
                              +{c.xp} XP
                            </span>
                          </div>
                        </div>

                        {/* Icono de estado */}
                        <div className="flex shrink-0">
                          {stateIcon}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panel principal de detalles */}
            <div className={`flex-1 flex flex-col bg-card/45 backdrop-blur-md rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden text-left relative ${
              getChallengeState(selectedChallenge.id) === 'completed' 
                ? 'border-emerald-500/20 hover:border-emerald-500/30' 
                : getChallengeState(selectedChallenge.id) === 'claimable' 
                  ? 'border-amber-500/30 hover:border-amber-500/50' 
                  : getChallengeState(selectedChallenge.id) === 'active' 
                    ? 'border-primary/30 hover:border-primary/50' 
                    : 'border-border/60'
            }`}>
              {/* Luz LED decorativa de estado */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                getChallengeState(selectedChallenge.id) === 'completed' 
                  ? 'from-emerald-500 to-green-400' 
                  : getChallengeState(selectedChallenge.id) === 'claimable' 
                    ? 'from-amber-500 to-yellow-400' 
                    : getChallengeState(selectedChallenge.id) === 'active' 
                      ? 'from-primary to-indigo-500' 
                      : 'from-muted-foreground/30 to-muted/20'
              }`}></div>

              {/* Cuerpo en Grid Interno */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 flex-1 items-stretch pt-8">
                {/* Subcolumna Pedagógica (Tabs) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  {/* Cabecera del Desafío Integrada */}
                  <div className="space-y-3 pb-4 border-b border-border/10 pt-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className="font-mono text-[9px] uppercase tracking-wider bg-primary/15 border-primary/25 text-primary">
                          Desafío #0{selectedChallenge.id + 1}
                        </Badge>
                        <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyBadgeColor(selectedChallenge.difficulty)}`}>
                          {selectedChallenge.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] font-mono font-semibold text-muted-foreground border-border/40">
                          {selectedChallenge.category}
                        </Badge>
                      </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-tight">
                      {selectedChallenge.title}
                    </h2>
                  </div>

                  <Tabs defaultValue="teoria" className="w-full flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-3 w-full bg-muted/30 border border-border/20 p-1 rounded-xl">
                      <TabsTrigger value="teoria" className="text-xs py-1.5 flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card cursor-pointer">
                        <BookOpen className="h-3.5 w-3.5 shrink-0" />
                        Teoría
                      </TabsTrigger>
                      <TabsTrigger value="pistas" className="text-xs py-1.5 flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card cursor-pointer">
                        <ListTodo className="h-3.5 w-3.5 shrink-0" />
                        Guía de Misión
                      </TabsTrigger>
                      <TabsTrigger value="lore" className="text-xs py-1.5 flex items-center gap-1.5 rounded-lg data-[state=active]:bg-card cursor-pointer">
                        <History className="h-3.5 w-3.5 shrink-0" />
                        Tradición EAO
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-4 flex-1 flex flex-col justify-between">
                      {/* Contenido de la pestaña Teoría */}
                      <TabsContent value="teoria" className="focus-visible:outline-none flex-1">
                        <div className="prose prose-sm dark:prose-invert">
                          {renderDescription(selectedChallenge.description)}
                        </div>
                      </TabsContent>

                      {/* Contenido de la pestaña Guía de Misión */}
                      <TabsContent value="pistas" className="focus-visible:outline-none flex-1">
                        {getChallengeState(selectedChallenge.id) === 'locked' ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center bg-muted/15 border border-border/10 rounded-2xl p-6 h-full">
                            <LockKeyhole className="h-8 w-8 text-muted-foreground/35 mb-2" />
                            <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Detalles Encriptados</h4>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                              Debes forjar los desafíos previos para descifrar las pistas de resolución de esta prueba.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
                            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-start gap-2">
                              <Zap className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold text-foreground">Instrucciones de Escritura:</p>
                                <p className="text-xs text-muted-foreground leading-normal mt-0.5">
                                  Realiza la acción descrita para validar el cumplimiento del desafío en tu perfil.
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {selectedChallenge.hints.map((hint, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-muted/20 p-3 rounded-xl border border-border/10 transition-all hover:bg-muted/30">
                                  <span className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono font-extrabold flex items-center justify-center text-[10px] shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    {hint}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Contenido de la pestaña Tradición EAO */}
                      <TabsContent value="lore" className="focus-visible:outline-none flex-1">
                        <div className="bg-muted/10 border border-border/10 p-5 rounded-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                            <BookOpen className="h-24 w-24" />
                          </div>
                          <div className="space-y-3 relative z-10">
                            <h4 className="font-bold text-xs uppercase tracking-widest text-primary flex items-center gap-1.5">
                              <History className="h-4 w-4 shrink-0" />
                              El Legado Industrial
                            </h4>
                            <p className="text-xs text-muted-foreground/95 italic leading-relaxed">
                              "En la antigua Escuela de Artes y Oficios (EAO) de la USACH, los artesanos y técnicos no revelaban las técnicas de fundición avanzada o forja de calderas hasta que el aprendiz demostraba maestría impecable en la manipulación básica del metal y el control térmico. Cada paso en el taller era evaluado rigurosamente por los maestros antes de avanzar al siguiente oficio."
                            </p>
                            <p className="text-[10px] text-muted-foreground/75 font-medium border-t border-border/10 pt-2 flex items-center gap-1">
                              <span>📍 Campus Histórico USACH - Patio de Talleres</span>
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between gap-6 bg-muted/15 border border-border/20 pt-4 pb-5 px-5 rounded-2xl relative overflow-hidden">
                  {/* Fondo decorativo con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/5 to-transparent pointer-events-none"></div>

                  {/* Grupo superior: Cabecera y Vitrina */}
                  <div className="flex flex-col gap-2 relative z-10 w-full">
                    {/* Cabecera de la Recompensa */}
                    <div className="flex items-center justify-between border-b border-border/10 pb-2">
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Recompensa Académica
                      </h3>

                      {/* Badge de Estado del Desafío */}
                      <div className="shrink-0 flex items-center">
                        {(() => {
                          const state = getChallengeState(selectedChallenge.id);
                          if (state === 'completed') {
                            return (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold text-[10px] shadow-[0_0_6px_rgba(16,185,129,0.08)]">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                ADQUIRIDA
                              </div>
                            );
                          }
                          if (state === 'claimable') {
                            return (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold text-[10px] shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                                <Award className="h-3 w-3 text-amber-500" />
                                LISTA
                              </div>
                            );
                          }
                          if (state === 'active') {
                            return (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold text-[10px] shadow-[0_0_6px_rgba(249,115,22,0.08)]">
                                <Unlock className="h-3 w-3 text-primary" />
                                ACTIVA
                              </div>
                            );
                          }
                          return (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-border/60 bg-muted/10 text-muted-foreground/60 font-bold text-[10px]">
                              <Lock className="h-3 w-3 text-muted-foreground/40" />
                              SELLADA
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* 1. Vitrina de la Reliquia */}
                    <div className="flex flex-col items-start text-left gap-2.5 pt-0.5 pb-2">
                      {/* Visual del NFT */}
                      {getChallengeState(selectedChallenge.id) === 'locked' ? (
                        /* NFT Bloqueado */
                        <div className="h-72 w-72 sm:h-80 sm:w-80 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 flex flex-col items-center justify-center text-muted-foreground/35 relative shadow-inner">
                          <LockKeyhole className="h-14 w-14 shrink-0 mb-2" />
                          <span className="text-xs font-mono">RELIQUIA OCULTA</span>
                        </div>
                      ) : (
                        /* NFT Desbloqueado/Completado */
                        <div 
                          onClick={() => relicMetadata && setIsRelicModalOpen(true)}
                          className="h-72 w-72 sm:h-80 sm:w-80 rounded-2xl border border-border/85 overflow-hidden shadow-2xl relative cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 group/nft"
                          title="Click para ver detalles de la reliquia"
                        >
                          {/* Resplandor decorativo */}
                          <div className={`absolute inset-0 opacity-15 bg-gradient-to-tr ${
                            getChallengeState(selectedChallenge.id) === 'completed'
                              ? 'from-emerald-500 to-green-500'
                              : 'from-amber-500 to-yellow-500'
                          }`}></div>
                          
                          <img 
                            src={`/nft/usach/relics/${selectedChallenge.rewardRelicNft}.png`} 
                            alt={selectedChallenge.relicName} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/nft:scale-105" 
                          />

                          {/* Etiquetas superpuestas (Overlay Labels) - Esquina inferior derecha alineadas verticalmente */}
                          <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1.5 z-10">
                            {/* 1. Reliquia # */}
                            <div className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 text-white font-mono text-xs font-bold">
                              Relic #{selectedChallenge.rewardRelicNft}
                            </div>

                            {/* 2. XP */}
                            <div className="px-2 py-0.5 rounded bg-primary/95 backdrop-blur-md border border-primary/30 text-primary-foreground font-mono text-xs font-black">
                              +{selectedChallenge.xp} XP
                            </div>

                            {/* 3. Clase de Item */}
                            {relicMetadata && (
                              <div className={`px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-black uppercase tracking-wider ${
                                getRarityColor(String(getTraitValue(relicMetadata, 'Clase de Item'))).text
                              }`}>
                                {String(getTraitValue(relicMetadata, 'Clase de Item'))}
                              </div>
                            )}

                            {/* 4. Edición */}
                            {relicMetadata && (
                              <div className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 text-white text-[11px] font-semibold">
                                {String(getTraitValue(relicMetadata, 'Edición'))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Lore y Buff de la Reliquia */}
                      {getChallengeState(selectedChallenge.id) !== 'locked' ? (
                        <div className="space-y-3 w-full">
                          <div className="space-y-1 text-left">
                            <h4 className="font-extrabold text-sm text-foreground px-0 whitespace-normal break-words" title={selectedChallenge.relicName}>
                              {selectedChallenge.relicName}
                            </h4>
                            <p className="text-[10px] text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/15 py-1 px-2.5 rounded-lg w-fit flex items-center gap-1 shadow-sm">
                              <Sparkle className="h-3 w-3 text-emerald-400" />
                              Buff: {selectedChallenge.relicBuff}
                            </p>
                          </div>

                          {/* Cuadrícula de Atributos Históricos (Metadata) */}
                          <div className="grid grid-cols-2 gap-2 w-full text-left pt-2">
                            <div className="p-2.5 rounded-xl bg-card/60 border border-border/30 text-center flex flex-col justify-center shadow-sm">
                              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Clase de Item</span>
                              <span className={`text-[10px] font-black mt-0.5 ${
                                getRarityColor(relicMetadata ? String(getTraitValue(relicMetadata, 'Clase de Item')) : 'Común').text
                              }`}>
                                {relicMetadata ? String(getTraitValue(relicMetadata, 'Clase de Item')) : 'Cargando...'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-card/60 border border-border/30 text-center flex flex-col justify-center shadow-sm">
                              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Año de Origen</span>
                              <span className="text-[10px] font-bold text-foreground mt-0.5">
                                {relicMetadata ? String(getTraitValue(relicMetadata, 'Año de Origen')) : 'Cargando...'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-card/60 border border-border/30 text-center flex flex-col justify-center col-span-2 shadow-sm">
                              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Taller de Origen</span>
                              <span className="text-[10px] font-semibold text-foreground truncate mt-0.5" title={relicMetadata ? String(getTraitValue(relicMetadata, 'Taller de Origen')) : ''}>
                                {relicMetadata ? String(getTraitValue(relicMetadata, 'Taller de Origen')) : 'Cargando...'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-card/60 border border-border/30 text-center flex flex-col justify-center shadow-sm">
                              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Cuna Histórica</span>
                              <span className="text-[10px] font-semibold text-foreground truncate mt-0.5" title={relicMetadata ? String(getTraitValue(relicMetadata, 'Cuna Histórica')) : ''}>
                                {relicMetadata ? String(getTraitValue(relicMetadata, 'Cuna Histórica')) : 'Cargando...'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-card/60 border border-border/30 text-center flex flex-col justify-center shadow-sm">
                              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Edición</span>
                              <span className="text-[10px] font-bold text-primary mt-0.5">
                                {relicMetadata ? String(getTraitValue(relicMetadata, 'Edición')) : 'Cargando...'}
                              </span>
                            </div>
                          </div>

                          {/* Ficha Técnica del Token */}
                          <div className="space-y-2 w-full text-xs border-t border-border/10 pt-3.5 text-left">
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span>Contrato NFT:</span>
                              <div className="flex items-center gap-1 bg-muted/30 px-1.5 py-0.5 rounded border border-border/30">
                                <span className="font-mono text-[9px] text-foreground">
                                  {BASE_ERC1155_CONTRACT.address.slice(0, 6)}...{BASE_ERC1155_CONTRACT.address.slice(-4)}
                                </span>
                                <button 
                                  onClick={handleCopyContract} 
                                  className="p-0.5 hover:bg-muted-foreground/10 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  title="Copiar dirección de contrato"
                                >
                                  {copiedContract ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span>Estándar de Token:</span>
                              <span className="font-semibold text-foreground bg-primary/5 px-2 py-0.5 rounded border border-primary/10 text-[9px]">
                                ERC-1155 Multi-Token
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span>Requisito On-Chain:</span>
                              <span className="font-semibold text-foreground text-[10px]">
                                {getAccomplishmentLabel(selectedChallenge.accomplishmentFactor)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span>Recompensa de XP:</span>
                              <span className="font-bold text-primary font-mono text-[10px]">
                                +{selectedChallenge.xp} XP
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span>Tiempo Estimado:</span>
                              <span className="font-medium text-foreground text-[10px]">
                                {selectedChallenge.estimatedTime}
                              </span>
                            </div>

                            {relicMetadata && (
                              <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1.5 border-t border-border/10">
                                <span>Detalle Completo:</span>
                                <button
                                  onClick={() => setIsRelicModalOpen(true)}
                                  className="font-semibold text-primary hover:underline hover:text-primary/80 flex items-center gap-0.5 cursor-pointer"
                                >
                                  Ver Ficha
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 w-full">
                          <div className="space-y-1.5 text-left">
                            <h4 className="font-extrabold text-xs text-muted-foreground/75 italic">
                              Insignia Encriptada
                            </h4>
                            <p className="text-[10px] text-muted-foreground/60 max-w-[200px] leading-normal">
                              El efecto pasivo y la representación de la insignia se revelarán al forjar este nivel.
                            </p>
                          </div>

                          {/* Cuadrícula de Atributos Bloqueada/Difuminada */}
                          <div className="grid grid-cols-2 gap-2 w-full text-left pt-2 relative overflow-hidden select-none">
                            <div className="p-2.5 rounded-xl bg-card/25 border border-border/10 text-center flex flex-col justify-center filter blur-[2px] opacity-40">
                              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Clase de Item</span>
                              <span className="text-[10px] font-black mt-0.5 text-muted-foreground">Bloqueado</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-card/25 border border-border/10 text-center flex flex-col justify-center filter blur-[2px] opacity-40">
                              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Año de Origen</span>
                              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">Bloqueado</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-card/25 border border-border/10 text-center flex flex-col justify-center col-span-2 filter blur-[2px] opacity-40">
                              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Taller de Origen</span>
                              <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">Bloqueado</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-card/25 border border-border/10 text-center flex flex-col justify-center filter blur-[2px] opacity-40">
                              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Cuna Histórica</span>
                              <span className="text-[10px] font-semibold text-muted-foreground mt-0.5">Bloqueado</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-card/25 border border-border/10 text-center flex flex-col justify-center filter blur-[2px] opacity-40">
                              <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Edición</span>
                              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">Bloqueado</span>
                            </div>

                            {/* Overlay decorativo de candado */}
                            <div className="absolute inset-0 flex items-center justify-center bg-background/5 backdrop-blur-[1.5px] rounded-xl pointer-events-none">
                              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/95 border border-border/40 shadow-lg text-[9px] font-bold uppercase tracking-wider text-muted-foreground/90">
                                <Lock className="h-3 w-3 text-muted-foreground/70" />
                                Atributos Encriptados
                              </div>
                            </div>
                          </div>

                          {/* Ficha Técnica Bloqueada */}
                          <div className="space-y-2 w-full text-xs border-t border-border/10 pt-3.5 text-left relative overflow-hidden select-none">
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground filter blur-[1px] opacity-40">
                              <span>Contrato NFT:</span>
                              <span className="font-mono text-[9px] bg-muted/40 px-1.5 py-0.5 rounded border border-border/40">
                                0x0000...0000
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground filter blur-[1px] opacity-40">
                              <span>Estándar de Token:</span>
                              <span className="font-semibold text-foreground bg-primary/5 px-2 py-0.5 rounded border border-primary/10 text-[9px]">
                                ERC-1155 Multi-Token
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span>Requisito On-Chain:</span>
                              <span className="font-semibold text-muted-foreground/80 text-[10px]">
                                {getAccomplishmentLabel(selectedChallenge.accomplishmentFactor)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span>Recompensa de XP:</span>
                              <span className="font-bold text-primary/70 font-mono text-[10px]">
                                +{selectedChallenge.xp} XP
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span>Tiempo Estimado:</span>
                              <span className="font-medium text-muted-foreground/80 text-[10px]">
                                {selectedChallenge.estimatedTime}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Control Interactivo / Panel de Acciones */}
                  <div className="relative z-10 w-full pt-4 border-t border-border/10">
                    {(() => {
                      const state = getChallengeState(selectedChallenge.id);

                      // CASO: NO CONECTADO
                      if (!isConnected) {
                        return (
                          <div className="space-y-3 text-center">
                            <p className="text-[11px] text-muted-foreground leading-normal max-w-[260px] mx-auto">
                              Conecta tu cliente Web3 para auditar tu progreso y reclamar los logros del curso.
                            </p>
                            <div className="flex justify-center">
                              <ConnectButton label="Vincular Billetera Web3" />
                            </div>
                          </div>
                        );
                      }

                      // CASO: COMPLETADO (YA POSEE EL NFT)
                      if (state === 'completed') {
                        return (
                          <div className="space-y-3 text-center">
                            <p className="text-[11px] text-emerald-400 font-medium leading-normal bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                              ✓ Logro certificado inmutablemente on-chain. Esta reliquia pertenece a tu billetera.
                            </p>
                            <a
                              href={`${explorerUrl}/address/${BASE_ERC1155_CONTRACT.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full block"
                            >
                              <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1.5 border-border/60 hover:bg-muted/80 cursor-pointer">
                                Explorar Contrato NFT
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          </div>
                        );
                      }

                      // CASO: LISTO PARA RECLAMAR (ACUÑAR NFT)
                      if (state === 'claimable') {
                        return (
                          <div className="space-y-3">
                            <p className="text-[10px] text-muted-foreground leading-normal text-center">
                              Firma la transacción de acuñación en la blockchain para registrar el NFT en tu inventario.
                            </p>
                            <Button 
                              onClick={() => handleClaimReward(selectedChallenge.id)}
                              disabled={mintingId !== null}
                              className="w-full text-xs font-black bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {mintingId !== null ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                                  Acuñando en la red...
                                </>
                              ) : (
                                <>
                                  <Award className="h-4 w-4 shrink-0" />
                                  Acuñar Reliquia NFT
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      }

                      // CASO: ACTIVO (PENDIENTE DE ACCIÓN)
                      if (state === 'active') {
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center gap-1.5 bg-background/60 p-2.5 rounded-xl border border-border/10 text-left">
                              <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                              <span className="text-[10px] font-bold text-foreground line-clamp-2">
                                Misión: {selectedChallenge.actionLabel}
                              </span>
                            </div>
                            <Link href={selectedChallenge.actionUrl} className="w-full block">
                              <Button className="w-full text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-xl cursor-pointer">
                                Ejecutar Acción Académica
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        );
                      }

                      // CASO: BLOQUEADO (DESAFÍOS FUTUROS)
                      return (
                        <div className="space-y-2 text-center py-2">
                          <p className="text-[11px] text-muted-foreground/60 max-w-[240px] mx-auto leading-normal font-medium">
                            Los mecanismos de acción de esta fase están bloqueados hasta que completes las misiones anteriores.
                          </p>
                          <div className="flex justify-center w-full">
                            <Button 
                              disabled 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-xs gap-1.5 text-muted-foreground/40 border border-dashed border-border/40 bg-muted/5"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              Fase no disponible
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {/* Modal / Dialog de Detalles de la Reliquia */}
        <Dialog open={isRelicModalOpen} onOpenChange={(open) => !open && setIsRelicModalOpen(false)}>
          {selectedChallenge && relicMetadata && (
            <DialogContent className="max-w-md md:max-w-4xl bg-card border border-border/80 shadow-2xl p-0 overflow-hidden text-left rounded-2xl w-[94%] transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-12 w-full h-full items-stretch">

                {/* Lateral izquierdo: Imagen de la Reliquia */}
                <div className="md:col-span-5 relative w-full min-h-[220px] md:min-h-[460px] overflow-hidden bg-muted/40 flex">
                  <img
                    src={`/nft/usach/relics/${selectedChallenge.rewardRelicNft}.png`}
                    alt={relicMetadata.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradiente sutil para acoplar la imagen en móvil vs desktop */}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Rarity & XP overlay sobre la imagen */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Badge className={`text-xs px-2 py-1 font-bold uppercase rounded-md border-none ${getRarityColor(String(getTraitValue(relicMetadata, 'Clase de Item') || 'Común')).bg}`}>
                      {String(getTraitValue(relicMetadata, 'Clase de Item') || 'Común')}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-background/95 font-bold border-border/40 px-2 py-1">
                      +{selectedChallenge.xp} XP
                    </Badge>
                  </div>
                </div>

                {/* Lateral derecho: Información detallada */}
                <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <DialogHeader className="gap-1">
                      <DialogTitle className="text-xl sm:text-2xl font-black text-foreground leading-tight">
                        {relicMetadata.name}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                        ID de Token: {selectedChallenge.rewardRelicNft}
                      </DialogDescription>
                    </DialogHeader>

                    {/* Lore / Historia */}
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">
                        Historia y Lore Universitario
                      </h5>
                      <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-muted/20 border border-border/20 p-4 rounded-xl max-h-[170px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
                        {relicMetadata.description.split('\n').map((para, i) => (
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
                        {relicMetadata.attributes.map((attr, index) => {
                          if (attr.trait_type === 'Clase de Item' || attr.trait_type === 'Experiencia') return null;
                          const isBuff = attr.trait_type === 'Efecto Pasivo';
                          return (
                            <div
                              key={index}
                              className={`p-2 rounded-lg border border-border/30 bg-muted/10 flex flex-col gap-0.5 ${isBuff ? 'col-span-2 sm:col-span-3 border-emerald-500/20 bg-emerald-500/5' : ''
                                }`}
                            >
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase">{attr.trait_type}</span>
                              <span className={`text-xs font-bold ${isBuff ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground/90'
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
                      href={relicMetadata.external_url}
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
                      onClick={() => setIsRelicModalOpen(false)}
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

      <Footer />
    </div>
  );
};

export default DesafiosPage;
