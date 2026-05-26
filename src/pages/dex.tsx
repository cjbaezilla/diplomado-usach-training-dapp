import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useAccount, useBalance, usePublicClient } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  ArrowRightLeft,
  Coins,
  TrendingUp,
  Plus,
  Minus,
  Info,
  AlertCircle,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Activity,
  ArrowLeft,
  BookOpen,
  Code,
  Copy,
  Check,
  PlusCircle,
  Layers,
  ArrowDownUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAllTokens } from '@/hooks/useTokenFactory';
import { useBaseERC20, useERC20Balance, useERC20Allowance } from '@/hooks/useBaseERC20';
import { useAllDEXPools, useGetPool, useDEXFactoryActions } from '@/hooks/useDEXFactory';
import { useDEXPool, useDEXPoolBalance, useDEXPoolActions } from '@/hooks/useDEXPool';
import { useWETH } from '@/hooks/useWETH';
import { useHydrated } from '@/hooks/useHydrated';
import { TokenIcon } from '@/components/TokenIcon';
import { useEthPrice } from '@/hooks/useEthPrice';
import { EthPriceTicker } from '@/components/EthPriceTicker';
import { UserAvatar } from '@/components/UserAvatar';
import { DEX_FACTORY_CONTRACT } from '@/contracts';

// Representación de transacción local
interface DEXTransaction {
  id: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'create_pool' | 'weth';
  description: string;
  hash: string;
  timestamp: string;
  status: 'exitoso' | 'pendiente';
}

// Fórmulas matemáticas de utilidad en el cliente
const calcularCantidadSalida = (cantidadEntrada: bigint, reservaEntrada: bigint, reservaSalida: bigint): bigint => {
  if (cantidadEntrada <= 0n || reservaEntrada <= 0n || reservaSalida <= 0n) return 0n;
  const cantidadEntradaConTarifa = cantidadEntrada * 997n; // 0.3% tarifa (1 - 0.003 = 0.997)
  const numerador = cantidadEntradaConTarifa * reservaSalida;
  const denominador = (reservaEntrada * 1000n) + cantidadEntradaConTarifa;
  return numerador / denominador;
};

const calcularCantidad1Optima = (cantidad0Deseada: bigint, reserva0: bigint, reserva1: bigint): bigint => {
  if (reserva0 === 0n || reserva1 === 0n) return 0n;
  return (cantidad0Deseada * reserva1) / reserva0;
};

// Componente para una fila de piscina de liquidez
interface PoolRowProps {
  poolAddress: `0x${string}`;
  userAddress?: `0x${string}`;
  refreshTrigger?: number;
}

