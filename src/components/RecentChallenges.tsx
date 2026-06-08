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
import { CheckCircle2, Clock, Info, ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import challengesData from '../../public/desafios.json';

interface RecentChallengeItemProps {
  userAddress: `0x${string}`;
  tokenId: number;
}

function RecentChallengeItem({ userAddress, tokenId }: RecentChallengeItemProps) {
  const { profile, isLoading: isLoadingProfile } = useStudentProfile(userAddress);
  
  const challenge = challengesData[tokenId];
  const title = challenge?.title || `Desafío #${tokenId}`;
  const difficulty = challenge?.difficulty || 'Principiante';
  const category = challenge?.category || 'Fundamentos';
  const estimatedTime = challenge?.estimatedTime || '5 min';

  // Obtener estilos del badge según la dificultad del desafío
  const getDifficultyStyle = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'avanzado':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'intermedio':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'principiante':
      default:
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/50 hover:bg-muted/10 transition-all duration-300">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar address={userAddress} className="h-9 w-9 border border-border/60 shrink-0" />
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-foreground truncate">
              {isLoadingProfile ? 'Cargando...' : profile?.isRegistered ? profile.name : `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`}
            </h4>
            <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
              Dirección: {userAddress.substring(0, 6)}...{userAddress.substring(userAddress.length - 4)}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          <span className={cn(
            "text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border font-mono",
            getDifficultyStyle(difficulty)
          )}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* Detalle del Desafío */}
      <div className="flex items-center justify-between pt-1.5 border-t border-border/10">
        <div className="flex items-center gap-1 min-w-0">
          <Sparkles className="h-3 w-3 text-primary shrink-0" />
          <span className="text-[10px] font-semibold text-foreground truncate">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-0.5 text-muted-foreground shrink-0 pl-2">
          <Clock className="h-2.5 w-2.5" />
          <span className="text-[8px] font-mono">{estimatedTime}</span>
        </div>
      </div>
    </div>
  );
}

export function RecentChallenges() {
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
        console.error('Error al obtener eventos de desafíos completados:', err);
      } finally {
        setIsLoading(false);
        isFirstLoad.current = false;
      }
    }

    fetchLogs();
  }, [publicClient, isHydrated, safeFromBlock]);

  // Tomar los últimos 4 desafíos para la visualización simplificada
  const recentClaims = useMemo(() => {
    return logs.slice(0, 4);
  }, [logs]);

  return (
    <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300 h-full">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-indigo-500"></div>
      <div>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Desafíos Completados
            </CardTitle>
            <CardDescription className="text-xs">
              Últimos desafíos académicos resueltos y validados por estudiantes.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {!isHydrated || isLoading ? (
            <div className="flex flex-col gap-2.5 py-1">
              <div className="h-[78px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[78px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[78px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[78px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
            </div>
          ) : recentClaims.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground space-y-2 border border-dashed border-border/40 rounded-xl">
              <Info className="h-5 w-5 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">Sin desafíos completados aún</p>
              <p className="max-w-[200px] mx-auto text-[10px]">
                ¡Comienza con tu primer desafío en la sección de aprendizaje!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentClaims.map((log, index) => {
                const userAddress = log.args.user as `0x${string}`;
                const tokenId = Number(log.args.id);
                return (
                  <RecentChallengeItem
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
          Total: {isHydrated ? logs.length : 0} completados
        </span>
        <Link 
          href="/desafios" 
          className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-0.5 hover:underline"
        >
          Ir a Desafíos
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
