import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useAccount, useReadContracts } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { PageHeader } from '@/components/PageHeader';
import { useHydrated } from '@/hooks/useHydrated';
import { Footer } from '@/components/Footer';
import { UsdValue } from '@/components/UsdValue';
import { TokenIcon } from '@/components/TokenIcon';
import { UserAvatar } from '@/components/UserAvatar';
import { EthPriceTicker } from '@/components/EthPriceTicker';
import { useStudentProfile } from '@/hooks/useStudentIdentity';
import { useAllTokens } from '@/hooks/useTokenFactory';
import { useAllDEXPools } from '@/hooks/useDEXFactory';
import { WETH_CONTRACT, getBaseERC20Contract, getDEXPoolContract } from '@/contracts';
import { formatUnits } from 'viem';
import { 
  Trophy, 
  Coins, 
  ArrowUpRight, 
  Activity, 
  TrendingUp, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  TrendingDown, 
  Search,
  RefreshCw,
  Info,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CreatorCellProps {
  address: `0x${string}`;
}

/**
 * Componente interno para mostrar la identidad del creador de manera asíncrona.
 */
function CreatorCell({ address }: CreatorCellProps) {
  const { profile, isLoading } = useStudentProfile(address);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-5 w-5 rounded-full bg-muted" />
        <div className="h-3 w-16 bg-muted rounded" />
      </div>
    );
  }

  const displayName = profile?.isRegistered 
    ? profile.name 
    : `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <Link 
      href={`/estudiante/${address.toLowerCase()}`}
      className="flex items-center gap-2 hover:text-primary transition-colors group/creator"
    >
      <UserAvatar address={address} className="h-5 w-5 border border-border/40 group-hover/creator:border-primary/50 transition-colors" />
      <span className="text-xs font-mono font-medium truncate max-w-[140px]">
        {displayName}
      </span>
    </Link>
  );
}

const TokenRankingPage: NextPage = () => {
  const isHydrated = useHydrated();
  const { chain } = useAccount();
  const explorerUrl = chain?.blockExplorers?.default?.url || 'https://sepolia.etherscan.io';

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // 1. Obtener todas las direcciones de tokens de la fábrica
  const { tokens: factoryTokens, isLoading: isLoadingTokens, refetch: refetchTokens } = useAllTokens();

  // 2. Obtener todas las direcciones de pools del DEX
  const { pools: dexPools, isLoading: isLoadingPools, refetch: refetchPools } = useAllDEXPools();

  // 3. Preparar consultas multicall para metadatos de tokens
  const tokenMetadataContracts = useMemo(() => {
    if (!factoryTokens || factoryTokens.length === 0) return [];
    return factoryTokens.flatMap((addr) => [
      { ...getBaseERC20Contract(addr), functionName: 'name' },
      { ...getBaseERC20Contract(addr), functionName: 'symbol' },
      { ...getBaseERC20Contract(addr), functionName: 'decimals' },
      { ...getBaseERC20Contract(addr), functionName: 'owner' },
    ]);
  }, [factoryTokens]);

  const { data: tokenMetadataResults, isLoading: isLoadingTokenMetadata, refetch: refetchMetadata } = useReadContracts({
    contracts: tokenMetadataContracts as any,
    query: {
      enabled: isHydrated && tokenMetadataContracts.length > 0,
    },
  });

  // 4. Preparar consultas multicall para detalles de pools
  const poolDetailsContracts = useMemo(() => {
    if (!dexPools || dexPools.length === 0) return [];
    return dexPools.flatMap((addr) => [
      { ...getDEXPoolContract(addr), functionName: 'token0' },
      { ...getDEXPoolContract(addr), functionName: 'token1' },
      { ...getDEXPoolContract(addr), functionName: 'obtenerReservas' },
    ]);
  }, [dexPools]);

  const { data: poolDetailsResults, isLoading: isLoadingPoolDetails, refetch: refetchPoolDetails } = useReadContracts({
    contracts: poolDetailsContracts as any,
    query: {
      enabled: isHydrated && poolDetailsContracts.length > 0,
    },
  });

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchTokens(),
      refetchPools(),
      refetchMetadata(),
      refetchPoolDetails()
    ]);
  };

  // Mapear resultados de metadatos de tokens
  const tokensMetadata = useMemo(() => {
    if (!factoryTokens || !tokenMetadataResults || factoryTokens.length * 4 !== tokenMetadataResults.length) return {};
    
    const mapping: Record<string, { name: string; symbol: string; decimals: number; owner: `0x${string}` }> = {};
    
    factoryTokens.forEach((addr, i) => {
      const name = tokenMetadataResults[i * 4]?.result as string || 'Token Educativo';
      const symbol = tokenMetadataResults[i * 4 + 1]?.result as string || 'TOKEN';
      const decimals = Number(tokenMetadataResults[i * 4 + 2]?.result ?? 18);
      const owner = tokenMetadataResults[i * 4 + 3]?.result as `0x${string}` || '0x0000000000000000000000000000000000000000';
      mapping[addr.toLowerCase()] = { name, symbol, decimals, owner };
    });
    
    return mapping;
  }, [factoryTokens, tokenMetadataResults]);

  // Mapear resultados de pools del DEX
  const poolsData = useMemo(() => {
    if (!dexPools || !poolDetailsResults || dexPools.length * 3 !== poolDetailsResults.length) return [];
    
    const list: {
      poolAddress: `0x${string}`;
      token0: `0x${string}`;
      token1: `0x${string}`;
      reserve0: bigint;
      reserve1: bigint;
    }[] = [];
    
    dexPools.forEach((addr, i) => {
      const token0 = poolDetailsResults[i * 3]?.result as `0x${string}`;
      const token1 = poolDetailsResults[i * 3 + 1]?.result as `0x${string}`;
      const reserves = poolDetailsResults[i * 3 + 2]?.result as [bigint, bigint] | undefined;
      const [reserve0, reserve1] = reserves || [0n, 0n];
      
      if (token0 && token1) {
        list.push({
          poolAddress: addr,
          token0,
          token1,
          reserve0,
          reserve1,
        });
      }
    });
    
    return list;
  }, [dexPools, poolDetailsResults]);

  // Combinar tokens y pools para calcular liquidez locked en WETH y ratios de precio
  const rankedTokens = useMemo(() => {
    if (!factoryTokens || Object.keys(tokensMetadata).length === 0) return [];
    
    const list = factoryTokens.map((addr) => {
      const meta = tokensMetadata[addr.toLowerCase()];
      const wethAddr = WETH_CONTRACT.address.toLowerCase();
      const tokenAddrLower = addr.toLowerCase();
      
      // Buscar la piscina correspondiente con WETH
      const pool = poolsData.find((p) => {
        const t0 = p.token0.toLowerCase();
        const t1 = p.token1.toLowerCase();
        return (t0 === tokenAddrLower && t1 === wethAddr) || (t0 === wethAddr && t1 === tokenAddrLower);
      });
      
      let wethReserve = 0n;
      let tokenReserve = 0n;
      let ratioTokenToWeth = 0;
      let ratioWethToToken = 0;
      let poolAddress: `0x${string}` | null = null;
      
      if (pool) {
        poolAddress = pool.poolAddress;
        if (pool.token0.toLowerCase() === wethAddr) {
          wethReserve = pool.reserve0;
          tokenReserve = pool.reserve1;
        } else {
          wethReserve = pool.reserve1;
          tokenReserve = pool.reserve0;
        }
        
        const tokenDecimals = meta?.decimals ?? 18;
        const wethDecimals = 18;
        
        const wethAmountFloat = Number(wethReserve) / 10 ** wethDecimals;
        const tokenAmountFloat = Number(tokenReserve) / 10 ** tokenDecimals;
        
        if (tokenAmountFloat > 0) {
          ratioTokenToWeth = wethAmountFloat / tokenAmountFloat;
        }
        if (wethAmountFloat > 0) {
          ratioWethToToken = tokenAmountFloat / wethAmountFloat;
        }
      }
      
      return {
        address: addr,
        name: meta?.name || 'Token Educativo',
        symbol: meta?.symbol || 'TOKEN',
        decimals: meta?.decimals ?? 18,
        owner: meta?.owner || '0x0000000000000000000000000000000000000000',
        poolAddress,
        wethReserve,
        tokenReserve,
        ratioTokenToWeth,
        ratioWethToToken,
      };
    });
    
    // Ordenar de mayor a menor liquidez en WETH
    return list.sort((a, b) => {
      if (b.wethReserve > a.wethReserve) return 1;
      if (b.wethReserve < a.wethReserve) return -1;
      return 0;
    });
  }, [factoryTokens, tokensMetadata, poolsData]);

  // Filtrar tokens según la búsqueda del usuario (nombre o símbolo)
  const filteredTokens = useMemo(() => {
    if (!searchQuery) return rankedTokens;
    const query = searchQuery.toLowerCase();
    return rankedTokens.filter(
      (t) => t.name.toLowerCase().includes(query) || t.symbol.toLowerCase().includes(query) || t.address.toLowerCase() === query
    );
  }, [rankedTokens, searchQuery]);

  // Estadísticas globales del ranking
  const stats = useMemo(() => {
    let totalWethLiquidity = 0n;
    let tokensWithLiquidity = 0;
    
    rankedTokens.forEach((t) => {
      if (t.wethReserve > 0n) {
        totalWethLiquidity += t.wethReserve;
        tokensWithLiquidity++;
      }
    });

    const leaderToken = rankedTokens.find((t) => t.wethReserve > 0n);

    return {
      totalTokens: rankedTokens.length,
      totalWethLiquidity,
      tokensWithLiquidity,
      leaderToken,
    };
  }, [rankedTokens]);

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedToken(address);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const isLoadingAny = !isHydrated || isLoadingTokens || isLoadingPools || isLoadingTokenMetadata || isLoadingPoolDetails;

  // Formateadores locales para ratios de precios muy bajos
  const formatRatio = (val: number): string => {
    if (val === 0) return '0.00';
    if (val < 0.000001) {
      const exponent = Math.floor(Math.log10(val));
      const decimalsNeeded = Math.min(Math.max(Math.abs(exponent) + 4, 6), 18);
      return val.toLocaleString(undefined, { maximumFractionDigits: decimalsNeeded });
    }
    return val.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <Head>
        <title>Ranking de Liquidez - Web3 dApp</title>
        <meta
          content="Ranking de tokens creados por los estudiantes ordenados según la liquidez en WETH bloqueada en el DEX de la USACH."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Navbar />

      <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 space-y-6 w-full">
        {/* Encabezado Académico */}
        <PageHeader
          title="Ranking de Tokens por Liquidez"
          description="Monitorea y analiza el desempeño de los tokens ERC-20 diseñados y desplegados por los estudiantes. La tabla se ordena jerárquicamente en tiempo real de acuerdo al total de liquidez en WETH (Wrapped Ether) bloqueada en sus piscinas correspondientes de nuestro AMM/DEX."
          icon={Trophy}
          breadcrumbItems={[
            { label: 'Ranking de Liquidez' }
          ]}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isLoadingAny}
              className="gap-1.5 border-border/60 hover:bg-muted/80 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isLoadingAny ? 'animate-spin' : ''}`} />
              <span>Sincronizar Datos</span>
            </Button>
          }
        />

        {/* Panel de Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          {/* Card 1: Total Tokens */}
          <Card className="border border-border/50 bg-card/45 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500" />
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Tokens Registrados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAny ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-foreground">{stats.totalTokens}</span>
                  <span className="text-xs text-muted-foreground">creados</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Liquidez Total */}
          <Card className="border border-border/50 bg-card/45 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Liquidez Global DEX</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAny ? (
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              ) : (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-foreground">
                      {parseFloat(formatUnits(stats.totalWethLiquidity, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">WETH</span>
                  </div>
                  <UsdValue wethAmount={stats.totalWethLiquidity} className="text-xs font-semibold" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Tokens con Pool */}
          <Card className="border border-border/50 bg-card/45 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500" />
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Piscinas Activas</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAny ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-foreground">{stats.tokensWithLiquidity}</span>
                  <span className="text-xs text-muted-foreground">de {stats.totalTokens} tokens</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Líder de Liquidez */}
          <Card className="border border-border/50 bg-card/45 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500" />
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Líder del Mercado</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAny ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : stats.leaderToken ? (
                <div className="flex items-center gap-2">
                  <TokenIcon address={stats.leaderToken.address} className="h-7 w-7" />
                  <div className="min-w-0">
                    <span className="font-bold text-sm block truncate text-foreground">
                      {stats.leaderToken.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 px-1 rounded">
                      {stats.leaderToken.symbol}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground italic">Sin pools activos</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Buscador y Tabla de Ranking */}
        <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden transition-all duration-300 w-full">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                Tabla de Clasificación
              </CardTitle>
              <CardDescription className="text-xs">
                Tokens ERC20 ordenados por liquidez en WETH bloqueada en sus respectivos pools.
              </CardDescription>
            </div>
            
            {/* Buscador */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar token por nombre/símbolo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-background/50 border border-input rounded-lg text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground shadow-inner"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {isLoadingAny ? (
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-semibold text-muted-foreground">Obteniendo datos de la blockchain...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-muted/20 animate-pulse rounded" />
                  <div className="h-8 bg-muted/20 animate-pulse rounded" />
                  <div className="h-8 bg-muted/20 animate-pulse rounded" />
                  <div className="h-8 bg-muted/20 animate-pulse rounded" />
                </div>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <Info className="h-8 w-8 text-muted-foreground mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No se encontraron tokens</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchQuery 
                    ? "Prueba refinando la búsqueda o verifica que el token esté correctamente desplegado en la fábrica." 
                    : "No hay tokens creados actualmente por los estudiantes en la plataforma."}
                </p>
                {!searchQuery && (
                  <Link href="/erc20">
                    <Button size="sm" className="text-xs font-semibold mt-2">
                      Crear primer token
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/15 text-[10px] uppercase font-bold text-muted-foreground tracking-wider select-none">
                    <th className="py-3 pl-6 w-[80px]">Rango</th>
                    <th className="py-3 px-4 min-w-[200px]">Token</th>
                    <th className="py-3 px-4 min-w-[150px]">Creador</th>
                    <th className="py-3 px-3 min-w-[100px]">Valor Unitario</th>
                    <th className="py-3 px-4 text-right min-w-[160px]">Liquidez Bloqueada</th>
                    <th className="py-3 px-6 min-w-[220px]">Tasa de Cambio</th>
                    <th className="py-3 pr-6 text-right w-[120px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {filteredTokens.map((token, index) => {
                    const isTop3 = index < 3 && !searchQuery;
                    const trophyColors = [
                      'text-amber-400 bg-amber-500/10 border-amber-500/30',
                      'text-slate-300 bg-slate-500/10 border-slate-500/30',
                      'text-amber-600 bg-amber-700/10 border-amber-700/30'
                    ];

                    const formattedWeth = formatUnits(token.wethReserve, 18);
                    const formattedTokenReserve = formatUnits(token.tokenReserve, token.decimals);

                    return (
                      <tr key={token.address} className="hover:bg-muted/10 transition-colors border-b border-border/10">
                        {/* Rango */}
                        <td className="py-2.5 pl-6">
                          <div className="flex items-center justify-start">
                            {isTop3 ? (
                              <div className={`flex items-center justify-center h-6 w-6 rounded-full border font-bold text-xs ${trophyColors[index]}`} title={`Top ${index + 1}`}>
                                {index + 1}
                              </div>
                            ) : (
                              <span className="font-mono text-muted-foreground pl-2">{index + 1}</span>
                            )}
                          </div>
                        </td>

                        {/* Token */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-3">
                            <TokenIcon address={token.address} className="h-8 w-8" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-sm text-foreground truncate block">{token.name}</span>
                                <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                                  {token.symbol}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                                {token.address.substring(0, 6)}...{token.address.substring(token.address.length - 4)}
                                <button
                                  onClick={(e) => handleCopy(token.address, e)}
                                  className="hover:text-foreground p-0.5 rounded hover:bg-muted/65 transition-colors shrink-0"
                                  title="Copiar dirección"
                                >
                                  {copiedToken === token.address ? (
                                    <Check className="h-2.5 w-2.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-2.5 w-2.5" />
                                  )}
                                </button>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Creador */}
                        <td className="py-2.5 px-4">
                          <CreatorCell address={token.owner} />
                        </td>

                        {/* Valor Unitario (USD) */}
                        <td className="py-2.5 px-3">
                          {token.poolAddress ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground">1 {token.symbol} ≈</span>
                                <UsdValue wethAmount={token.ratioTokenToWeth} className="text-xs font-extrabold text-emerald-500" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-medium italic">-</span>
                          )}
                        </td>

                        {/* Liquidez Bloqueada */}
                        <td className="py-2.5 px-4 text-right">
                          {token.wethReserve > 0n ? (
                            <div className="flex flex-col items-end">
                              <span className="font-mono font-bold text-foreground">
                                {parseFloat(formattedWeth).toLocaleString(undefined, { maximumFractionDigits: 4 })} WETH
                              </span>
                              <UsdValue wethAmount={token.wethReserve} className="text-[10px] font-bold text-emerald-500" />
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-medium italic">Sin liquidez</span>
                          )}
                        </td>

                        {/* Tasa de Cambio */}
                        <td className="py-2.5 px-6">
                          {token.poolAddress ? (
                            <div className="flex flex-col gap-1 font-mono text-[11px]">
                              <div className="text-foreground">
                                <span>1 {token.symbol} = </span>
                                <span className="font-bold">{formatRatio(token.ratioTokenToWeth)}</span>
                                <span className="text-muted-foreground"> WETH</span>
                              </div>
                              <div className="text-muted-foreground">
                                <span>1 WETH = </span>
                                <span>{formatRatio(token.ratioWethToToken)}</span>
                                <span> {token.symbol}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-medium italic">Piscina no creada</span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-2.5 pr-6 text-right">
                          {token.poolAddress ? (
                            <Link href={`/dex?tokenA=${token.address}&tokenB=${WETH_CONTRACT.address}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] font-bold border-primary/30 hover:border-primary hover:bg-primary/10 text-primary transition-all duration-200"
                              >
                                <ArrowUpRight className="h-3 w-3 mr-1 shrink-0" />
                                Operar
                              </Button>
                            </Link>
                          ) : (
                            <Link href="/dex">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] font-bold border-muted-foreground/30 hover:border-muted-foreground hover:bg-muted/10 text-muted-foreground transition-all duration-200"
                              >
                                Crear Pool
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default TokenRankingPage;