function PoolRow({ poolAddress, userAddress, refreshTrigger }: PoolRowProps) {
  const { token0, token1, reserve0, reserve1, totalSupply, isLoading: isLoadingPool, refetch: refetchPool } = useDEXPool(poolAddress);
  const { metadata: metadata0, isLoadingMetadata: isLoadingMeta0 } = useBaseERC20(token0);
  const { metadata: metadata1, isLoadingMetadata: isLoadingMeta1 } = useBaseERC20(token1);
  const { balance: lpBalance, isLoading: isLoadingLpBalance, refetch: refetchLpBalance } = useDEXPoolBalance(poolAddress, userAddress);
  const { data: ethPrice } = useEthPrice();

  const publicClient = usePublicClient();
  const [creatorAddress, setCreatorAddress] = useState<`0x${string}` | null>(null);

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
          fromBlock: 0n,
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

  // Escuchar el trigger de refresco para actualizar las reservas y balance LP
  useEffect(() => {
    if (refreshTrigger) {
      console.log(`[PoolRow] Refrescando pool ${poolAddress} con trigger ${refreshTrigger}`);
      refetchPool();
      refetchLpBalance();
    }
  }, [refreshTrigger, refetchPool, refetchLpBalance, poolAddress]);

  if (isLoadingPool || isLoadingMeta0 || isLoadingMeta1 || isLoadingLpBalance) {
    return (
      <div className="flex flex-col gap-2 p-4 rounded-xl border border-border/40 animate-pulse bg-muted/10">
        <div className="flex justify-between">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>
        <div className="h-3 w-40 bg-muted rounded" />
      </div>
    );
  }

  const formattedReserve0 = formatUnits(reserve0, metadata0.decimals);
  const formattedReserve1 = formatUnits(reserve1, metadata1.decimals);
  const formattedLPBalance = formatUnits(lpBalance, 18); // LP tokens siempre usan 18 decimales
  const formattedTotalLP = formatUnits(totalSupply, 18);

  const ratio = reserve0 > 0n 
    ? (Number(reserve1) / 10 ** metadata1.decimals) / (Number(reserve0) / 10 ** metadata0.decimals)
    : 0;

  // Determinar valor aproximado en USD si uno de los tokens del pool es WETH
  const isToken0Weth = token0?.toLowerCase() === WETH_ADDRESS.toLowerCase();
  const isToken1Weth = token1?.toLowerCase() === WETH_ADDRESS.toLowerCase();
  const currentEthPrice = ethPrice || 0;

  const reserve0Usd = isToken0Weth && currentEthPrice > 0
    ? Number(formattedReserve0) * currentEthPrice
    : 0;

  const reserve1Usd = isToken1Weth && currentEthPrice > 0
    ? Number(formattedReserve1) * currentEthPrice
    : 0;

  return (
    <div className="p-4 rounded-xl border border-border/40 bg-card/30 hover:border-primary/45 transition-all duration-300">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <TokenIcon address={token0 || ''} className="h-6 w-6" />
          <TokenIcon address={token1 || ''} className="h-6 w-6 -ml-3" />
          <span className="font-bold text-sm text-foreground">
            {metadata0.symbol || '??'} / {metadata1.symbol || '??'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {creatorAddress && (
            <div className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-full border border-border/20" title={`Creador: ${creatorAddress}`}>
              <UserAvatar address={creatorAddress} className="h-3.5 w-3.5 shrink-0" />
              <span className="text-[9px] text-muted-foreground font-mono">
                {creatorAddress.substring(0, 6)}...{creatorAddress.substring(creatorAddress.length - 4)}
              </span>
            </div>
          )}
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
            {poolAddress.substring(0, 6)}...{poolAddress.substring(poolAddress.length - 4)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border/10 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground block">Reservas</span>
          <span className="font-mono text-foreground block">
            {parseFloat(formattedReserve0).toLocaleString(undefined, { maximumFractionDigits: 4 })} {metadata0.symbol}
            {reserve0Usd > 0 && (
              <span className="text-[10px] text-emerald-400 font-bold block">
                (~${reserve0Usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
              </span>
            )}
          </span>
          <span className="font-mono text-foreground block mt-1">
            {parseFloat(formattedReserve1).toLocaleString(undefined, { maximumFractionDigits: 4 })} {metadata1.symbol}
            {reserve1Usd > 0 && (
              <span className="text-[10px] text-emerald-400 font-bold block">
                (~${reserve1Usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
              </span>
            )}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground block">Precio y Proporción</span>
          <span className="font-mono text-foreground block">
            1 {metadata0.symbol} = {ratio.toLocaleString(undefined, { maximumFractionDigits: 6 })} {metadata1.symbol}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Total LP: {parseFloat(formattedTotalLP).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {userAddress && lpBalance > 0n && (
        <div className="mt-3 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs">
          <span className="font-medium text-primary">Tu Participación (LP):</span>
          <span className="font-mono font-bold text-primary">
            {parseFloat(formattedLPBalance).toLocaleString(undefined, { maximumFractionDigits: 6 })} Tokens LP
          </span>
        </div>
      )}
    </div>
  );
}

// Selector de tokens simple
interface TokenSelectorProps {
  label: string;
  selectedToken?: `0x${string}`;
  onSelect: (addr: `0x${string}`) => void;
  tokenList: `0x${string}`[];
  userAddress?: `0x${string}`;
  excludeToken?: `0x${string}`;
}

function TokenSelector({ label, selectedToken, onSelect, tokenList, userAddress, excludeToken }: TokenSelectorProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-foreground">{label}</Label>
      </div>

      <select
        value={selectedToken || ''}
        onChange={(e) => onSelect(e.target.value as `0x${string}`)}
        className="flex h-9 w-full rounded-lg border border-input bg-background/80 px-3 py-1.5 text-xs shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
      >
        <option value="" disabled>Selecciona un token</option>
        {tokenList
          .filter((addr) => addr !== excludeToken)
          .map((addr) => (
            <TokenOptionItem key={addr} tokenAddress={addr} userAddress={userAddress} />
          ))}
      </select>
    </div>
  );
}


function TokenOptionItem({ tokenAddress, userAddress }: { tokenAddress: `0x${string}`; userAddress?: `0x${string}` }) {
  const isEth = tokenAddress === ETH_ADDRESS;
  const { data: ethBalanceData } = useBalance({
    address: userAddress,
    query: {
      enabled: isEth && !!userAddress,
    },
  });

  const rawMetadata = useBaseERC20(isEth ? undefined : tokenAddress);
  const metadata = useMemo(() => {
    if (isEth) {
      return { symbol: 'ETH', name: 'Ether', decimals: 18 };
    }
    return rawMetadata.metadata;
  }, [isEth, rawMetadata.metadata]);

  const { balance } = useERC20Balance(isEth ? undefined : tokenAddress, userAddress);

  const resolvedBalance = useMemo(() => {
    if (isEth) {
      return ethBalanceData ? ethBalanceData.value : 0n;
    }
    return balance;
  }, [isEth, balance, ethBalanceData]);

  const formattedBalance = resolvedBalance
    ? (Number(resolvedBalance) / 10 ** metadata.decimals).toLocaleString(undefined, {
        maximumFractionDigits: 4,
      })
    : '0';

  return (
    <option value={tokenAddress} className="bg-card text-foreground text-xs">
      {isEth ? 'ETH Nativo' : metadata.symbol || tokenAddress.substring(0, 6)} - {isEth ? 'Ether' : metadata.name}
    </option>
  );
}

const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DEXPool is ERC20, ReentrancyGuard {
    IERC20 public immutable token0;
    IERC20 public immutable token1;
    uint256 public reserve0;
    uint256 public reserve1;

    // x * y = k (Fórmula de producto constante)
    function swap(
        address tokenEntrada, 
        uint256 cantidadEntrada
    ) external nonReentrant returns (uint256 cantidadSalida) {
        bool esToken0 = tokenEntrada == address(token0);
        (uint256 resIn, uint256 resOut) = esToken0 
            ? (reserve0, reserve1) 
            : (reserve1, reserve0);
        
        // 0.3% de comisión (997/1000)
        uint256 entradaConTarifa = cantidadEntrada * 997;
        uint256 numerador = entradaConTarifa * resOut;
        uint256 denominador = (resIn * 1000) + entradaConTarifa;
        cantidadSalida = numerador / denominador;

        IERC20(tokenEntrada).transferFrom(msg.sender, address(this), cantidadEntrada);
        IERC20(esToken0 ? token1 : token0).transfer(msg.sender, cantidadSalida);

        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));
    }
}`;

const WETH_ADDRESS = (process.env.NEXT_PUBLIC_WETH_ADDRESS || '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6') as `0x${string}`;
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

const DEXPage: NextPage = () => {
  const isHydrated = useHydrated();
  const { isConnected, address } = useAccount();

  // Tokens creados de fábrica y tokens locales del DEX
  const { tokens: tokenFactoryAddresses, isLoading: isLoadingTokens } = useAllTokens();
  const { pools: allPoolAddresses, isLoading: isLoadingPools, refetch: refetchPools } = useAllDEXPools();

  // Trigger de refresco para actualizar componentes hijo (PoolRow)
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Registro de hashes ya procesados para evitar re-ejecuciones en bucle de los efectos de éxito
  const [lastProcessedActionHash, setLastProcessedActionHash] = useState<string | null>(null);
  const [lastProcessedFactoryHash, setLastProcessedFactoryHash] = useState<string | null>(null);
  const [lastProcessedWethHash, setLastProcessedWethHash] = useState<string | null>(null);

  // Lista unificada de todos los tokens seleccionables (ETH nativo + WETH + tokens de fábrica)
  const selectableTokens = useMemo(() => {
    const list = [ETH_ADDRESS, WETH_ADDRESS];
    tokenFactoryAddresses.forEach((addr) => {
      if (!list.some(existing => existing.toLowerCase() === addr.toLowerCase())) {
        list.push(addr);
      }
    });
    return list;
  }, [tokenFactoryAddresses]);

  // Lista de tokens seleccionables para creación de piscinas (excluye ETH nativo ya que las piscinas usan WETH)
  const createPoolSelectableTokens = useMemo(() => {
    return selectableTokens.filter(addr => addr.toLowerCase() !== ETH_ADDRESS.toLowerCase());
  }, [selectableTokens]);

  // Estados de los formularios de DEX
  const [tokenA, setTokenA] = useState<`0x${string}` | undefined>(undefined);
  const [tokenB, setTokenB] = useState<`0x${string}` | undefined>(undefined);
  const [showAddLiquidityGuide, setShowAddLiquidityGuide] = useState(false);

  // Direcciones resueltas para interactuar con los pools (mapeando ETH a WETH)
  const resolvedTokenA = useMemo(() => {
    if (!tokenA) return undefined;
    return tokenA.toLowerCase() === ETH_ADDRESS.toLowerCase() ? WETH_ADDRESS : tokenA;
  }, [tokenA]);

  const resolvedTokenB = useMemo(() => {
    if (!tokenB) return undefined;
    return tokenB.toLowerCase() === ETH_ADDRESS.toLowerCase() ? WETH_ADDRESS : tokenB;
  }, [tokenB]);

  // Pool seleccionado para Swap y Liquidez
  const isWethDirectSwap = useMemo(() => {
    if (!tokenA || !tokenB) return false;
    const a = tokenA.toLowerCase();
    const b = tokenB.toLowerCase();
    const eth = ETH_ADDRESS.toLowerCase();
    const weth = WETH_ADDRESS.toLowerCase();
    return (a === eth && b === weth) || (a === weth && b === eth);
  }, [tokenA, tokenB]);

  const { poolAddress: currentPoolAddress, exists: poolExists, isLoading: isLoadingCurrentPool } = useGetPool(resolvedTokenA, resolvedTokenB);
  
  // Datos del pool actual
  const { 
    token0: poolToken0, 
    token1: poolToken1, 
    reserve0: poolReserve0, 
    reserve1: poolReserve1, 
    totalSupply: poolTotalSupply, 
    refetch: refetchPoolDetails 
  } = useDEXPool(currentPoolAddress);

  // Metadatos y acciones de tokens activos (usando resolvedToken para soportar WETH en lugar de ETH nativo en aprobaciones)
  const rawMetadataA = useBaseERC20(resolvedTokenA);
  const metadataA = useMemo(() => {
    if (tokenA === ETH_ADDRESS) {
      return {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
        totalSupply: 0n,
        owner: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      };
    }
    return rawMetadataA.metadata;
  }, [tokenA, rawMetadataA.metadata]);

  const rawMetadataB = useBaseERC20(resolvedTokenB);
  const metadataB = useMemo(() => {
    if (tokenB === ETH_ADDRESS) {
      return {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
        totalSupply: 0n,
        owner: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      };
    }
    return rawMetadataB.metadata;
  }, [tokenB, rawMetadataB.metadata]);

  const approveA = (spender: `0x${string}`, amount: bigint) => {
    rawMetadataA.approve(spender, amount);
  };
  const isPendingApproveA = rawMetadataA.isPending;

  const approveB = (spender: `0x${string}`, amount: bigint) => {
    rawMetadataB.approve(spender, amount);
  };
  const isPendingApproveB = rawMetadataB.isPending;

  // Hook de WETH para envolver y desenvolver Ether
  const {
    ethBalance,
    wethBalance,
    deposit: wethDeposit,
    withdraw: wethWithdraw,
    isPending: isWethPending,
    isSuccess: isWethSuccess,
    hash: wethTxHash,
    error: wethError,
    refetchBalances: refetchWethBalances
  } = useWETH(address);

  // Balances del usuario
  const { balance: balanceA, refetch: refetchBalanceA } = useERC20Balance(tokenA && tokenA !== ETH_ADDRESS ? tokenA : undefined, address);
  const { balance: balanceB, refetch: refetchBalanceB } = useERC20Balance(tokenB && tokenB !== ETH_ADDRESS ? tokenB : undefined, address);

  const resolvedBalanceA = useMemo(() => {
    if (tokenA === ETH_ADDRESS) {
      return ethBalance;
    }
    return balanceA;
  }, [tokenA, balanceA, ethBalance]);

  const resolvedBalanceB = useMemo(() => {
    if (tokenB === ETH_ADDRESS) {
      return ethBalance;
    }
    return balanceB;
  }, [tokenB, balanceB, ethBalance]);

  // Aprobaciones (allowance) para el Pool actual
  const { allowance: allowanceA, refetch: refetchAllowanceA } = useERC20Allowance(resolvedTokenA, address, currentPoolAddress);
  const { allowance: allowanceB, refetch: refetchAllowanceB } = useERC20Allowance(resolvedTokenB, address, currentPoolAddress);

  // Efectos para detectar éxito en aprobaciones
  useEffect(() => {
    if (rawMetadataA.isSuccess && rawMetadataA.txHash) {
      setNotification({
        type: 'success',
        message: `¡Aprobación de ${metadataA.symbol} completada con éxito!`
      });
      refetchAllowanceA();
    }
  }, [rawMetadataA.isSuccess, rawMetadataA.txHash]);

  useEffect(() => {
    if (rawMetadataB.isSuccess && rawMetadataB.txHash) {
      setNotification({
        type: 'success',
        message: `¡Aprobación de ${metadataB.symbol} completada con éxito!`
      });
      refetchAllowanceB();
    }
  }, [rawMetadataB.isSuccess, rawMetadataB.txHash]);


  // LP balances del usuario
  const { balance: lpTokenBalance, refetch: refetchLpBalance } = useDEXPoolBalance(currentPoolAddress, address);

  // Acciones de DEXPool
  const { 
    agregarLiquidez: actionAgregarLiquidez, 
    removerLiquidez: actionRemoverLiquidez, 
    swap: actionSwap,
    hash: actionTxHash,
    isPending: isActionPending,
    isSuccess: isActionSuccess,
    error: actionError
  } = useDEXPoolActions(currentPoolAddress);

  // Fábrica para crear pools
  const {
    crearPool: factoryCrearPool,
    hash: factoryTxHash,
    isPending: isFactoryPending,
    isSuccess: isFactorySuccess,
    error: factoryError
  } = useDEXFactoryActions();



  // Estados de automatización de WETH
  const [lastWethAction, setLastWethAction] = useState<'wrap' | 'unwrap' | null>(null);
  const [unwrapAmountOnSuccess, setUnwrapAmountOnSuccess] = useState<bigint | null>(null);
  const [isWethAutoProcessing, setIsWethAutoProcessing] = useState(false);



  // Input de Swap
  const [swapAmountIn, setSwapAmountIn] = useState('');
  const [estimatedOut, setEstimatedOut] = useState('0.00');

  // Estados para añadir/remover liquidez
  const [addAmountA, setAddAmountA] = useState('');
  const [addAmountB, setAddAmountB] = useState('');
  const [removeLpAmount, setRemoveLpAmount] = useState('');
  const [activeActionType, setActiveActionType] = useState<'swap' | 'add_liquidity' | 'remove_liquidity' | null>(null);
  const [activeTab, setActiveTab] = useState<'swap' | 'add' | 'remove'>('swap');

  // Redirigir a swap si el par es conversión directa ETH-WETH
  useEffect(() => {
    if (isWethDirectSwap) {
      setActiveTab('swap');
    }
  }, [isWethDirectSwap]);

  // Mapear el orden de los tokens y reservas de la piscina activa
  const isTokenA0 = useMemo(() => {
    if (!tokenA || !poolToken0) return true;
    return tokenA.toLowerCase() === poolToken0.toLowerCase();
  }, [tokenA, poolToken0]);

  const reserveA = useMemo(() => {
    return isTokenA0 ? poolReserve0 : poolReserve1;
  }, [isTokenA0, poolReserve0, poolReserve1]);

  const reserveB = useMemo(() => {
    return isTokenA0 ? poolReserve1 : poolReserve0;
  }, [isTokenA0, poolReserve0, poolReserve1]);

  // Manejadores para auto-calcular montos de liquidez con proporción óptima
  const handleAddAmountAChange = (val: string) => {
    setAddAmountA(val);
    if (!val || isNaN(Number(val)) || parseFloat(val) <= 0) {
      setAddAmountB('');
      return;
    }
    if (poolExists && reserveA > 0n && reserveB > 0n) {
      try {
        const amtA = parseUnits(val, metadataA.decimals);
        const optB = calcularCantidad1Optima(amtA, reserveA, reserveB);
        setAddAmountB(formatUnits(optB, metadataB.decimals));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAddAmountBChange = (val: string) => {
    setAddAmountB(val);
    if (!val || isNaN(Number(val)) || parseFloat(val) <= 0) {
      setAddAmountA('');
      return;
    }
    if (poolExists && reserveA > 0n && reserveB > 0n) {
      try {
        const amtB = parseUnits(val, metadataB.decimals);
        const optA = calcularCantidad1Optima(amtB, reserveB, reserveA);
        setAddAmountA(formatUnits(optA, metadataA.decimals));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Estimaciones al retirar liquidez
  const estimatedReceiveA = useMemo(() => {
    if (!removeLpAmount || !poolTotalSupply || poolTotalSupply === 0n) return '0.0';
    try {
      const amtLP = parseUnits(removeLpAmount, 18);
      const amtA = (amtLP * reserveA) / poolTotalSupply;
      return formatUnits(amtA, metadataA.decimals);
    } catch {
      return '0.0';
    }
  }, [removeLpAmount, poolTotalSupply, reserveA, metadataA]);

  const estimatedReceiveB = useMemo(() => {
    if (!removeLpAmount || !poolTotalSupply || poolTotalSupply === 0n) return '0.0';
    try {
      const amtLP = parseUnits(removeLpAmount, 18);
      const amtB = (amtLP * reserveB) / poolTotalSupply;
      return formatUnits(amtB, metadataB.decimals);
    } catch {
      return '0.0';
    }
  }, [removeLpAmount, poolTotalSupply, reserveB, metadataB]);

  // Limpiar campos al cambiar tokens
  useEffect(() => {
    setAddAmountA('');
    setAddAmountB('');
    setRemoveLpAmount('');
    setSwapAmountIn('');
  }, [tokenA, tokenB]);

  // Estados de creación de Pool
  const [newPoolToken0, setNewPoolToken0] = useState<`0x${string}` | undefined>(undefined);
  const [newPoolToken1, setNewPoolToken1] = useState<`0x${string}` | undefined>(undefined);

  // Transacciones locales de la dApp
  const [transactions, setTransactions] = useState<DEXTransaction[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Selección automática de primeros tokens si existen
  useEffect(() => {
    if (selectableTokens.length >= 2 && !tokenA && !tokenB) {
      setTokenA(selectableTokens[0]);
      setTokenB(selectableTokens[1]);
    }
  }, [selectableTokens, tokenA, tokenB]);


  // Manejar el cambio automático de inputs al calcular Swap
  useEffect(() => {
    if (!tokenA || !tokenB) {
      setEstimatedOut('0.00');
      return;
    }

    if (isWethDirectSwap) {
      setEstimatedOut(swapAmountIn || '0.00');
      return;
    }

    if (!currentPoolAddress || currentPoolAddress === '0x0000000000000000000000000000000000000000') {
      setEstimatedOut('0.00');
      return;
    }

    try {
      const decimalsIn = metadataA.decimals;
      const decimalsOut = metadataB.decimals;

      const amtIn = parseUnits(swapAmountIn, decimalsIn);
      if (amtIn <= 0n) {
        setEstimatedOut('0.00');
        return;
      }

      // Ordenar las reservas de acuerdo a token0 y token1 del pool
      const isToken0 = tokenA.toLowerCase() === poolToken0?.toLowerCase();
      const resIn = isToken0 ? poolReserve0 : poolReserve1;
      const resOut = isToken0 ? poolReserve1 : poolReserve0;

      const out = calcularCantidadSalida(amtIn, resIn, resOut);
      setEstimatedOut(formatUnits(out, decimalsOut));
    } catch {
      setEstimatedOut('0.00');
    }
  }, [swapAmountIn, poolReserve0, poolReserve1, tokenA, tokenB, poolToken0, currentPoolAddress, metadataA, metadataB, isWethDirectSwap]);



  // Notificaciones flotantes con temporizador
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Transacción de fábrica completada con éxito
  useEffect(() => {
    if (isFactorySuccess && factoryTxHash && factoryTxHash !== lastProcessedFactoryHash) {
      setLastProcessedFactoryHash(factoryTxHash);
      setNotification({
        type: 'success',
        message: '¡Piscina de liquidez creada con éxito!'
      });
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: 'create_pool',
          description: 'Creación de piscina de liquidez',
          hash: factoryTxHash,
          timestamp: 'Justo ahora',
          status: 'exitoso',
        },
        ...prev,
      ]);
      refetchPools();
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [isFactorySuccess, factoryTxHash, lastProcessedFactoryHash, refetchPools]);

  // Transacción de pool completada con éxito
  useEffect(() => {
    if (isActionSuccess && actionTxHash && actionTxHash !== lastProcessedActionHash) {
      setLastProcessedActionHash(actionTxHash);
      let desc = 'Operación en Pool';
      let type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'create_pool' | 'weth' = 'swap';

      if (activeActionType === 'swap') {
        desc = 'Intercambio de tokens';
        type = 'swap';
        setSwapAmountIn('');
      } else if (activeActionType === 'add_liquidity') {
        desc = `Añadir liquidez ${metadataA.symbol}/${metadataB.symbol}`;
        type = 'add_liquidity';
        setAddAmountA('');
        setAddAmountB('');
      } else if (activeActionType === 'remove_liquidity') {
        desc = `Retirar liquidez ${metadataA.symbol}/${metadataB.symbol}`;
        type = 'remove_liquidity';
        setRemoveLpAmount('');
      }

      setNotification({
        type: 'success',
        message: `¡Transacción de ${desc.toLowerCase()} completada con éxito!`
      });

      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: type,
          description: desc,
          hash: actionTxHash,
          timestamp: 'Justo ahora',
          status: 'exitoso',
        },
        ...prev,
      ]);

      // Refrescar balances y reservas
      refetchPoolDetails();
      refetchBalanceA();
      refetchBalanceB();
      refetchLpBalance();
      refetchAllowanceA();
      refetchAllowanceB();
      refetchWethBalances();

      // Incrementar el trigger de refresco para actualizar todas las filas de piscina
      setRefreshTrigger((prev) => prev + 1);

      // Resetear la acción activa
      setActiveActionType(null);

      // Si la salida era ETH nativo virtual, ejecutamos automáticamente el Unwrap (withdraw)
      if (unwrapAmountOnSuccess) {
        setNotification({
          type: 'success',
          message: '¡Intercambio completado! Convirtiendo WETH a ETH...'
        });
        setLastWethAction('unwrap');
        wethWithdraw(unwrapAmountOnSuccess);
        setUnwrapAmountOnSuccess(null);
      }
    }
  }, [
    isActionSuccess,
    actionTxHash,
    lastProcessedActionHash,
    activeActionType,
    metadataA.symbol,
    metadataB.symbol,
    unwrapAmountOnSuccess,
    refetchPoolDetails,
    refetchBalanceA,
    refetchBalanceB,
    refetchLpBalance,
    refetchAllowanceA,
    refetchAllowanceB,
    refetchWethBalances,
    wethWithdraw
  ]);

  // Transacción de WETH completada con éxito
  useEffect(() => {
    if (isWethSuccess && wethTxHash && wethTxHash !== lastProcessedWethHash) {
      setLastProcessedWethHash(wethTxHash);
      const desc = lastWethAction === 'wrap' ? 'Envolver ETH' : 'Desenvolver WETH';
      setNotification({
        type: 'success',
        message: `¡Transacción de ${desc.toLowerCase()} completada con éxito!`
      });
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: 'weth',
          description: desc,
          hash: wethTxHash,
          timestamp: 'Justo ahora',
          status: 'exitoso',
        },
        ...prev,
      ]);
      setLastWethAction(null);
      refetchWethBalances();
      refetchBalanceA();
      refetchBalanceB();
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [isWethSuccess, wethTxHash, lastProcessedWethHash, lastWethAction, refetchWethBalances, refetchBalanceA, refetchBalanceB]);

  // Escuchar errores de transacciones
  useEffect(() => {
    if (actionError) {
      setNotification({
        type: 'error',
        message: `Error en la piscina: ${actionError.message || 'Error desconocido'}`
      });
    }
  }, [actionError]);

  useEffect(() => {
    if (factoryError) {
      setNotification({
        type: 'error',
        message: `Error al crear pool: ${factoryError.message || 'Error desconocido'}`
      });
    }
  }, [factoryError]);

  useEffect(() => {
    if (wethError) {
      setNotification({
        type: 'error',
        message: `Error en WETH: ${wethError.message || 'Error desconocido'}`
      });
      setLastWethAction(null);
    }
  }, [wethError]);

  // Copiar código de Solidity
  const handleCopyCode = () => {
    navigator.clipboard.writeText(solidityCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Función para aprobar un token (isA indica si es el token A o el B)
  const handleApprove = async (isA: boolean, amountStr: string, decimals: number) => {
    if (!currentPoolAddress || !amountStr) return;
    try {
      const amt = parseUnits(amountStr, decimals);
      if (isA) {
        approveA(currentPoolAddress, amt);
      } else {
        approveB(currentPoolAddress, amt);
      }
    } catch {
      setNotification({ type: 'error', message: 'Monto de aprobación no válido.' });
    }
  };

  // Ejecutar Swap
  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenA || !tokenB || !swapAmountIn) return;
    try {
      const amt = parseUnits(swapAmountIn, metadataA.decimals);

      // CASO 1: Wrap / Unwrap directo (ETH <-> WETH)
      if (
        (tokenA === ETH_ADDRESS && tokenB === WETH_ADDRESS) ||
        (tokenA === WETH_ADDRESS && tokenB === ETH_ADDRESS)
      ) {
        if (tokenA === ETH_ADDRESS) {
          setLastWethAction('wrap');
          wethDeposit(amt);
        } else {
          setLastWethAction('unwrap');
          wethWithdraw(amt);
        }
        return;
      }

      // CASO 2: Swap involucrando ETH nativo
      if (tokenA === ETH_ADDRESS) {
        // ETH -> Token: requiere envolver primero si no hay suficiente WETH
        const missingWeth = amt > wethBalance ? amt - wethBalance : 0n;
        if (missingWeth > 0n) {
          setNotification({
            type: 'success',
            message: 'Iniciando conversión de ETH a WETH para completar el intercambio...'
          });
          setLastWethAction('wrap');
          wethDeposit(missingWeth);
          return;
        }
        // Si hay suficiente WETH, procedemos con el swap estándar del pool usando WETH
        if (!currentPoolAddress) return;
        setActiveActionType('swap');
        actionSwap(WETH_ADDRESS, amt);
      } else if (tokenB === ETH_ADDRESS) {
        // Token -> ETH: Swap estándar Token -> WETH y luego Unwrap
        if (!currentPoolAddress) return;
        const estOutBigInt = parseUnits(estimatedOut, 18);
        setUnwrapAmountOnSuccess(estOutBigInt);
        setActiveActionType('swap');
        actionSwap(tokenA, amt);
      } else {
        // Swap estándar entre tokens ERC20 de fábrica
        if (!currentPoolAddress) return;
        setActiveActionType('swap');
        actionSwap(tokenA, amt);
      }
    } catch {
      setNotification({ type: 'error', message: 'Monto de intercambio no válido.' });
    }
  };

  // Ejecutar Añadir Liquidez
  const handleAddLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenA || !tokenB || !addAmountA || !addAmountB || !currentPoolAddress) return;
    try {
      const amtA = parseUnits(addAmountA, metadataA.decimals);
      const amtB = parseUnits(addAmountB, metadataB.decimals);
      
      const amt0 = isTokenA0 ? amtA : amtB;
      const amt1 = isTokenA0 ? amtB : amtA;
      
      setActiveActionType('add_liquidity');
      actionAgregarLiquidez(amt0, amt1);
    } catch {
      setNotification({ type: 'error', message: 'Montos de liquidez no válidos.' });
    }
  };

  // Ejecutar Retirar Liquidez
  const handleRemoveLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeLpAmount || !currentPoolAddress) return;
    try {
      const amtLP = parseUnits(removeLpAmount, 18);

      // Si alguno de los tokens es ETH nativo, calculamos cuánto WETH recibiremos
      // y configuramos el auto-unwrap para cuando se complete el retiro de liquidez.
      if (tokenA === ETH_ADDRESS) {
        const estWethToReceive = parseUnits(estimatedReceiveA, 18);
        setUnwrapAmountOnSuccess(estWethToReceive);
      } else if (tokenB === ETH_ADDRESS) {
        const estWethToReceive = parseUnits(estimatedReceiveB, 18);
        setUnwrapAmountOnSuccess(estWethToReceive);
      }

      setActiveActionType('remove_liquidity');
      actionRemoverLiquidez(amtLP);
    } catch {
      setNotification({ type: 'error', message: 'Monto de LP no válido.' });
    }
  };

  const handleSelectLpPercentage = (percentage: number) => {
    if (!lpTokenBalance) return;
    const amt = (lpTokenBalance * BigInt(percentage)) / 100n;
    setRemoveLpAmount(formatUnits(amt, 18));
  };



  // Crear piscina de liquidez
  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolToken0 || !newPoolToken1) return;

    // Resolver ETH nativo a WETH para la creación en fábrica, ya que las piscinas requieren tokens ERC20
    const token0Resolved = newPoolToken0.toLowerCase() === ETH_ADDRESS.toLowerCase() ? WETH_ADDRESS : newPoolToken0;
    const token1Resolved = newPoolToken1.toLowerCase() === ETH_ADDRESS.toLowerCase() ? WETH_ADDRESS : newPoolToken1;

    if (token0Resolved.toLowerCase() === token1Resolved.toLowerCase()) {
      setNotification({
        type: 'error',
        message: 'Los tokens deben ser diferentes (el ETH nativo se representa como WETH en las piscinas).'
      });
      return;
    }

    factoryCrearPool(token0Resolved, token1Resolved);
  };



  // Comprobación de requerimientos de aprobación para Swap
  const currentSwapAllowance = allowanceA;
  const currentSwapBalance = resolvedBalanceA;
  const currentSwapDecimals = metadataA.decimals;
  const currentSwapSymbol = metadataA.symbol;
  const swapAmountBigInt = swapAmountIn ? parseUnits(swapAmountIn, currentSwapDecimals) : 0n;
  
  // Si el token es ETH nativo, no requiere aprobación ERC20
  const isInputEth = tokenA === ETH_ADDRESS;
  const needsSwapApproval = isInputEth ? false : swapAmountBigInt > currentSwapAllowance;
  const hasEnoughSwapBalance = currentSwapBalance >= swapAmountBigInt;

  // Comprobaciones para Añadir Liquidez
  const addAmountBigIntA = addAmountA ? parseUnits(addAmountA, metadataA.decimals) : 0n;
  const addAmountBigIntB = addAmountB ? parseUnits(addAmountB, metadataB.decimals) : 0n;
  const needsAddApproveA = addAmountBigIntA > allowanceA;
  const needsAddApproveB = addAmountBigIntB > allowanceB;
  const hasEnoughAddBalanceA = tokenA === ETH_ADDRESS 
    ? (ethBalance + wethBalance) >= addAmountBigIntA 
    : resolvedBalanceA >= addAmountBigIntA;
  const hasEnoughAddBalanceB = tokenB === ETH_ADDRESS 
    ? (ethBalance + wethBalance) >= addAmountBigIntB 
    : resolvedBalanceB >= addAmountBigIntB;
  const isEthSelectedForLiquidity = tokenA === ETH_ADDRESS || tokenB === ETH_ADDRESS;

  const wethNeededForAdd = useMemo(() => {
    if (!tokenA || !tokenB) return 0n;
    if (tokenA === ETH_ADDRESS) return addAmountBigIntA;
    if (tokenB === ETH_ADDRESS) return addAmountBigIntB;
    return 0n;
  }, [tokenA, tokenB, addAmountBigIntA, addAmountBigIntB]);

  // Comprobaciones para Retirar Liquidez
  const removeLpBigInt = removeLpAmount ? parseUnits(removeLpAmount, 18) : 0n;
  const hasEnoughLpBalance = lpTokenBalance >= removeLpBigInt;


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
        <title>Simulador de Intercambio (DEX) - USACH dApp</title>
        <meta
          content="Interactúa con pools de liquidez y simula intercambios basados en la fórmula constante x * y = k."
          name="description"
        />
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
                {notification.type === 'success' ? 'Operación Exitosa' : 'Ocurrió un error'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px] break-all">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal - Completamente fluido (sin max-w) */}
      <main className="flex-1 w-full p-4 sm:p-8 space-y-8">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Volver al Inicio
            </Link>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl bg-gradient-to-r from-primary via-emerald-500 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
              <ArrowRightLeft className="h-8 w-8 text-primary animate-pulse" />
              Simulador de Intercambio Descentralizado (DEX)
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Explora cómo funcionan las piscinas de liquidez (Liquidity Pools) y la fórmula del creador de mercado automatizado ($x \cdot y = k$).
            </p>
          </div>
        </div>

      {/* Grid Educativo */}
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
          
          {/* Fórmulas y Teoría */}
          <Card className="xl:col-span-6 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-teal-500"></div>
            <div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Mecánica de un AMM
                </CardTitle>
                <CardDescription>
                  Cómo se determinan los precios, la liquidez y las transacciones en DeFi.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Tabs defaultValue="conceptos" className="w-full">
                  <TabsList className="w-full flex bg-muted/50 p-1 rounded-lg border border-border/10">
                    <TabsTrigger value="conceptos" className="flex-1 text-xs py-1.5 font-semibold">
                      Fundamentos
                    </TabsTrigger>
                    <TabsTrigger value="matematicas" className="flex-1 text-xs py-1.5 font-semibold">
                      Matemática (x * y = k)
                    </TabsTrigger>
                    <TabsTrigger value="variables" className="flex-1 text-xs py-1.5 font-semibold">
                      Variables de Estado
                    </TabsTrigger>
                    <TabsTrigger value="funciones" className="flex-1 text-xs py-1.5 font-semibold">
                      Funciones Clave
                    </TabsTrigger>
                  </TabsList>

                  {/* Fundamentos */}
                  <TabsContent value="conceptos" className="space-y-4 mt-4 text-sm text-muted-foreground">
                    <p>
                      Un <strong className="text-foreground font-semibold">Creador de Mercado Automatizado (AMM)</strong> es un tipo de protocolo de intercambio descentralizado (DEX) que utiliza fórmulas matemáticas para fijar el precio de los activos en lugar de un libro de órdenes tradicional.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="bg-muted/20 p-3 rounded-lg border border-border/10 space-y-1">
                        <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5 text-primary" /> Pools de Liquidez
                        </h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          En lugar de negociar directamente con contrapartes, los usuarios interactúan con un contrato inteligente que contiene reservas de dos tokens. Esto garantiza liquidez inmediata y constante sin intermediarios.
                        </p>
                      </div>
                      <div className="bg-muted/20 p-3 rounded-lg border border-border/10 space-y-1">
                        <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-emerald-500" /> Proveedores de Liquidez (LPs)
                        </h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          Cualquier usuario puede proveer liquidez depositando ambos tokens en proporciones de valor equivalentes. A cambio, reciben tokens LP que representan su participación proporcional en las reservas de la piscina.
                        </p>
                      </div>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex gap-2">
                      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-[11.5px] leading-relaxed text-primary-foreground/90">
                        <strong className="text-primary font-semibold">Incentivos de Comisión:</strong> Cada intercambio en el pool cobra una comisión fija de <strong className="text-foreground">0.3%</strong>. Esta comisión se suma directamente a las reservas del pool, aumentando el valor de los tokens LP que poseen los proveedores de liquidez cuando deciden retirarse.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Matemática */}
                  <TabsContent value="matematicas" className="space-y-4 mt-4 text-sm text-muted-foreground">
                    <p>
                      El pool utiliza la fórmula de producto constante popularizada por Uniswap V2 para determinar la relación de precios entre los tokens:
                    </p>
                    <div className="bg-muted/40 p-4 rounded-xl border border-border/20 space-y-2 text-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fórmula Base</p>
                      <p className="text-2xl font-mono font-black text-primary my-1">
                        x &middot; y = k
                      </p>
                      <p className="text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Donde <code className="text-foreground font-semibold">x</code> es la reserva del Token 0, <code className="text-foreground font-semibold">y</code> es la reserva del Token 1, y <code className="text-foreground font-semibold">k</code> es el producto constante que debe mantenerse invariante tras cada intercambio.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">Mecánica del Intercambio (Swap)</h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          Si un usuario deposita una cantidad &Delta;x de Token 0, la nueva reserva de Token 0 aumenta a x + &Delta;x. Para mantener k constante, la reserva de Token 1 debe reducirse a y - &Delta;y. Por ende, la cantidad de salida devuelta al usuario es:
                        </p>
                        <p className="text-xs font-mono font-bold bg-muted/30 p-2 rounded text-center border border-border/10 text-foreground">
                          &Delta;y = (y &middot; &Delta;x) / (x + &Delta;x)
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">Deslizamiento (Slippage)</h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          El precio de un activo se define marginalmente como P = y / x. Si la cantidad de intercambio &Delta;x es muy grande en comparación con la reserva x, el precio de ejecución final se desviará significativamente del precio marginal, resultando en un precio menos favorable (deslizamiento).
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Variables */}
                  <TabsContent value="variables" className="space-y-4 mt-4 text-sm text-muted-foreground">
                    <p>
                      El contrato <code className="text-foreground font-mono">DEXPool.sol</code> almacena de forma persistente en la blockchain de la EVM el estado de la piscina mediante las siguientes variables:
                    </p>
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5 border-b border-border/10 text-xs">
                        <span className="font-mono text-emerald-400 font-bold shrink-0">address public token0</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed">
                          Dirección del contrato inteligente del primer token ERC20 de la piscina (ordenado alfabéticamente para evitar duplicados del par).
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5 border-b border-border/10 text-xs">
                        <span className="font-mono text-emerald-400 font-bold shrink-0">address public token1</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed">
                          Dirección del contrato inteligente del segundo token ERC20 de la piscina.
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5 border-b border-border/10 text-xs">
                        <span className="font-mono text-primary font-bold shrink-0">uint256 public reserve0</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed">
                          Cantidad de reserva acumulada del <code className="text-foreground">token0</code>. Se actualiza al final de cada operación de swap o liquidez.
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5 border-b border-border/10 text-xs">
                        <span className="font-mono text-primary font-bold shrink-0">uint256 public reserve1</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed">
                          Cantidad de reserva acumulada del <code className="text-foreground">token1</code>. Se sincroniza consultando el balance del contrato inteligente.
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1.5 border-b border-border/10 text-xs">
                        <span className="font-mono text-purple-400 font-bold shrink-0">totalSupply / balanceOf</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed">
                          Heredadas de <code className="text-foreground font-mono">ERC20</code>. Registran la emisión total de tokens LP de la piscina y cuántos posee cada proveedor de liquidez.
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Funciones */}
                  <TabsContent value="funciones" className="space-y-4 mt-4 text-sm text-muted-foreground">
                    <p>
                      Las funciones principales del contrato inteligente controlan la lógica transaccional y la transferencia de valor en la EVM:
                    </p>
                    <div className="space-y-3 text-xs">
                      <div className="bg-muted/15 p-3 rounded-lg border border-border/10 space-y-1.5">
                        <span className="font-mono text-emerald-400 font-bold block">swap(address tokenEntrada, uint256 cantidadEntrada)</span>
                        <p className="text-muted-foreground leading-relaxed">
                          Función externa que permite realizar intercambios. Identifica si el token entrante es `token0` o `token1`, lee las reservas asociadas, aplica una tarifa del 0.3% (<code className="text-foreground font-mono">cantidadEntrada * 997 / 1000</code>) y calcula los tokens de salida mediante el producto constante.
                        </p>
                        <div className="flex flex-col gap-1 pl-3 border-l-2 border-primary/40 font-mono text-[10px] text-muted-foreground">
                          <span>1. Requerimiento: Transferencia desde el usuario al pool (transferFrom)</span>
                          <span>2. Transferencia: Envío de los tokens de salida al usuario (transfer)</span>
                          <span>3. Sincronización: Actualización de reserve0 y reserve1 con balanceOf(address(this))</span>
                        </div>
                      </div>
                      <div className="bg-muted/15 p-3 rounded-lg border border-border/10 space-y-1">
                        <span className="font-mono text-primary font-bold block">nonReentrant (ReentrancyGuard)</span>
                        <p className="text-muted-foreground leading-relaxed">
                          Modificador de seguridad aplicado a las funciones de mutación. Evita ataques de reentrada donde un contrato malicioso intenta llamar de nuevo a la función `swap` o retirar fondos en medio del flujo de ejecución antes de que se actualicen las reservas locales.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </div>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-primary" /> Usa las pestañas para explorar cada sección del AMM en detalle.
              </span>
            </CardFooter>
          </Card>

          {/* Código de Solidity del DEX */}
          <Card className="xl:col-span-4 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 to-emerald-500"></div>
            <div>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                    <Code className="h-5 w-5 text-emerald-500" />
                    Código Solidity del Pool
                  </CardTitle>
                  <CardDescription>
                    Implementación simplificada del cálculo matemático en EVM.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border/60 hover:bg-muted/80 transition-colors"
                  onClick={handleCopyCode}
                  title="Copiar código"
                >
                  {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="relative rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-inner group/code">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono">
                    <span>DEXPool.sol</span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      solc 0.8.20
                    </span>
                  </div>
                  <pre className="text-[10px] sm:text-[11px] font-mono p-4 overflow-x-auto leading-relaxed text-zinc-300 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                    <code>
                      <span className="text-zinc-500">// SPDX-License-Identifier: MIT</span>{"\n"}
                      <span className="text-pink-500">pragma</span> <span className="text-amber-500">solidity</span> <span className="text-blue-400">^0.8.20</span>;{"\n\n"}
                      <span className="text-pink-500">import</span> <span className="text-emerald-400">"@openzeppelin/contracts/token/ERC20/ERC20.sol"</span>;{"\n"}
                      <span className="text-pink-500">import</span> <span className="text-emerald-400">"@openzeppelin/contracts/utils/ReentrancyGuard.sol"</span>;{"\n\n"}
                      <span className="text-blue-500">contract</span> <span className="text-yellow-400 font-bold">DEXPool</span> <span className="text-pink-500">is</span> <span className="text-yellow-400">ERC20</span>, <span className="text-yellow-400">ReentrancyGuard</span> {"{"}{"\n"}
                      {"    "}<span className="text-yellow-400">IERC20</span> <span className="text-pink-500">public</span> <span className="text-pink-500">immutable</span> token0;{"\n"}
                      {"    "}<span className="text-yellow-400">IERC20</span> <span className="text-pink-500">public</span> <span className="text-pink-500">immutable</span> token1;{"\n"}
                      {"    "}<span className="text-blue-400">uint256</span> <span className="text-pink-500">public</span> reserve0;{"\n"}
                      {"    "}<span className="text-blue-400">uint256</span> <span className="text-pink-500">public</span> reserve1;{"\n\n"}
                      {"    "}<span className="text-zinc-500">// x * y = k (Fórmula de producto constante)</span>{"\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">swap</span>({"\n"}
                      {"        "}<span className="text-blue-400">address</span> tokenEntrada,{"\n"}
                      {"        "}<span className="text-blue-400">uint256</span> cantidadEntrada{"\n"}
                      {"    "}) <span className="text-pink-500">external</span> <span className="text-amber-500">nonReentrant</span> <span className="text-pink-500">returns</span> (<span className="text-blue-400">uint256</span> cantidadSalida) {"{"}{"\n"}
                      {"        "}<span className="text-blue-400">bool</span> esToken0 = tokenEntrada == <span className="text-blue-400">address</span>(token0);{"\n"}
                      {"        "}(<span className="text-blue-400">uint256</span> resIn, <span className="text-blue-400">uint256</span> resOut) = esToken0{"\n"}
                      {"            "}? (reserve0, reserve1){"\n"}
                      {"            "}: (reserve1, reserve0);{"\n\n"}
                      {"        "}<span className="text-zinc-500">// 0.3% de comisión (997/1000)</span>{"\n"}
                      {"        "}<span className="text-blue-400">uint256</span> entradaConTarifa = cantidadEntrada * <span className="text-blue-400">997</span>;{"\n"}
                      {"        "}<span className="text-blue-400">uint256</span> numerador = entradaConTarifa * resOut;{"\n"}
                      {"        "}<span className="text-blue-400">uint256</span> denominador = (resIn * <span className="text-blue-400">1000</span>) + entradaConTarifa;{"\n"}
                      {"        "}cantidadSalida = numerador / denominador;{"\n\n"}
                      {"        "}<span className="text-yellow-400">IERC20</span>(tokenEntrada).<span className="text-purple-400">transferFrom</span>(<span className="text-violet-400">msg.sender</span>, <span className="text-blue-400">address</span>(<span className="text-pink-500">this</span>), cantidadEntrada);{"\n"}
                      {"        "}<span className="text-yellow-400">IERC20</span>(esToken0 ? token1 : token0).<span className="text-purple-400">transfer</span>(<span className="text-violet-400">msg.sender</span>, cantidadSalida);{"\n\n"}
                      {"        "}reserve0 = token0.<span className="text-purple-400">balanceOf</span>(<span className="text-blue-400">address</span>(<span className="text-pink-500">this</span>));{"\n"}
                      {"        "}reserve1 = token1.<span className="text-purple-400">balanceOf</span>(<span className="text-blue-400">address</span>(<span className="text-pink-500">this</span>));{"\n"}
                      {"    "}{"}"}{"\n"}
                      {"}"}
                    </code>
                  </pre>
                </div>
              </CardContent>
            </div>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
              <span className="text-[10.5px] text-muted-foreground">
                * Implementa el cálculo con mitigación de reentrada mediante ReentrancyGuard.
              </span>
            </CardFooter>
          </Card>
        </div>

        {/* Sección Inferior: Interfaz de Usuario e Interacción */}
        {!isConnected || !address ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/60 rounded-2xl bg-card/25 text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4 text-primary border border-primary/20 shadow-inner">
              <Coins className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold tracking-tight text-foreground">Conecta tu Billetera Web3</h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Para poder crear piscinas de liquidez, añadir tokens y realizar swaps simulados en la red local de pruebas, necesitas vincular una billetera compatible con EVM.
              </p>
            </div>
            <div className="pt-2">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Panel Izquierdo: Operaciones de Swap y Liquidez */}
            <div className="lg:col-span-2 space-y-8">
              
              <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-emerald-500 to-primary"></div>
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'swap' | 'add' | 'remove')} className="w-full">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Layers className="h-5 w-5 text-primary" />
                          {isWethDirectSwap ? "Conversión de WETH" : "Operaciones de Pool"}
                        </CardTitle>
                        <CardDescription>
                          {isWethDirectSwap 
                            ? "Envuelve o desenvuelve ETH directamente sin usar una piscina."
                            : "Intercambia tokens o gestiona tu liquidez."}
                        </CardDescription>
                      </div>
                      <TabsList className={`${isWethDirectSwap ? 'hidden' : 'grid grid-cols-3'} bg-muted/50 p-1 rounded-lg border border-border/10`}>
                        <TabsTrigger value="swap" className="text-xs font-semibold px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          Swap
                        </TabsTrigger>
                        <TabsTrigger value="add" className="text-xs font-semibold px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          + Liquidez
                        </TabsTrigger>
                        <TabsTrigger value="remove" className="text-xs font-semibold px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          - Liquidez
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-2">
                    {!tokenA || !tokenB ? (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        Debes seleccionar ambos tokens para comenzar.
                      </div>
                    ) : isLoadingCurrentPool ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {/* TAB SWAP */}
                        <TabsContent value="swap" className="mt-0">
                          <form onSubmit={handleSwap} className="space-y-4">
                            <div className="space-y-4">
                              {/* Input Token Entrada */}
                              <div className="bg-muted/30 p-3 rounded-xl border border-border/20 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <Label className="text-muted-foreground font-medium">Tú entregas:</Label>
                                  <span className="font-mono text-[10.5px] text-muted-foreground">
                                    Saldo: {parseFloat(formatUnits(currentSwapBalance, currentSwapDecimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} {currentSwapSymbol}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={swapAmountIn}
                                    onChange={(e) => setSwapAmountIn(e.target.value)}
                                    className="border-none bg-transparent shadow-none text-lg font-mono flex-1 p-0 focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none"
                                    required
                                    min="0"
                                    step="any"
                                  />
                                  <div className="flex items-center gap-1.5 bg-card/60 px-3 py-1.5 rounded-lg border border-border/40 shrink-0">
                                    <TokenIcon address={tokenA || ''} className="h-5 w-5" />
                                    <select
                                      value={tokenA || ''}
                                      onChange={(e) => setTokenA(e.target.value as `0x${string}`)}
                                      className="bg-transparent border-none text-xs font-bold text-foreground focus:outline-none focus:ring-0 cursor-pointer"
                                    >
                                      {selectableTokens
                                        .filter((addr) => addr !== tokenB)
                                        .map((addr) => (
                                          <TokenOptionItem key={addr} tokenAddress={addr} userAddress={address} />
                                        ))}
                                    </select>
                                  </div>
                                </div>
                              </div>

                              {/* Icono de Dirección de Swap */}
                              <div className="flex justify-center -my-2.5">
                                <div className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors p-2 rounded-full cursor-pointer shadow-inner"
                                  onClick={() => {
                                    const temp = tokenA;
                                    setTokenA(tokenB);
                                    setTokenB(temp);
                                  }}
                                >
                                  <ArrowDownUp className="h-4 w-4" />
                                </div>
                              </div>

                              {/* Output Estimado */}
                              <div className="bg-muted/30 p-3 rounded-xl border border-border/20 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <Label className="text-muted-foreground font-medium">Tú recibes (estimado):</Label>
                                  <span className="font-mono text-[10.5px] text-muted-foreground">
                                    Saldo: {parseFloat(formatUnits(resolvedBalanceB, metadataB.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} {metadataB.symbol}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Input
                                    type="text"
                                    readOnly
                                    value={parseFloat(estimatedOut) > 0 ? parseFloat(estimatedOut).toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.0'}
                                    className="border-none bg-transparent shadow-none text-lg font-mono flex-1 p-0 focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none cursor-default"
                                  />
                                  <div className="flex items-center gap-1.5 bg-card/60 px-3 py-1.5 rounded-lg border border-border/40 shrink-0">
                                    <TokenIcon address={tokenB || ''} className="h-5 w-5" />
                                    <select
                                      value={tokenB || ''}
                                      onChange={(e) => setTokenB(e.target.value as `0x${string}`)}
                                      className="bg-transparent border-none text-xs font-bold text-foreground focus:outline-none focus:ring-0 cursor-pointer"
                                    >
                                      {selectableTokens
                                        .filter((addr) => addr !== tokenA)
                                        .map((addr) => (
                                          <TokenOptionItem key={addr} tokenAddress={addr} userAddress={address} />
                                        ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Mensajes de error de fondos */}
                            {swapAmountIn && !hasEnoughSwapBalance && (
                              <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>Saldo insuficiente de {currentSwapSymbol} en tu billetera.</span>
                              </div>
                            )}

                            {/* Mensaje de piscina inexistente */}
                            {!poolExists && !isWethDirectSwap && (
                              <div className="flex flex-col gap-2.5 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                                <div className="flex items-start gap-1.5">
                                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                  <span>No existe una piscina de liquidez para el par {metadataA.symbol} / {metadataB.symbol}. Primero debes crear la piscina de liquidez para este par.</span>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-[10px] h-7 px-3 self-start border-amber-500/30 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 font-bold font-sans"
                                  onClick={() => {
                                    setNewPoolToken0(tokenA);
                                    setNewPoolToken1(tokenB);
                                    document.getElementById('create-pool-card')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                >
                                  Configurar Creación de Piscina
                                </Button>
                              </div>
                            )}

                            {/* Botón de Acción de Swap */}
                            {!poolExists && !isWethDirectSwap ? (
                              <Button
                                type="button"
                                disabled
                                className="w-full font-bold shadow-md opacity-60 cursor-not-allowed"
                              >
                                Intercambio no disponible (Sin Piscina)
                              </Button>
                            ) : (tokenA === ETH_ADDRESS && swapAmountBigInt > wethBalance) ? (
                              <Button
                                type="button"
                                onClick={handleSwap}
                                disabled={isWethPending}
                                className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                {isWethPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Convirtiendo ETH a WETH...
                                  </>
                                ) : (
                                  <>
                                    1. Envolver {parseFloat(formatUnits(swapAmountBigInt - wethBalance, 18)).toFixed(4)} ETH a WETH
                                  </>
                                )}
                              </Button>
                            ) : needsSwapApproval && hasEnoughSwapBalance ? (
                              <Button
                                type="button"
                                onClick={() => handleApprove(true, swapAmountIn, currentSwapDecimals)}
                                disabled={isPendingApproveA}
                                className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform"
                              >
                                {isPendingApproveA ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Aprobando {currentSwapSymbol}...
                                  </>
                                ) : (
                                  <>
                                    Aprobar {currentSwapSymbol} para Swap
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                type="submit"
                                disabled={isActionPending || !swapAmountIn || !hasEnoughSwapBalance || parseFloat(swapAmountIn) <= 0}
                                className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform"
                              >
                                {isActionPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Procesando Intercambio...
                                  </>
                                ) : (
                                  <>
                                    {tokenA === ETH_ADDRESS && tokenB === WETH_ADDRESS ? "Envolver ETH (Wrap)" : 
                                     tokenA === WETH_ADDRESS && tokenB === ETH_ADDRESS ? "Desenvolver WETH (Unwrap)" : 
                                     "Intercambiar (Swap)"}
                                  </>
                                )}
                              </Button>
                            )}
                          </form>
                        </TabsContent>

                        {/* TAB ADD LIQUIDITY */}
                        <TabsContent value="add" className="mt-0">
                          <form onSubmit={handleAddLiquidity} className="space-y-4">
                            {/* Información si no existe piscina */}
                            {!poolExists && (
                              <div className="flex flex-col gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-lg text-xs">
                                <div className="flex items-start gap-1.5">
                                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>¡Piscina no inicializada!</strong> Al ser el primer proveedor, definirás el precio inicial. Debes crear la piscina primero antes de agregar fondos, o configurar la creación abajo.
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-[10px] h-7 px-3 self-start border-blue-500/30 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-bold font-sans"
                                  onClick={() => {
                                    setNewPoolToken0(tokenA);
                                    setNewPoolToken1(tokenB);
                                    document.getElementById('create-pool-card')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                >
                                  Configurar Creación de Piscina
                                </Button>
                              </div>
                            )}

                            <div className="space-y-4">
                              {/* Token A Input */}
                              <div className="bg-muted/30 p-3 rounded-xl border border-border/20 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <Label className="text-muted-foreground font-medium">Cantidad de {metadataA.symbol}:</Label>
                                  <span className="font-mono text-[10.5px] text-muted-foreground">
                                    Saldo: {parseFloat(formatUnits(resolvedBalanceA, metadataA.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} {metadataA.symbol}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={addAmountA}
                                    onChange={(e) => handleAddAmountAChange(e.target.value)}
                                    className="border-none bg-transparent shadow-none text-lg font-mono flex-1 p-0 focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none"
                                    disabled={!poolExists}
                                    required
                                    min="0"
                                    step="any"
                                  />
                                  <div className="flex items-center gap-1.5 bg-card/60 px-3 py-1.5 rounded-lg border border-border/40 shrink-0">
                                    <TokenIcon address={tokenA || ''} className="h-5 w-5" />
                                    <select
                                      value={tokenA || ''}
                                      onChange={(e) => setTokenA(e.target.value as `0x${string}`)}
                                      className="bg-transparent border-none text-xs font-bold text-foreground focus:outline-none focus:ring-0 cursor-pointer"
                                    >
                                      {selectableTokens
                                        .filter((addr) => addr !== tokenB)
                                        .map((addr) => (
                                          <TokenOptionItem key={addr} tokenAddress={addr} userAddress={address} />
                                        ))}
                                    </select>
                                  </div>
                                </div>
                              </div>

                              {/* Separador + */}
                              <div className="flex justify-center -my-2.5">
                                <div className="bg-primary/10 border border-primary/20 text-primary p-2 rounded-full shadow-inner">
                                  <Plus className="h-4 w-4" />
                                </div>
                              </div>

                              {/* Token B Input */}
                              <div className="bg-muted/30 p-3 rounded-xl border border-border/20 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <Label className="text-muted-foreground font-medium">Cantidad de {metadataB.symbol}:</Label>
                                  <span className="font-mono text-[10.5px] text-muted-foreground">
                                    Saldo: {parseFloat(formatUnits(resolvedBalanceB, metadataB.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} {metadataB.symbol}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={addAmountB}
                                    onChange={(e) => handleAddAmountBChange(e.target.value)}
                                    className="border-none bg-transparent shadow-none text-lg font-mono flex-1 p-0 focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none"
                                    disabled={!poolExists}
                                    required
                                    min="0"
                                    step="any"
                                  />
                                  <div className="flex items-center gap-1.5 bg-card/60 px-3 py-1.5 rounded-lg border border-border/40 shrink-0">
                                    <TokenIcon address={tokenB || ''} className="h-5 w-5" />
                                    <select
                                      value={tokenB || ''}
                                      onChange={(e) => setTokenB(e.target.value as `0x${string}`)}
                                      className="bg-transparent border-none text-xs font-bold text-foreground focus:outline-none focus:ring-0 cursor-pointer"
                                    >
                                      {selectableTokens
                                        .filter((addr) => addr !== tokenA)
                                        .map((addr) => (
                                          <TokenOptionItem key={addr} tokenAddress={addr} userAddress={address} />
                                        ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Mostrar proporción si hay reservas */}
                            {poolExists && reserveA > 0n && reserveB > 0n && (
                              <div className="bg-muted/15 p-3 rounded-xl border border-border/10 text-xs text-muted-foreground space-y-1">
                                <span className="font-semibold text-foreground block">Proporción del Pool:</span>
                                <div className="flex justify-between">
                                  <span>1 {metadataA.symbol} =</span>
                                  <span className="font-mono text-foreground font-semibold">
                                    {(Number(reserveB) / 10**metadataB.decimals / (Number(reserveA) / 10**metadataA.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} {metadataB.symbol}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>1 {metadataB.symbol} =</span>
                                  <span className="font-mono text-foreground font-semibold">
                                    {(Number(reserveA) / 10**metadataA.decimals / (Number(reserveB) / 10**metadataB.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} {metadataA.symbol}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Errores de saldo */}
                            {addAmountA && !hasEnoughAddBalanceA && (
                              <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>Saldo insuficiente de {metadataA.symbol}.</span>
                              </div>
                            )}
                            {addAmountB && !hasEnoughAddBalanceB && (
                              <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>Saldo insuficiente de {metadataB.symbol}.</span>
                              </div>
                            )}

                            {/* Botones de acción */}
                            {!poolExists ? (
                              <Button type="button" disabled className="w-full font-bold shadow-md opacity-60 cursor-not-allowed">
                                Piscina No Creada
                              </Button>
                            ) : wethNeededForAdd > wethBalance ? (
                              <Button
                                type="button"
                                onClick={() => {
                                  setLastWethAction('wrap');
                                  wethDeposit(wethNeededForAdd - wethBalance);
                                }}
                                disabled={isWethPending}
                                className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                {isWethPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Convirtiendo ETH a WETH...
                                  </>
                                ) : (
                                  <>
                                    1. Envolver {parseFloat(formatUnits(wethNeededForAdd - wethBalance, 18)).toFixed(4)} ETH a WETH
                                  </>
                                )}
                              </Button>
                            ) : needsAddApproveA && hasEnoughAddBalanceA ? (
                              <Button
                                type="button"
                                onClick={() => handleApprove(true, addAmountA, metadataA.decimals)}
                                disabled={isPendingApproveA}
                                className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform bg-primary text-primary-foreground"
                              >
                                {isPendingApproveA ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Aprobando {metadataA.symbol}...
                                  </>
                                ) : (
                                  <>Aprobar {metadataA.symbol}</>
                                )}
                              </Button>
                            ) : needsAddApproveB && hasEnoughAddBalanceB ? (
                              <Button
                                type="button"
                                onClick={() => handleApprove(false, addAmountB, metadataB.decimals)}
                                disabled={isPendingApproveB}
                                className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform bg-primary text-primary-foreground"
                              >
                                {isPendingApproveB ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Aprobando {metadataB.symbol}...
                                  </>
                                ) : (
                                  <>Aprobar {metadataB.symbol}</>
                                )}
                              </Button>
                            ) : (
                              <Button
                                type="submit"
                                disabled={isActionPending || !addAmountA || !addAmountB || !hasEnoughAddBalanceA || !hasEnoughAddBalanceB}
                                className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {isActionPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Añadiendo Liquidez...
                                  </>
                                ) : (
                                  <>Añadir Liquidez</>
                                )}
                              </Button>
                            )}
                          </form>

                          {/* Guía Académica y Mecanismos de Liquidez */}
                          <div className="mt-6 border border-border/40 rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm transition-all duration-300">
                            <button
                              type="button"
                              onClick={() => setShowAddLiquidityGuide(!showAddLiquidityGuide)}
                              className="flex items-center justify-between w-full p-4 text-left text-xs font-semibold text-foreground/90 hover:text-foreground bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <BookOpen className="h-4.5 w-4.5 text-primary shrink-0" />
                                <span>Guía Académica: Mecanismos de Provisión de Liquidez</span>
                              </span>
                              {showAddLiquidityGuide ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>

                            {showAddLiquidityGuide && (
                              <div className="p-4 border-t border-border/20 space-y-4 text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-250">
                                {/* Sección 1: Aprobación de Tokens */}
                                <div className="space-y-1.5">
                                  <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 font-sans">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold font-sans">1</span>
                                    ¿Por qué se requiere la Aprobación (Approve)?
                                  </h5>
                                  <p className="pl-6 text-[11px]">
                                    En la blockchain de Ethereum (EVM), el estándar <strong className="text-foreground">ERC-20</strong> posee una medida de seguridad fundamental: los contratos externos no pueden transferir tus tokens de forma autónoma.
                                  </p>
                                  <div className="ml-6 bg-muted/15 p-2.5 rounded-lg border border-border/10 mt-1.5 font-mono text-[10px] space-y-1 text-foreground/90">
                                    <p className="font-bold text-emerald-400">Paso 1: Approve (Aprobar gasto)</p>
                                    <p className="text-muted-foreground">Otorga permiso al contrato inteligente del DEX para mover hasta una cantidad específica de tokens en tu nombre.</p>
                                    <p className="font-bold text-primary mt-2">Paso 2: TransferFrom (Transferencia interna)</p>
                                    <p className="text-muted-foreground">El contrato del DEX ejecuta la transacción consumiendo la aprobación y depositando tus tokens en las reservas del pool.</p>
                                  </div>
                                  <p className="pl-6 text-[11px] mt-1.5">
                                    Esto garantiza que ningún protocolo pueda vulnerar tu saldo sin tu firma explícita, manteniendo el control absoluto de tus activos.
                                  </p>
                                </div>

                                {/* Sección 2: Depósito Proporcional */}
                                <div className="space-y-1.5">
                                  <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 font-sans">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold font-sans">2</span>
                                    El Mecanismo de Depósito Proporcional
                                  </h5>
                                  <p className="pl-6 text-[11px]">
                                    Los Creadores de Mercado Automatizados (AMM) de producto constante (<code className="text-foreground font-mono">x &middot; y = k</code>) exigen que las reservas de ambos tokens mantengan una relación de valor equilibrada.
                                  </p>
                                  <div className="ml-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-card/45 p-3 rounded-lg border border-border/20 space-y-1 text-center">
                                      <span className="text-[10px] uppercase font-bold text-muted-foreground font-sans">Ratio del Pool</span>
                                      <p className="text-sm font-mono text-emerald-400 font-bold">R = x / y</p>
                                      <p className="text-[10px] text-muted-foreground">Relación de precios entre las reservas del Token A (x) y Token B (y).</p>
                                    </div>
                                    <div className="bg-card/45 p-3 rounded-lg border border-border/20 space-y-1 text-center">
                                      <span className="text-[10px] uppercase font-bold text-muted-foreground font-sans">Fórmula de Depósito</span>
                                      <p className="text-sm font-mono text-primary font-bold">&Delta;y = &Delta;x &middot; (y / x)</p>
                                      <p className="text-[10px] text-muted-foreground">La cantidad a depositar del segundo activo debe ser proporcional al ratio del pool.</p>
                                    </div>
                                  </div>
                                  <p className="pl-6 text-[11px] mt-1.5">
                                    Depositar ambos activos de forma proporcional asegura que no se altere el precio marginal del pool al momento del depósito, protegiendo al proveedor de liquidez de un arbitraje inmediato perjudicial.
                                  </p>
                                </div>

                                {/* Sección 3: Casos de Reserva */}
                                <div className="space-y-1.5">
                                  <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 font-sans">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold font-sans">3</span>
                                    Casos de Provisión según las Reservas del Pool
                                  </h5>
                                  <div className="pl-6 space-y-2">
                                    <div className="bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-lg">
                                      <strong className="text-amber-500 block font-semibold mb-0.5 text-[11px] font-sans">Caso A: Pools sin Reservas (0 Reservas)</strong>
                                      <p className="text-muted-foreground text-[11px]">
                                        Si eres el primer proveedor de liquidez, el pool no tiene fondos y <strong>no existe un ratio inicial</strong>. En este caso, eres libre de establecer la proporción que desees. La relación de los montos que aportes determinará el precio inicial del par en el pool. 
                                        <em className="block mt-1 text-[10.5px] text-amber-500/90 font-sans">
                                          ¡Atención! Si estableces un precio muy alejado del mercado real, los bots de arbitraje extraerán valor rápidamente a tu costa.
                                        </em>
                                      </p>
                                    </div>
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg">
                                      <strong className="text-emerald-500 block font-semibold mb-0.5 text-[11px] font-sans">Caso B: Pools con Liquidez Activa (Reservas &gt; 0)</strong>
                                      <p className="text-muted-foreground text-[11px]">
                                        Cuando el pool ya posee liquidez, la tasa de intercambio está predefinida matemáticamente. Es <strong>obligatorio depositar activos de forma estrictamente proporcional</strong> al ratio actual. Si intentas enviar un depósito asimétrico, el contrato inteligente del enrutador ajustará el depósito o lo rechazará para evitar ineficiencias matemáticas y proteger el equilibrio del pool.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Sección 4: Wrapped Ether (WETH) */}
                                <div className="space-y-1.5">
                                  <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 font-sans">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold font-sans">4</span>
                                    Wrapped Ether (WETH): El Estándar y Paridad 1:1
                                  </h5>
                                  <p className="pl-6 text-[11px]">
                                    En este DEX, al igual que en la mayoría de los protocolos DeFi modernos, verás que se utiliza <strong className="text-foreground">WETH</strong> en lugar de ETH nativo para la provisión de liquidez y los intercambios en pools.
                                  </p>
                                  <div className="pl-6 space-y-2">
                                    <div className="bg-blue-500/5 border border-blue-500/20 p-2.5 rounded-lg">
                                      <strong className="text-blue-400 block font-semibold mb-0.5 text-[11px] font-sans">¿Qué es WETH y la paridad 1:1?</strong>
                                      <p className="text-muted-foreground text-[11px]">
                                        WETH (Wrapped Ether) es la versión tokenizada de Ether (ETH). A diferencia del ETH nativo, WETH se comporta estrictamente como un token <strong className="text-foreground">ERC-20</strong>. Se mantiene una relación inquebrantable de <strong className="text-foreground">1:1 con ETH</strong>: puedes depositar (envolver) 1 ETH en el contrato de WETH para recibir exactamente 1 WETH, o quemar (desenvolver) 1 WETH para recuperar 1 ETH nativo en cualquier momento.
                                      </p>
                                    </div>
                                    <div className="bg-indigo-500/5 border border-indigo-500/20 p-2.5 rounded-lg">
                                      <strong className="text-indigo-400 block font-semibold mb-0.5 text-[11px] font-sans">¿Por qué es indispensable utilizarlo?</strong>
                                      <p className="text-muted-foreground text-[11px]">
                                        El Ether (ETH) es el activo nativo de la red y fue creado antes de que se diseñara el estándar de tokens ERC-20. Como consecuencia, carece de funciones estándar como <code className="text-foreground font-mono">approve()</code>, <code className="text-foreground font-mono">transferFrom()</code> o <code className="text-foreground font-mono">allowance()</code>. Los contratos inteligentes de piscinas de liquidez requieren que todos sus activos participantes utilicen interfaces homogéneas para ejecutar transferencias automáticas y seguras. Al "envolver" tu ETH en WETH, permites que el DEX gestione el Ether con la misma lógica uniforme que cualquier otro token ERC-20 de la red.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* TAB REMOVE LIQUIDITY */}
                        <TabsContent value="remove" className="mt-0">
                          <form onSubmit={handleRemoveLiquidity} className="space-y-4">
                            {!poolExists && (
                              <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>No existe piscina de liquidez para este par.</span>
                              </div>
                            )}

                            {poolExists && (
                              <div className="space-y-4">
                                {/* Entrada de LP */}
                                <div className="bg-muted/30 p-3 rounded-xl border border-border/20 space-y-2">
                                  <div className="flex justify-between items-center text-xs">
                                    <Label className="text-muted-foreground font-medium">Cantidad de Tokens LP a quemar:</Label>
                                    <span className="font-mono text-[10.5px] text-muted-foreground">
                                      Tu saldo LP: {parseFloat(formatUnits(lpTokenBalance || 0n, 18)).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Input
                                      type="number"
                                      placeholder="0.0"
                                      value={removeLpAmount}
                                      onChange={(e) => setRemoveLpAmount(e.target.value)}
                                      className="border-none bg-transparent shadow-none text-lg font-mono flex-1 p-0 focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none"
                                      required
                                      min="0"
                                      step="any"
                                    />
                                    <span className="text-xs font-bold text-muted-foreground bg-card/60 px-2.5 py-1.5 rounded-lg border border-border/40 shrink-0">
                                      LP Tokens
                                    </span>
                                  </div>
                                </div>

                                {/* Porcentajes rápidos */}
                                <div className="grid grid-cols-4 gap-2">
                                  {[25, 50, 75, 100].map((pct) => (
                                    <Button
                                      key={pct}
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      disabled={!lpTokenBalance || lpTokenBalance === 0n}
                                      className="text-xs h-8 border-border/60 hover:bg-muted/80 font-semibold"
                                      onClick={() => handleSelectLpPercentage(pct)}
                                    >
                                      {pct}%
                                    </Button>
                                  ))}
                                </div>

                                {/* Estimación de Retorno */}
                                <div className="bg-muted/15 p-4 rounded-xl border border-border/10 space-y-3">
                                  <span className="text-xs font-semibold text-foreground block">Recibirás (estimado):</span>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 bg-card/40 p-2.5 rounded-lg border border-border/20">
                                      <TokenIcon address={tokenA || ''} className="h-5 w-5" />
                                      <div className="flex flex-col">
                                        <span className="text-xs font-mono font-bold text-foreground">
                                          {parseFloat(estimatedReceiveA).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">{metadataA.symbol}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-card/40 p-2.5 rounded-lg border border-border/20">
                                      <TokenIcon address={tokenB || ''} className="h-5 w-5" />
                                      <div className="flex flex-col">
                                        <span className="text-xs font-mono font-bold text-foreground">
                                          {parseFloat(estimatedReceiveB).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">{metadataB.symbol}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Errores de saldo LP */}
                            {removeLpAmount && !hasEnoughLpBalance && (
                              <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>Saldo insuficiente de Tokens LP.</span>
                              </div>
                            )}

                            {/* Botón de acción */}
                            {!poolExists ? (
                              <Button type="button" disabled className="w-full font-bold shadow-md opacity-60 cursor-not-allowed">
                                Piscina No Creada
                              </Button>
                            ) : (
                              <Button
                                type="submit"
                                disabled={isActionPending || !removeLpAmount || !hasEnoughLpBalance || parseFloat(removeLpAmount) <= 0}
                                className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform bg-destructive hover:bg-destructive/90 text-white"
                              >
                                {isActionPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Retirando Liquidez...
                                  </>
                                ) : (
                                  <>Retirar Liquidez</>
                                )}
                              </Button>
                            )}
                          </form>
                        </TabsContent>
                      </>
                    )}
                  </CardContent>
                </Tabs>
              </Card>

              {/* Registro de transacciones de la sesión */}
              <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" />
                    Transacciones de la Sesión
                  </CardTitle>
                  <CardDescription>
                    Monitorea en tiempo real las operaciones que envías en esta página.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {transactions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      Aún no has enviado transacciones en esta sesión.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border border-border/20 bg-muted/10 text-xs">
                          <div>
                            <span className="font-semibold text-foreground block">{tx.description}</span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px] block">
                              Hash: {tx.hash.substring(0, 12)}...
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground block">{tx.timestamp}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-0.5">
                              <Check className="h-2.5 w-2.5" /> {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Panel Derecho: Pools e inicialización */}
            <div className="space-y-8">

              {/* Crear Nueva Piscina (Pool) */}
              <Card id="create-pool-card" className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 to-primary"></div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-teal-400" />
                    Crear Piscina de Liquidez
                  </CardTitle>
                  <CardDescription>
                    Despliega una nueva piscina en la blockchain para asociar dos tokens.
                  </CardDescription>
                </CardHeader>
                
                <form onSubmit={handleCreatePool}>
                  <CardContent className="space-y-4">
                    <TokenSelector
                      label="Seleccionar Token 0"
                      selectedToken={newPoolToken0}
                      onSelect={(addr) => setNewPoolToken0(addr)}
                      tokenList={createPoolSelectableTokens}
                      userAddress={address}
                      excludeToken={newPoolToken1}
                    />
                    <TokenSelector
                      label="Seleccionar Token 1"
                      selectedToken={newPoolToken1}
                      onSelect={(addr) => setNewPoolToken1(addr)}
                      tokenList={createPoolSelectableTokens}
                      userAddress={address}
                      excludeToken={newPoolToken0}
                    />

                    <div className="flex items-start gap-2 text-[10.5px] text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/20 shadow-inner">
                      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        Cualquier persona puede crear una piscina de liquidez para dos tokens. Esto genera un nuevo contrato inteligente `DEXPool` en la red.
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center gap-4 bg-muted/10 border-t border-border/20 p-4">
                    <span className="text-[10px] text-muted-foreground">* Requiere gas</span>
                    <Button
                      type="submit"
                      disabled={isFactoryPending || !newPoolToken0 || !newPoolToken1}
                      className="font-bold shadow-md hover:scale-[1.01] transition-transform text-xs"
                    >
                      {isFactoryPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          Creando Pool...
                        </>
                      ) : (
                        <>
                          Crear Pool
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Lista de Pools creadas */}
              <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-teal-500"></div>
                <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 space-y-0">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      Piscinas Disponibles
                    </CardTitle>
                    <CardDescription>
                      Piscinas creadas en la fábrica de DEX.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <EthPriceTicker />
                    <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full text-xs font-semibold text-primary border border-primary/20">
                      {allPoolAddresses.length} pools
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
                  {isLoadingPools ? (
                    <div className="flex flex-col gap-3">
                      <div className="h-[96px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
                      <div className="h-[96px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
                    </div>
                  ) : allPoolAddresses.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground space-y-2 border border-dashed border-border/40 rounded-xl">
                      <Info className="h-5 w-5 text-muted-foreground mx-auto" />
                      <p className="font-semibold text-foreground">No hay piscinas creadas aún.</p>
                      <p className="max-w-[200px] mx-auto text-[10.5px]">
                        ¡Crea la primera piscina de liquidez usando el panel superior!
                      </p>
                    </div>
                  ) : (
                    allPoolAddresses.map((poolAddr) => (
                      <PoolRow
                        key={poolAddr}
                        poolAddress={poolAddr}
                        userAddress={address}
                        refreshTrigger={refreshTrigger}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default DEXPage;
