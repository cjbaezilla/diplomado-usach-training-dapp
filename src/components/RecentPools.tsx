import { useState, useEffect, useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { useAllDEXPools } from '@/hooks/useDEXFactory';
import { useDEXPool } from '@/hooks/useDEXPool';
import { useBaseERC20 } from '@/hooks/useBaseERC20';
import { useStudentProfile } from '@/hooks/useStudentIdentity';
import { DEX_FACTORY_CONTRACT, DEPLOYMENT_BLOCK } from '@/contracts';
import { TokenIcon } from '@/components/TokenIcon';
import { UserAvatar } from '@/components/UserAvatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Activity, ArrowUpRight, Info, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface RecentPoolItemProps {
  poolAddress: `0x${string}`;
}

function RecentPoolItem({ poolAddress }: RecentPoolItemProps) {
  const { token0, token1, reserve0, reserve1, isLoading: isLoadingPool } = useDEXPool(poolAddress);
  const { metadata: metadata0, isLoadingMetadata: isLoadingMeta0 } = useBaseERC20(token0);
  const { metadata: metadata1, isLoadingMetadata: isLoadingMeta1 } = useBaseERC20(token1);

  const publicClient = usePublicClient();
  const [creatorAddress, setCreatorAddress] = useState<`0x${string}` | null>(null);
  const { profile, isLoading: isLoadingProfile } = useStudentProfile(creatorAddress || undefined);
  const [copiedPool, setCopiedPool] = useState(false);

  useEffect(() => {
    async function getCreator() {
      if (!publicClient || !poolAddress) return;
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
          setCreatorAddress(tx.from);
        }
      } catch (err) {
        console.error('Error al obtener el creador de la piscina:', err);
      }
    }

    getCreator();
  }, [poolAddress, publicClient]);

  const handleCopyPool = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(poolAddress);
    setCopiedPool(true);
    setTimeout(() => setCopiedPool(false), 2000);
  };

  if (isLoadingPool || isLoadingMeta0 || isLoadingMeta1) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 animate-pulse bg-muted/20">
        <div className="flex items-center shrink-0">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="h-8 w-8 rounded-full bg-muted -ml-2" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="h-3.5 w-24 bg-muted rounded" />
          <div className="h-2.5 w-16 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const formattedReserve0 = formatUnits(reserve0, metadata0.decimals);
  const formattedReserve1 = formatUnits(reserve1, metadata1.decimals);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-cyan-500/50 hover:bg-muted/10 transition-all duration-300">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center shrink-0">
            <TokenIcon address={token0 || ''} className="h-6 w-6" />
            <TokenIcon address={token1 || ''} className="h-6 w-6 -ml-2 border-l border-card" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xs text-foreground truncate block">
              {metadata0.symbol || '??'} / {metadata1.symbol || '??'}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-0.5 truncate">
              Pool: {poolAddress.substring(0, 6)}...{poolAddress.substring(poolAddress.length - 4)}
              <button
                onClick={handleCopyPool}
                className="hover:text-foreground p-0.5 rounded hover:bg-muted/60 transition-colors shrink-0"
                title="Copiar dirección de pool"
              >
                {copiedPool ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
              </button>
            </span>
          </div>
        </div>
        
        <div className="text-right shrink-0 flex flex-col items-end">
          <span className="text-[10px] font-mono text-foreground font-semibold">
            {parseFloat(formattedReserve0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {metadata0.symbol}
          </span>
          <span className="text-[10px] font-mono text-foreground font-semibold mt-0.5">
            {parseFloat(formattedReserve1).toLocaleString(undefined, { maximumFractionDigits: 2 })} {metadata1.symbol}
          </span>
        </div>
      </div>

      {/* Creador del Pool */}
      {creatorAddress && (
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/10">
          <UserAvatar address={creatorAddress} className="h-4 w-4 shrink-0" />
          <span className="text-[9px] text-muted-foreground truncate">
            Creado por:{' '}
            <strong className="text-foreground font-medium">
              {isLoadingProfile ? (
                '...'
              ) : profile?.isRegistered ? (
                profile.name
              ) : (
                `${creatorAddress.substring(0, 6)}...${creatorAddress.substring(creatorAddress.length - 4)}`
              )}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

export function RecentPools() {
  const { pools, isLoading } = useAllDEXPools();

  // Tomar los últimos 3 pools creados (reversar para ver los más nuevos primero)
  const recentPools = useMemo(() => {
    if (!pools || pools.length === 0) return [];
    return [...pools].reverse().slice(0, 3);
  }, [pools]);

  return (
    <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300 h-full">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500"></div>
      <div>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
              <Activity className="h-4 w-4 text-cyan-500" />
              Últimos Pools de Liquidez
            </CardTitle>
            <CardDescription className="text-xs">
              Piscinas de intercambio recientemente creadas en el DEX.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col gap-2.5 py-1">
              <div className="h-[78px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[78px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[78px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
            </div>
          ) : recentPools.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground space-y-2 border border-dashed border-border/40 rounded-xl">
              <Info className="h-5 w-5 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">Sin pools creados</p>
              <p className="max-w-[200px] mx-auto text-[10px]">
                Crea una nueva piscina de liquidez en la sección DEX.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentPools.map((addr) => (
                <RecentPoolItem key={addr} poolAddress={addr} />
              ))}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="bg-muted/10 border-t border-border/20 p-3 flex justify-between items-center mt-auto">
        <span className="text-[10px] text-muted-foreground">
          Total: {pools.length} piscinas
        </span>
        <Link 
          href="/dex" 
          className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 flex items-center gap-0.5 hover:underline"
        >
          Ir al DEX
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
