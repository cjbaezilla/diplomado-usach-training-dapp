import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { useAccount, useReadContract } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { PageHeader } from '@/components/PageHeader';
import { UserAvatar } from '@/components/UserAvatar';
import { useStudentProfile } from '@/hooks/useStudentIdentity';
import { useBaseERC1155 } from '@/hooks/useBaseERC1155';
import { useHydrated } from '@/hooks/useHydrated';
import { Footer } from '@/components/Footer';
import { BASE_ERC1155_CONTRACT } from '@/contracts';
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
  ArrowUpRight,
  BookOpen,
  Code,
  HelpCircle,
  Check,
  Copy
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

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract BaseERC1155 is ERC1155, AccessControl, ERC1155Burnable, ERC1155Supply {
    using Strings for uint256;

    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address defaultAdmin, address minter)
        ERC1155("https://cbaeza.com/nft/usach/badges/")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(URI_SETTER_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    /**
     * @dev Devuelve la URI de metadatos para un token ID específico.
     * Sobrescribe la implementación de ERC1155 para concatenar dinámicamente
     * la base URI actual con el ID en decimal y el sufijo '.json'.
     */
    function uri(uint256 id)
        public
        view
        override
        returns (string memory)
    {
        string memory baseURI = super.uri(id);
        
        if (bytes(baseURI).length > 0) {
            return string(abi.encodePacked(baseURI, id.toString(), ".json"));
        }
        
        return "";
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mintBatch(to, ids, amounts, data);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`;

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

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(solidityCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        {/* Encabezado Principal Homologado */}
        <PageHeader
          title="Reliquias y Logros Académicos"
          description="Descubre e interactúa con la rica historia de la Escuela de Artes y Oficios (EAO) y la Universidad de Santiago de Chile. Colecciona insignias históricas representadas por tokens ERC-1155, sube de nivel estudiantil y activa ventajas pasivas basadas en nuestro lore universitario."
          icon={Award}
          breadcrumbItems={[
            { label: 'Reliquias / Logros' }
          ]}
          actions={
            <Link href="/ayuda">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/60 hover:bg-muted/80 text-xs font-semibold"
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                Ver Ayuda
              </Button>
            </Link>
          }
        />

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
                    className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden bg-card/45 shadow-sm text-left group/card relative ${isUnlocked
                      ? `${colors.border} ${colors.glow} hover:shadow-md hover:-translate-y-0.5`
                      : 'border-border/40 hover:border-border/80'
                      }`}
                  >
                    {/* Imagen de la Reliquia */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted/40 border-b border-border/20">
                      <img
                        src={relic.localImage}
                        alt={relic.name}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover/card:scale-105 ${isUnlocked ? '' : 'filter grayscale contrast-125 brightness-95 opacity-55'
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

        {/* Sección Educativa y Código Smart Contract - 100% de Ancho de Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-6">

          {/* Explicación Educativa ERC-1155 */}
          <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-cyan-500"></div>
            <div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Estándar Multi-Token ERC-1155
                </CardTitle>
                <CardDescription>
                  Concepto y funcionamiento del estándar multi-token e integración de metadatos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground text-left">
                <p>
                  El estándar <strong className="text-foreground font-semibold">ERC-1155</strong> es una interfaz de contrato inteligente diseñada para gestionar múltiples tipos de tokens (tanto fungibles como no fungibles) bajo una sola dirección de contrato.
                </p>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Metadatos y URI Dinámico</h4>
                  <p className="text-xs leading-relaxed">
                    Para optimizar gas, el contrato inteligente no almacena la URL completa de cada NFT. En su lugar, utiliza una URI base (por ejemplo, <code className="text-primary font-mono">https://cbaeza.com/nft/usach/badges/</code>) y sobrescribe la función <code className="text-primary font-mono">uri(uint256 id)</code> para concatenar dinámicamente el ID en decimal y el sufijo <code className="text-primary font-mono">.json</code>.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Estructura del JSON de Metadatos</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20">
                      <span className="block font-bold text-foreground font-mono">name & description</span>
                      Nombre y lore histórico de la insignia.
                    </li>
                    <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20">
                      <span className="block font-bold text-foreground font-mono">image</span>
                      Ruta o IPFS CID de la imagen del NFT.
                    </li>
                    <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20">
                      <span className="block font-bold text-foreground font-mono">attributes</span>
                      XP, clase de item y efectos pasivos (buffs).
                    </li>
                    <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20">
                      <span className="block font-bold text-foreground font-mono">external_url</span>
                      Enlace directo al archivo patrimonial.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Funciones Principales</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1">
                      <span className="font-mono text-primary font-bold shrink-0">balanceOfBatch()</span>
                      <span>Permite consultar múltiples balances en lote para ahorrar gas en llamadas RPC.</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-mono text-primary font-bold shrink-0">mint() / mintBatch()</span>
                      <span>Crea nuevos tokens individuales o en lote, restringido por roles.</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-mono text-primary font-bold shrink-0">uri()</span>
                      <span>Getter público sobreescrito para la resolución dinámica de metadatos.</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-primary" /> Permite interactuar con el patrimonio de la EAO y la USACH en Web3.
              </span>
            </CardFooter>
          </Card>

          {/* Código del Smart Contract (Solidity) */}
          <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-primary"></div>
            <div>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                    <Code className="h-5 w-5 text-primary" />
                    Contrato Inteligente (BaseERC1155.sol)
                  </CardTitle>
                  <CardDescription>
                    Código fuente en Solidity usando el estándar ERC1155 de OpenZeppelin.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border/60 hover:bg-muted/80 transition-colors"
                  onClick={handleCopyCode}
                  title="Copiar código"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="relative rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-inner">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono">
                    <span>BaseERC1155.sol</span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                      solc 0.8.35
                    </span>
                  </div>
                  <pre className="text-[10px] sm:text-[11px] font-mono p-4 overflow-x-auto leading-relaxed text-zinc-300 text-left max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                    <code>
                      <span className="text-zinc-500">// SPDX-License-Identifier: MIT</span>{"\n"}
                      <span className="text-pink-500">pragma</span> <span className="text-amber-500">solidity</span> <span className="text-blue-400">^0.8.35</span>;{"\n\n"}
                      
                      <span className="text-pink-500">import</span> {"{"}<span className="text-blue-400">AccessControl</span>{"}"} <span className="text-pink-500">from</span> <span className="text-emerald-400">"@openzeppelin/contracts/access/AccessControl.sol"</span>;{"\n"}
                      <span className="text-pink-500">import</span> {"{"}<span className="text-blue-400">ERC1155</span>{"}"} <span className="text-pink-500">from</span> <span className="text-emerald-400">"@openzeppelin/contracts/token/ERC1155/ERC1155.sol"</span>;{"\n"}
                      <span className="text-pink-500">import</span> {"{"}<span className="text-blue-400">ERC1155Burnable</span>{"}"} <span className="text-pink-500">from</span> <span className="text-emerald-400">"@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol"</span>;{"\n"}
                      <span className="text-pink-500">import</span> {"{"}<span className="text-blue-400">ERC1155Supply</span>{"}"} <span className="text-pink-500">from</span> <span className="text-emerald-400">"@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol"</span>;{"\n"}
                      <span className="text-pink-500">import</span> {"{"}<span className="text-blue-400">Strings</span>{"}"} <span className="text-pink-500">from</span> <span className="text-emerald-400">"@openzeppelin/contracts/utils/Strings.sol"</span>;{"\n\n"}

                      <span className="text-blue-500">contract</span> <span className="text-yellow-400 font-bold">BaseERC1155</span> <span className="text-pink-500">is</span> <span className="text-yellow-400">ERC1155</span>, <span className="text-yellow-400">AccessControl</span>, <span className="text-yellow-400">ERC1155Burnable</span>, <span className="text-yellow-400">ERC1155Supply</span> {"{"}{"\n"}
                      {"    "}<span className="text-pink-500">using</span> <span className="text-yellow-400">Strings</span> <span className="text-pink-500">for</span> <span className="text-blue-400">uint256</span>;{"\n\n"}
                      
                      {"    "}<span className="text-blue-400">bytes32</span> <span className="text-pink-500">public</span> <span className="text-pink-500">constant</span> URI_SETTER_ROLE = <span className="text-purple-400">keccak256</span>(<span className="text-emerald-400">"URI_SETTER_ROLE"</span>);{"\n"}
                      {"    "}<span className="text-blue-400">bytes32</span> <span className="text-pink-500">public</span> <span className="text-pink-500">constant</span> MINTER_ROLE = <span className="text-purple-400">keccak256</span>(<span className="text-emerald-400">"MINTER_ROLE"</span>);{"\n\n"}

                      {"    "}<span className="text-blue-500">constructor</span>(<span className="text-blue-400">address</span> defaultAdmin, <span className="text-blue-400">address</span> minter){"\n"}
                      {"        "}<span className="text-yellow-400">ERC1155</span>(<span className="text-emerald-400">"https://cbaeza.com/nft/usach/badges/"</span>){"\n"}
                      {"    "}{"{"}{"\n"}
                      {"        "}<span className="text-purple-400">_grantRole</span>(DEFAULT_ADMIN_ROLE, defaultAdmin);{"\n"}
                      {"        "}<span className="text-purple-400">_grantRole</span>(URI_SETTER_ROLE, defaultAdmin);{"\n"}
                      {"        "}<span className="text-purple-400">_grantRole</span>(MINTER_ROLE, minter);{"\n"}
                      {"    "}{"}"}{"\n\n"}

                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">setURI</span>(<span className="text-blue-400">string</span> <span className="text-pink-500">memory</span> newuri) <span className="text-pink-500">public</span> <span className="text-amber-500">onlyRole</span>(URI_SETTER_ROLE) {"{"}{"\n"}
                      {"        "}<span className="text-purple-400">_setURI</span>(newuri);{"\n"}
                      {"    "}{"}"}{"\n\n"}

                      {"    "}<span className="text-zinc-500">/**{"\n"}
                      {"     "}* @dev Devuelve la URI de metadatos para un token ID específico.{"\n"}
                      {"     "}* Sobrescribe la implementación de ERC1155 para concatenar dinámicamente{"\n"}
                      {"     "}* la base URI actual con el ID en decimal y el sufijo '.json'.{"\n"}
                      {"     "}*/</span>{"\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">uri</span>(<span className="text-blue-400">uint256</span> id){"\n"}
                      {"        "}<span className="text-pink-500">public</span>{"\n"}
                      {"        "}<span className="text-pink-500">view</span>{"\n"}
                      {"        "}<span className="text-pink-500">override</span>{"\n"}
                      {"        "}<span className="text-pink-500">returns</span> (<span className="text-blue-400">string</span> <span className="text-pink-500">memory</span>){"\n"}
                      {"    "}{"{"}{"\n"}
                      {"        "}<span className="text-blue-400">string</span> <span className="text-pink-500">memory</span> baseURI = <span className="text-purple-400">super.uri</span>(id);{"\n\n"}
                      {"        "}<span className="text-pink-500">if</span> (<span className="text-purple-400">bytes</span>(baseURI).length &gt; <span className="text-blue-400">0</span>) {"{"}{"\n"}
                      {"            "}<span className="text-pink-500">return</span> <span className="text-blue-400">string</span>(<span className="text-purple-400">abi.encodePacked</span>(baseURI, id.<span className="text-purple-400">toString</span>(), <span className="text-emerald-400">".json"</span>));{"\n"}
                      {"        "}{"}"}{"\n\n"}
                      {"        "}<span className="text-pink-500">return</span> <span className="text-emerald-400">""</span>;{"\n"}
                      {"    "}{"}"}{"\n\n"}

                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">mint</span>(<span className="text-blue-400">address</span> account, <span className="text-blue-400">uint256</span> id, <span className="text-blue-400">uint256</span> amount, <span className="text-blue-400">bytes</span> <span className="text-pink-500">memory</span> data){"\n"}
                      {"        "}<span className="text-pink-500">public</span>{"\n"}
                      {"        "}<span className="text-amber-500">onlyRole</span>(MINTER_ROLE){"\n"}
                      {"    "}{"{"}{"\n"}
                      {"        "}<span className="text-purple-400">_mint</span>(account, id, amount, data);{"\n"}
                      {"    "}{"}"}{"\n\n"}

                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">mintBatch</span>(<span className="text-blue-400">address</span> to, <span className="text-blue-400">uint256</span>[] <span className="text-pink-500">memory</span> ids, <span className="text-blue-400">uint256</span>[] <span className="text-pink-500">memory</span> amounts, <span className="text-blue-400">bytes</span> <span className="text-pink-500">memory</span> data){"\n"}
                      {"        "}<span className="text-pink-500">public</span>{"\n"}
                      {"        "}<span className="text-amber-500">onlyRole</span>(MINTER_ROLE){"\n"}
                      {"    "}{"{"}{"\n"}
                      {"        "}<span className="text-purple-400">_mintBatch</span>(to, ids, amounts, data);{"\n"}
                      {"    "}{"}"}{"\n\n"}

                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">_update</span>(<span className="text-blue-400">address</span> from, <span className="text-blue-400">address</span> to, <span className="text-blue-400">uint256</span>[] <span className="text-pink-500">memory</span> ids, <span className="text-blue-400">uint256</span>[] <span className="text-pink-500">memory</span> values){"\n"}
                      {"        "}<span className="text-pink-500">internal</span>{"\n"}
                      {"        "}<span className="text-pink-500">override</span>(<span className="text-yellow-400">ERC1155</span>, <span className="text-yellow-400">ERC1155Supply</span>){"\n"}
                      {"    "}{"{"}{"\n"}
                      {"        "}<span className="text-purple-400">super._update</span>(from, to, ids, values);{"\n"}
                      {"    "}{"}"}{"\n\n"}

                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">supportsInterface</span>(<span className="text-blue-400">bytes4</span> interfaceId){"\n"}
                      {"        "}<span className="text-pink-500">public</span>{"\n"}
                      {"        "}<span className="text-pink-500">view</span>{"\n"}
                      {"        "}<span className="text-pink-500">override</span>(<span className="text-yellow-400">ERC1155</span>, <span className="text-yellow-400">AccessControl</span>){"\n"}
                      {"        "}<span className="text-pink-500">returns</span> (<span className="text-blue-400">bool</span>){"\n"}
                      {"    "}{"{"}{"\n"}
                      {"        "}<span className="text-pink-500">return</span> <span className="text-purple-400">super.supportsInterface</span>(interfaceId);{"\n"}
                      {"    "}{"}"}{"\n"}
                      {"}"}
                    </code>
                  </pre>
                </div>
              </CardContent>
            </div>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <span className="text-[10.5px] text-muted-foreground">
                * Contrato auditado y desplegado con control de acceso jerárquico.
              </span>
              <a
                href="https://github.com/cjbaezilla/diplomado-usach-training-dapp-contracts/blob/main/contracts/BaseERC1155.sol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10.5px] text-primary hover:text-primary/80 hover:underline flex items-center gap-1 font-semibold shrink-0"
              >
                <GithubIcon className="h-3.5 w-3.5" /> Ver en GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </CardFooter>
          </Card>

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

      <Footer />
    </div>
  );
};

export default RelicsPage;
