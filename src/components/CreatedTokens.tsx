import { useState, useMemo } from 'react';
import { useAllTokens } from '@/hooks/useTokenFactory';
import { useBaseERC20 } from '@/hooks/useBaseERC20';
import { useStudentProfile } from '@/hooks/useStudentIdentity';
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
import { Coins, Copy, Check, Info, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface TokenItemProps {
  tokenAddress: `0x${string}`;
}

function TokenItem({ tokenAddress }: TokenItemProps) {
  const { metadata, isLoadingMetadata } = useBaseERC20(tokenAddress);
  const { profile, isLoading: isLoadingProfile } = useStudentProfile(metadata?.owner);
  const [copiedToken, setCopiedToken] = useState(false);

  if (isLoadingMetadata) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 animate-pulse bg-muted/20">
        <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="h-3.5 w-24 bg-muted rounded" />
          <div className="h-2.5 w-16 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const handleCopyToken = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tokenAddress);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const formattedTotalSupply = metadata.totalSupply
    ? (Number(metadata.totalSupply) / 10 ** metadata.decimals).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })
    : '0';

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-emerald-500/50 hover:bg-muted/10 transition-all duration-300">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <TokenIcon address={tokenAddress} className="h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs text-foreground truncate block">
                {metadata.name}
              </span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded font-mono uppercase shrink-0">
                {metadata.symbol}
              </span>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-0.5 truncate mt-0.5">
              Contrato: {tokenAddress.substring(0, 6)}...{tokenAddress.substring(tokenAddress.length - 4)}
              <button
                onClick={handleCopyToken}
                className="hover:text-foreground p-0.5 rounded hover:bg-muted/60 transition-colors shrink-0"
                title="Copiar dirección de contrato"
              >
                {copiedToken ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
              </button>
            </span>
          </div>
        </div>

        <div className="text-right shrink-0 flex flex-col items-end">
          <span className="text-[9px] text-muted-foreground">Suministro</span>
          <span className="text-[10px] font-mono text-foreground font-bold">
            {formattedTotalSupply}
          </span>
        </div>
      </div>

      {/* Creador */}
      {metadata.owner && (
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/10">
          <UserAvatar address={metadata.owner} className="h-4 w-4 shrink-0" />
          <span className="text-[9px] text-muted-foreground truncate">
            Creado por:{' '}
            <strong className="text-foreground font-medium">
              {isLoadingProfile ? (
                '...'
              ) : profile?.isRegistered ? (
                profile.name
              ) : (
                `${metadata.owner.substring(0, 6)}...${metadata.owner.substring(metadata.owner.length - 4)}`
              )}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

export function CreatedTokens() {
  const { tokens: allTokenAddresses, isLoading: isLoadingTokens } = useAllTokens();

  // Tomar los últimos 3 tokens creados (reversar para ver los más nuevos primero)
  const recentTokens = useMemo(() => {
    if (!allTokenAddresses || allTokenAddresses.length === 0) return [];
    return [...allTokenAddresses].reverse().slice(0, 3);
  }, [allTokenAddresses]);

  return (
    <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300 h-full">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500"></div>
      <div>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
              <Coins className="h-4 w-4 text-emerald-500" />
              Tokens Creados en la dApp
            </CardTitle>
            <CardDescription className="text-xs">
              Contratos de tokens ERC-20 recientemente creados por estudiantes.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoadingTokens ? (
            <div className="flex flex-col gap-2.5 py-1">
              <div className="h-[78px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[78px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[78px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
            </div>
          ) : recentTokens.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground space-y-2 border border-dashed border-border/40 rounded-xl">
              <Info className="h-5 w-5 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">Sin tokens creados</p>
              <p className="max-w-[200px] mx-auto text-[10px]">
                ¡Sé el primero en desplegar tu token ERC-20 usando el simulador!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentTokens.map((addr) => (
                <TokenItem key={addr} tokenAddress={addr} />
              ))}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="bg-muted/10 border-t border-border/20 p-3 flex justify-between items-center mt-auto">
        <span className="text-[10px] text-muted-foreground">
          Total: {allTokenAddresses.length} tokens
        </span>
        <Link 
          href="/erc20" 
          className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-0.5 hover:underline"
        >
          Ir a Simulador ERC20
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
