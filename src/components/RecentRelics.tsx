import { useState, useEffect, useMemo, useRef } from 'react';
import { usePublicClient, useBlockNumber } from 'wagmi';
import { CHALLENGE_MINTER_CONTRACT, DEPLOYMENT_BLOCK } from '@/contracts';
import { useStudentProfile } from '@/hooks/useStudentIdentity';
import { UserAvatar } from '@/components/UserAvatar';
import { useHydrated } from '@/hooks/useHydrated';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Trophy, Clock, Info, ArrowUpRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import challengesData from '../../public/desafios.json';

interface RecentRelicItemProps {
  userAddress: `0x${string}`;
  tokenId: number;
}

interface RelicMetadata {
  name: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: string | number }[];
}

function RecentRelicItem({ userAddress, tokenId }: RecentRelicItemProps) {
  const { profile, isLoading: isLoadingProfile } = useStudentProfile(userAddress);
  const [metadata, setMetadata] = useState<RelicMetadata | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const res = await fetch(`/nft/usach/relics/${tokenId}.json`);
        if (res.ok) {
          const data = await res.json();
          setMetadata(data);
        }
      } catch (err) {
        console.error('Error al obtener metadatos de la reliquia:', err);
      } finally {
        setIsLoadingMeta(false);
      }
    }
    fetchMetadata();
  }, [tokenId]);

  // Si no ha cargado los metadatos de la reliquia, usamos un título temporal basado en desafíos.json
  const fallbackTitle = challengesData[tokenId]?.title || `Reliquia #${tokenId}`;
  const relicTitle = metadata?.name 
    ? (metadata.name.split(':')[1]?.trim() || metadata.name)
    : fallbackTitle;

  const rarityAttr = metadata?.attributes.find(a => a.trait_type === 'Clase de Item')?.value;
  const rarity = typeof rarityAttr === 'string' ? rarityAttr : 'Común';

  // Obtener estilos y clases de color según la rareza de la reliquia
  const getRarityStyle = (rarityName: string) => {
    switch (rarityName.toLowerCase()) {
      case 'legendario':
        return {
          border: 'border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5',
          text: 'text-amber-500 dark:text-amber-400',
          bg: 'bg-amber-500/10 text-amber-500',
        };
      case 'épico':
        return {
          border: 'border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/5',
          text: 'text-purple-500 dark:text-purple-400',
          bg: 'bg-purple-500/10 text-purple-500',
        };
      case 'raro':
        return {
          border: 'border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5',
          text: 'text-blue-500 dark:text-blue-400',
          bg: 'bg-blue-500/10 text-blue-500',
        };
      default:
        return {
          border: 'border-border/40 hover:border-border/80 hover:bg-muted/5',
          text: 'text-slate-500 dark:text-slate-400',
          bg: 'bg-slate-500/10 text-slate-500',
        };
    }
  };

  const style = getRarityStyle(rarity);

  return (
    <div className={cn(
      "flex items-center justify-between gap-3 p-3 rounded-xl border bg-card/45 backdrop-blur-sm transition-all duration-300",
      style.border
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar address={userAddress} className="h-9 w-9 border border-border/60 shrink-0" />
        <div className="min-w-0">
          <h4 className="font-bold text-xs text-foreground truncate flex items-center gap-1">
            <Link
              href={`/estudiante?address=${userAddress}`}
              className="hover:underline flex items-center gap-0.5 text-foreground hover:text-primary transition-colors"
            >
              {isLoadingProfile ? 'Cargando...' : profile?.isRegistered ? profile.name : `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`}
              {!isLoadingProfile && <ExternalLink className="h-2.5 w-2.5 shrink-0 text-muted-foreground hover:text-primary" />}
            </Link>
          </h4>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            Obtuvo: <span className="text-foreground font-semibold">{relicTitle}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative h-9 w-16 rounded-lg overflow-hidden border border-border/60 shrink-0 bg-muted">
          <img
            src={`/nft/usach/relics/${tokenId}.png`}
            alt={relicTitle}
            className="w-full h-full object-cover"
          />
          <div className={cn(
            "absolute bottom-0 left-0 right-0 text-[7px] text-center font-extrabold uppercase py-0.5 bg-black/70",
            style.text
          )}>
            {rarity}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecentRelics() {
  const isHydrated = useHydrated();
  const publicClient = usePublicClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFirstLoad = useRef(true);

  const { data: blockNumber } = useBlockNumber({
    watch: true,
  });

  const safeFromBlock = useMemo(() => {
    if (!blockNumber) return DEPLOYMENT_BLOCK;
    const limit = 9500n;
    const diff = blockNumber - DEPLOYMENT_BLOCK;
    if (diff > limit) {
      return blockNumber - limit;
    }
    return DEPLOYMENT_BLOCK;
  }, [blockNumber]);

  useEffect(() => {
    async function fetchLogs() {
      if (!isHydrated || !publicClient) return;
      try {
        if (isFirstLoad.current) {
          setIsLoading(true);
        }
        const claimedLogs = await publicClient.getLogs({
          address: CHALLENGE_MINTER_CONTRACT.address,
          event: {
            type: 'event',
            name: 'ChallengeClaimed',
            inputs: [
              { type: 'address', name: 'user', indexed: true },
              { type: 'uint256', name: 'id', indexed: true },
              { type: 'uint256', name: 'amount', indexed: false },
              { type: 'bytes32', name: 'salt', indexed: false }
            ]
          },
          fromBlock: safeFromBlock,
        });

        // Ordenar de más reciente a más antiguo (getLogs devuelve cronológico ascendente)
        const sorted = [...claimedLogs].reverse();
        setLogs(sorted);
      } catch (err) {
        console.error('Error al obtener eventos de reclamo de reliquias:', err);
      } finally {
        setIsLoading(false);
        isFirstLoad.current = false;
      }
    }

    fetchLogs();
  }, [publicClient, isHydrated, safeFromBlock]);

  // Tomar los últimos 5 reclamos para la visualización simplificada
  const recentClaims = useMemo(() => {
    return logs.slice(0, 5);
  }, [logs]);

  return (
    <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300 h-full">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-yellow-500"></div>
      <div>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
              <Trophy className="h-4 w-4 text-amber-500" />
              Últimas Reliquias Obtenidas
            </CardTitle>
            <CardDescription className="text-xs">
              Últimos desafíos completados e insignias históricas reclamadas.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {!isHydrated || isLoading ? (
            <div className="flex flex-col gap-2.5 py-1">
              <div className="h-[58px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[58px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[58px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[58px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[58px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
            </div>
          ) : recentClaims.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground space-y-2 border border-dashed border-border/40 rounded-xl">
              <Info className="h-5 w-5 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">Sin reliquias reclamadas aún</p>
              <p className="max-w-[200px] mx-auto text-[10px]">
                Completa tus desafíos en la sección correspondiente para ganar reliquias.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentClaims.map((log, index) => {
                const userAddress = log.args.user as `0x${string}`;
                const tokenId = Number(log.args.id);
                return (
                  <RecentRelicItem
                    key={`${log.transactionHash}-${index}`}
                    userAddress={userAddress}
                    tokenId={tokenId}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="bg-muted/10 border-t border-border/20 p-3 flex justify-between items-center mt-auto">
        <span className="text-[10px] text-muted-foreground">
          Total: {isHydrated ? logs.length : 0} reliquias entregadas
        </span>
        <Link 
          href="/relics" 
          className="text-[10px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-0.5 hover:underline"
        >
          Ver Reliquias
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
