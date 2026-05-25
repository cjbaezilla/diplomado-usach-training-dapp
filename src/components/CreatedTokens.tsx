import { useState } from 'react';
import { useAllTokens } from '@/hooks/useTokenFactory';
import { useBaseERC20 } from '@/hooks/useBaseERC20';
import { useStudentProfile } from '@/hooks/useStudentIdentity';
import { cn } from '@/lib/utils';
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
import { Coins, Copy, Check, Loader2, Info } from 'lucide-react';

interface TokenItemProps {
  tokenAddress: `0x${string}`;
}

function TokenItem({ tokenAddress }: TokenItemProps) {
  const { metadata, isLoadingMetadata } = useBaseERC20(tokenAddress);
  const { profile, isLoading: isLoadingProfile } = useStudentProfile(metadata?.owner);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);

  if (isLoadingMetadata) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 animate-pulse bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        </div>
        <div className="h-4 w-12 bg-muted rounded shrink-0" />
      </div>
    );
  }

  const handleCopyToken = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tokenAddress);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyOwner = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(metadata.owner);
    setCopiedOwner(true);
    setTimeout(() => setCopiedOwner(false), 2000);
  };

  const formattedTotalSupply = metadata.totalSupply
    ? (Number(metadata.totalSupply) / 10 ** metadata.decimals).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })
    : '0';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/50 hover:bg-muted/10 transition-all duration-300">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <TokenIcon address={tokenAddress} className="h-10 w-10 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-bold text-sm text-foreground truncate">{metadata.name}</h4>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded font-mono uppercase shrink-0">
              {metadata.symbol}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground font-mono">
            <span className="truncate">
              Contrato: {tokenAddress.substring(0, 6)}...{tokenAddress.substring(tokenAddress.length - 4)}
            </span>
            <button
              onClick={handleCopyToken}
              className="hover:text-foreground p-0.5 rounded hover:bg-muted/60 transition-colors shrink-0"
              title="Copiar dirección de contrato"
            >
              {copiedToken ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          
          {/* Creator detail */}
          <div className="flex items-center gap-1.5 mt-2 bg-muted/40 px-2 py-1 rounded-lg border border-border/20 w-fit max-w-full">
            <UserAvatar address={metadata.owner} className="h-4 w-4 shrink-0" />
            <span className="text-[10px] text-muted-foreground truncate">
              Creador:{" "}
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
            <button
              onClick={handleCopyOwner}
              className="hover:text-foreground p-0.5 rounded hover:bg-muted/60 transition-colors shrink-0"
              title="Copiar dirección del creador"
            >
              {copiedOwner ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
            </button>
          </div>
        </div>
      </div>
      
      <div className="sm:text-right shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/20 pt-2 sm:pt-0">
        <span className="text-[10px] text-muted-foreground sm:block">Suministro Total</span>
        <span className="font-mono font-bold text-sm text-foreground">{formattedTotalSupply}</span>
      </div>
    </div>
  );
}

export function CreatedTokens() {
  const { tokens: allTokenAddresses, isLoading: isLoadingTokens } = useAllTokens();

  return (
    <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-emerald-500"></div>
      <div>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
              <Coins className="h-5 w-5 text-primary" />
              Tokens Creados en la dApp
            </CardTitle>
            <CardDescription>
              Explora los contratos de tokens desplegados por estudiantes a través de la fábrica de tokens.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full text-xs font-semibold text-primary border border-primary/20 shrink-0">
            {allTokenAddresses.length} creados
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoadingTokens ? (
            <div className="flex flex-col gap-3 py-2">
              <div className="h-[76px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[76px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[76px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
            </div>
          ) : allTokenAddresses.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground space-y-2 border border-dashed border-border/40 rounded-xl">
              <Info className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">No hay tokens creados aún.</p>
              <p className="max-w-[280px] mx-auto text-[11px]">
                ¡Sé el primero en desplegar tu propio contrato inteligente de token ERC-20 usando el simulador!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
              {allTokenAddresses.map((addr) => (
                <TokenItem key={addr} tokenAddress={addr} />
              ))}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
        <span className="text-[10.5px] text-muted-foreground">
          * Los metadatos de los tokens se consultan en tiempo real directamente de la blockchain.
        </span>
      </CardFooter>
    </Card>
  );
}
