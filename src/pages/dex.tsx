import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
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
  ArrowDownUp
} from 'lucide-react';
import { useAllTokens } from '@/hooks/useTokenFactory';
import { useBaseERC20, useERC20Balance, useERC20Allowance } from '@/hooks/useBaseERC20';
import { useAllDEXPools, useGetPool, useDEXFactoryActions } from '@/hooks/useDEXFactory';
import { useDEXPool, useDEXPoolBalance, useDEXPoolActions } from '@/hooks/useDEXPool';
import { useWETH } from '@/hooks/useWETH';
import { useHydrated } from '@/hooks/useHydrated';
import { TokenIcon } from '@/components/TokenIcon';

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
}

function PoolRow({ poolAddress, userAddress }: PoolRowProps) {
  const { token0, token1, reserve0, reserve1, totalSupply, isLoading: isLoadingPool } = useDEXPool(poolAddress);
  const { metadata: metadata0, isLoadingMetadata: isLoadingMeta0 } = useBaseERC20(token0);
  const { metadata: metadata1, isLoadingMetadata: isLoadingMeta1 } = useBaseERC20(token1);
  const { balance: lpBalance, isLoading: isLoadingLpBalance } = useDEXPoolBalance(poolAddress, userAddress);

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
        <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
          {poolAddress.substring(0, 6)}...{poolAddress.substring(poolAddress.length - 4)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border/10 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground block">Reservas</span>
          <span className="font-mono text-foreground block">
            {parseFloat(formattedReserve0).toLocaleString(undefined, { maximumFractionDigits: 4 })} {metadata0.symbol}
          </span>
          <span className="font-mono text-foreground block">
            {parseFloat(formattedReserve1).toLocaleString(undefined, { maximumFractionDigits: 4 })} {metadata1.symbol}
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
      {isEth ? 'ETH Nativo' : metadata.symbol || tokenAddress.substring(0, 6)} - {isEth ? 'Ether' : metadata.name} (Saldo: {formattedBalance})
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

  // Estados de los formularios de DEX
  const [tokenA, setTokenA] = useState<`0x${string}` | undefined>(undefined);
  const [tokenB, setTokenB] = useState<`0x${string}` | undefined>(undefined);

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

  // Metadatos y acciones de tokens activos
  const rawMetadataA = useBaseERC20(tokenA && tokenA !== ETH_ADDRESS ? tokenA : undefined);
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

  const rawMetadataB = useBaseERC20(tokenB && tokenB !== ETH_ADDRESS ? tokenB : undefined);
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
    if (tokenA === ETH_ADDRESS) return;
    rawMetadataA.approve(spender, amount);
  };
  const isPendingApproveA = rawMetadataA.isPending;

  const approveB = (spender: `0x${string}`, amount: bigint) => {
    if (tokenB === ETH_ADDRESS) return;
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
  const { allowance: allowanceA } = useERC20Allowance(resolvedTokenA, address, currentPoolAddress);
  const { allowance: allowanceB } = useERC20Allowance(resolvedTokenB, address, currentPoolAddress);


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

  // Estados de formularios locales
  const [activeDexTab, setActiveDexTab] = useState<'swap' | 'liquidez'>('swap');
  const [activeLiquidityTab, setActiveLiquidityTab] = useState<'add' | 'remove'>('add');

  // Input de Swap
  const [swapAmountIn, setSwapAmountIn] = useState('');
  const [swapTokenIn, setSwapTokenIn] = useState<`0x${string}` | undefined>(undefined);
  const [estimatedOut, setEstimatedOut] = useState('0.00');

  // Input de Agregar Liquidez
  const [liqAmount0, setLiqAmount0] = useState('');
  const [liqAmount1, setLiqAmount1] = useState('');

  // Input de Remover Liquidez
  const [removeLpAmount, setRemoveLpAmount] = useState('');

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

  // Selección por defecto del token de entrada para Swap
  useEffect(() => {
    if (tokenA && !swapTokenIn) {
      setSwapTokenIn(tokenA);
    }
  }, [tokenA, swapTokenIn]);


  // Manejar el cambio automático de inputs al calcular Swap
  useEffect(() => {
    if (!tokenA || !tokenB || !swapTokenIn || !currentPoolAddress || currentPoolAddress === '0x0000000000000000000000000000000000000000') {
      setEstimatedOut('0.00');
      return;
    }

    try {
      const isA = swapTokenIn.toLowerCase() === tokenA.toLowerCase();
      const decimalsIn = isA ? metadataA.decimals : metadataB.decimals;
      const decimalsOut = isA ? metadataB.decimals : metadataA.decimals;

      const amtIn = parseUnits(swapAmountIn, decimalsIn);
      if (amtIn <= 0n) {
        setEstimatedOut('0.00');
        return;
      }

      // Ordenar las reservas de acuerdo a token0 y token1 del pool
      const isToken0 = swapTokenIn.toLowerCase() === poolToken0?.toLowerCase();
      const resIn = isToken0 ? poolReserve0 : poolReserve1;
      const resOut = isToken0 ? poolReserve1 : poolReserve0;

      const out = calcularCantidadSalida(amtIn, resIn, resOut);
      setEstimatedOut(formatUnits(out, decimalsOut));
    } catch {
      setEstimatedOut('0.00');
    }
  }, [swapAmountIn, swapTokenIn, poolReserve0, poolReserve1, tokenA, tokenB, poolToken0, currentPoolAddress, metadataA, metadataB]);

  // Auto-cálculo óptimo de token1 cuando se cambia token0 en Liquidez
  const handleLiq0Change = (val: string) => {
    setLiqAmount0(val);
    if (!tokenA || !tokenB || !currentPoolAddress) return;
    try {
      const amt0 = parseUnits(val, metadataA.decimals);
      if (amt0 <= 0n) {
        setLiqAmount1('');
        return;
      }

      // Validar si es token0 en el pool real
      const isA0 = tokenA.toLowerCase() === poolToken0?.toLowerCase();
      const res0 = isA0 ? poolReserve0 : poolReserve1;
      const res1 = isA0 ? poolReserve1 : poolReserve0;

      if (res0 === 0n || res1 === 0n) {
        // Pool vacío, depósito inicial libre
        return;
      }

      const amt1 = calcularCantidad1Optima(amt0, res0, res1);
      setLiqAmount1(formatUnits(amt1, metadataB.decimals));
    } catch {
      setLiqAmount1('');
    }
  };

  // Auto-cálculo óptimo de token0 cuando se cambia token1 en Liquidez
  const handleLiq1Change = (val: string) => {
    setLiqAmount1(val);
    if (!tokenA || !tokenB || !currentPoolAddress) return;
    try {
      const amt1 = parseUnits(val, metadataB.decimals);
      if (amt1 <= 0n) {
        setLiqAmount0('');
        return;
      }

      const isA0 = tokenA.toLowerCase() === poolToken0?.toLowerCase();
      const res0 = isA0 ? poolReserve0 : poolReserve1;
      const res1 = isA0 ? poolReserve1 : poolReserve0;

      if (res0 === 0n || res1 === 0n) return;

      const amt0 = calcularCantidad1Optima(amt1, res1, res0);
      setLiqAmount0(formatUnits(amt0, metadataA.decimals));
    } catch {
      setLiqAmount0('');
    }
  };

  // Notificaciones flotantes con temporizador
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Transacción de fábrica completada con éxito
  useEffect(() => {
    if (isFactorySuccess && factoryTxHash) {
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
    }
  }, [isFactorySuccess, factoryTxHash]);

  // Transacción de pool completada con éxito
  useEffect(() => {
    if (isActionSuccess && actionTxHash) {
      let desc = 'Transacción en Pool';
      if (activeDexTab === 'swap') {
        desc = `Intercambio de tokens`;
        setSwapAmountIn('');
      } else if (activeDexTab === 'liquidez') {
        if (activeLiquidityTab === 'add') {
          desc = `Aporte de liquidez`;
          setLiqAmount0('');
          setLiqAmount1('');
        } else {
          desc = `Retiro de liquidez`;
          setRemoveLpAmount('');
        }
      }

      setNotification({
        type: 'success',
        message: `¡Transacción de ${desc.toLowerCase()} completada con éxito!`
      });

      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: activeDexTab === 'swap' ? 'swap' : (activeLiquidityTab === 'add' ? 'add_liquidity' : 'remove_liquidity'),
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
  }, [isActionSuccess, actionTxHash]);

  // Transacción de WETH completada con éxito
  useEffect(() => {
    if (isWethSuccess && wethTxHash) {
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
    }
  }, [isWethSuccess, wethTxHash]);

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

  // Función para aprobar un token
  const handleApprove = async (token: `0x${string}`, amountStr: string, decimals: number) => {
    if (!currentPoolAddress || !amountStr) return;
    try {
      const amt = parseUnits(amountStr, decimals);
      if (token.toLowerCase() === tokenA?.toLowerCase()) {
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
    if (!swapTokenIn || !swapAmountIn) return;
    try {
      const isA = swapTokenIn.toLowerCase() === tokenA?.toLowerCase();
      const swapTokenOut = isA ? tokenB : tokenA;
      const decimals = isA ? metadataA.decimals : metadataB.decimals;
      const amt = parseUnits(swapAmountIn, decimals);

      // CASO 1: Wrap / Unwrap directo (ETH <-> WETH)
      if (
        (swapTokenIn === ETH_ADDRESS && swapTokenOut === WETH_ADDRESS) ||
        (swapTokenIn === WETH_ADDRESS && swapTokenOut === ETH_ADDRESS)
      ) {
        if (swapTokenIn === ETH_ADDRESS) {
          setLastWethAction('wrap');
          wethDeposit(amt);
        } else {
          setLastWethAction('unwrap');
          wethWithdraw(amt);
        }
        return;
      }

      // CASO 2: Swap involucrando ETH nativo
      if (swapTokenIn === ETH_ADDRESS) {
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
        actionSwap(WETH_ADDRESS, amt);
      } else if (swapTokenOut === ETH_ADDRESS) {
        // Token -> ETH: Swap estándar Token -> WETH y luego Unwrap
        if (!currentPoolAddress) return;
        const estOutBigInt = parseUnits(estimatedOut, 18);
        setUnwrapAmountOnSuccess(estOutBigInt);
        actionSwap(swapTokenIn, amt);
      } else {
        // Swap estándar entre tokens ERC20 de fábrica
        if (!currentPoolAddress) return;
        actionSwap(swapTokenIn, amt);
      }
    } catch {
      setNotification({ type: 'error', message: 'Monto de intercambio no válido.' });
    }
  };

  // Ejecutar Aporte de Liquidez
  const handleAddLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPoolAddress || !liqAmount0 || !liqAmount1) return;
    try {
      // Validar orden de tokens en el contrato real
      const isA0 = tokenA?.toLowerCase() === poolToken0?.toLowerCase();
      const val0 = isA0 ? liqAmount0 : liqAmount1;
      const val1 = isA0 ? liqAmount1 : liqAmount0;

      const amt0 = parseUnits(val0, metadataA.decimals);
      const amt1 = parseUnits(val1, metadataB.decimals);

      // Si tokenA o tokenB es ETH, verificamos si es necesario envolver WETH
      if (tokenA === ETH_ADDRESS || tokenB === ETH_ADDRESS) {
        const isEthA = tokenA === ETH_ADDRESS;
        const ethAmount = isEthA ? amt0 : amt1;
        const missingWeth = ethAmount > wethBalance ? ethAmount - wethBalance : 0n;

        if (missingWeth > 0n) {
          setNotification({
            type: 'success',
            message: 'Iniciando conversión de ETH a WETH para poder aportar liquidez...'
          });
          setLastWethAction('wrap');
          wethDeposit(missingWeth);
          return;
        }
      }

      actionAgregarLiquidez(amt0, amt1);
    } catch {
      setNotification({ type: 'error', message: 'Montos de liquidez no válidos.' });
    }
  };

  // Ejecutar Retiro de Liquidez
  const handleRemoveLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPoolAddress || !removeLpAmount) return;
    try {
      const amt = parseUnits(removeLpAmount, 18);
      if (amt > lpTokenBalance) {
        setNotification({ type: 'error', message: 'Saldo LP insuficiente.' });
        return;
      }
      actionRemoverLiquidez(amt);
    } catch {
      setNotification({ type: 'error', message: 'Monto LP no válido.' });
    }
  };

  // Crear piscina de liquidez
  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolToken0 || !newPoolToken1) return;
    if (newPoolToken0.toLowerCase() === newPoolToken1.toLowerCase()) {
      setNotification({ type: 'error', message: 'Los tokens deben ser diferentes.' });
      return;
    }
    factoryCrearPool(newPoolToken0, newPoolToken1);
  };



  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Comprobación de requerimientos de aprobación para Swap
  const isSwapA = swapTokenIn?.toLowerCase() === tokenA?.toLowerCase();
  const currentSwapAllowance = isSwapA ? allowanceA : allowanceB;
  const currentSwapBalance = isSwapA ? resolvedBalanceA : resolvedBalanceB;
  const currentSwapDecimals = isSwapA ? metadataA.decimals : metadataB.decimals;
  const currentSwapSymbol = isSwapA ? metadataA.symbol : metadataB.symbol;
  const swapAmountBigInt = swapAmountIn ? parseUnits(swapAmountIn, currentSwapDecimals) : 0n;
  
  // Si el token es ETH nativo, no requiere aprobación ERC20
  const isInputEth = (isSwapA ? tokenA : tokenB) === ETH_ADDRESS;
  const needsSwapApproval = isInputEth ? false : swapAmountBigInt > currentSwapAllowance;
  const hasEnoughSwapBalance = currentSwapBalance >= swapAmountBigInt;

  // Comprobación de requerimientos de aprobación para Liquidez
  const isA0 = tokenA?.toLowerCase() === poolToken0?.toLowerCase();
  const amtLiqA = liqAmount0 ? parseUnits(liqAmount0, metadataA.decimals) : 0n;
  const amtLiqB = liqAmount1 ? parseUnits(liqAmount1, metadataB.decimals) : 0n;
  
  const needsLiqApproveA = tokenA === ETH_ADDRESS ? false : amtLiqA > allowanceA;
  const needsLiqApproveB = tokenB === ETH_ADDRESS ? false : amtLiqB > allowanceB;
  
  const hasEnoughLiqBalanceA = resolvedBalanceA >= amtLiqA;
  const hasEnoughLiqBalanceB = resolvedBalanceB >= amtLiqB;

  const missingWethForLiq = (tokenA === ETH_ADDRESS && amtLiqA > wethBalance) 
    ? amtLiqA - wethBalance 
    : (tokenB === ETH_ADDRESS && amtLiqB > wethBalance) 
      ? amtLiqB - wethBalance 
      : 0n;
  const isWethWrapNeededForLiq = missingWethForLiq > 0n;

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

        {/* Sección Superior: Grid Educativo */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          
          {/* Fórmulas y Teoría */}
          <Card className="xl:col-span-2 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-teal-500"></div>
            <div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Mecánica de un AMM
                </CardTitle>
                <CardDescription>
                  Cómo se determinan los precios y la liquidez en DeFi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Un <strong className="text-foreground font-semibold">Creador de Mercado Automatizado (AMM)</strong> elimina la necesidad de libros de órdenes centralizados, utilizando pools que contienen reservas de dos tokens.
                </p>

                <div className="bg-muted/40 p-3 rounded-lg border border-border/20 space-y-1">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Fórmula de Producto Constante</h4>
                  <p className="text-lg font-mono font-bold text-primary text-center my-1.5">
                    x &middot; y = k
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Donde <code className="text-foreground font-semibold">x</code> e <code className="text-foreground font-semibold">y</code> representan las cantidades de reserva de cada token en el pool. Cualquier intercambio que se realice debe mantener el producto <code className="text-foreground font-semibold">k</code> constante (antes de aplicar comisiones).
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Cálculo de Deslizamiento (Slippage)</h4>
                  <p className="text-xs">
                    Dado que el precio relativo cambia dinámicamente con la proporción de reservas, intercambiar cantidades muy grandes en relación al tamaño de la piscina provocará un peor tipo de cambio (deslizamiento).
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-semibold">Comisión del Protocolo</h4>
                  <p className="text-xs">
                    Este pool cobra una tarifa fija de <strong className="text-foreground">0.3%</strong> por cada intercambio. Esta tarifa se acumula en las reservas de la piscina de liquidez, recompensando directamente a los proveedores de liquidez (LPs) al incrementar el valor de sus LP tokens.
                  </p>
                </div>
              </CardContent>
            </div>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-primary" /> x = Reserva Token0, y = Reserva Token1
              </span>
            </CardFooter>
          </Card>

          {/* Código de Solidity del DEX */}
          <Card className="xl:col-span-3 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
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
                  <pre className="text-[10px] sm:text-[11px] font-mono p-4 overflow-x-auto leading-relaxed text-zinc-300 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                    <code>{solidityCode}</code>
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
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-emerald-500"></div>
                <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Intercambio e Inversión
                    </CardTitle>
                    <CardDescription>
                      Opera con las piscinas de liquidez seleccionadas en tiempo real.
                    </CardDescription>
                  </div>
                  <div className="flex bg-muted/65 p-1 rounded-lg border border-border/20">
                    <button
                      onClick={() => setActiveDexTab('swap')}
                      className={cn(
                        "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                        activeDexTab === 'swap' ? "bg-background text-primary shadow" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Swap
                    </button>
                    <button
                      onClick={() => setActiveDexTab('liquidez')}
                      className={cn(
                        "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                        activeDexTab === 'liquidez' ? "bg-background text-primary shadow" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Liquidez
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Selector del Par Activo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/30">
                    <TokenSelector
                      label="Token A (Token0)"
                      selectedToken={tokenA}
                      onSelect={(addr) => setTokenA(addr)}
                      tokenList={selectableTokens}
                      userAddress={address}
                      excludeToken={tokenB}
                    />
                    <TokenSelector
                      label="Token B (Token1)"
                      selectedToken={tokenB}
                      onSelect={(addr) => setTokenB(addr)}
                      tokenList={selectableTokens}
                      userAddress={address}
                      excludeToken={tokenA}
                    />
                  </div>

                  {!tokenA || !tokenB ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      Debes seleccionar ambos tokens para comenzar.
                    </div>
                  ) : isLoadingCurrentPool ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : !poolExists ? (
                    <div className="text-center py-8 border border-dashed border-border/40 rounded-xl space-y-3">
                      <AlertCircle className="h-6 w-6 text-amber-500 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">No existe una piscina para este par</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Antes de poder intercambiar o aportar liquidez, se debe desplegar el contrato del pool para {metadataA.symbol} y {metadataB.symbol}.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setNewPoolToken0(tokenA);
                          setNewPoolToken1(tokenB);
                        }}
                        className="text-xs font-semibold"
                        variant="outline"
                      >
                        Ir a Crear Piscina
                      </Button>

                    </div>
                  ) : (
                    /* Piscina Existente - Mostrar Swap o Liquidez */
                    <div>
                      {activeDexTab === 'swap' ? (
                        /* PESTAÑA SWAP */
                        <form onSubmit={handleSwap} className="space-y-5">
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
                                  <TokenIcon address={swapTokenIn || ''} className="h-5 w-5" />
                                  <select
                                    value={swapTokenIn || ''}
                                    onChange={(e) => setSwapTokenIn(e.target.value as `0x${string}`)}
                                    className="bg-transparent border-none text-xs font-bold text-foreground focus:outline-none focus:ring-0"
                                  >
                                    <option value={tokenA} className="bg-card text-foreground">{metadataA.symbol}</option>
                                    <option value={tokenB} className="bg-card text-foreground">{metadataB.symbol}</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Icono de Dirección de Swap */}
                            <div className="flex justify-center -my-2.5">
                              <div className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors p-2 rounded-full cursor-pointer shadow-inner"
                                onClick={() => setSwapTokenIn(swapTokenIn?.toLowerCase() === tokenA.toLowerCase() ? tokenB : tokenA)}
                              >
                                <ArrowDownUp className="h-4 w-4" />
                              </div>
                            </div>

                            {/* Output Estimado */}
                            <div className="bg-muted/30 p-3 rounded-xl border border-border/20 space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <Label className="text-muted-foreground font-medium">Tú recibes (estimado):</Label>
                                <span className="font-mono text-[10.5px] text-muted-foreground">
                                  Saldo: {parseFloat(formatUnits(swapTokenIn?.toLowerCase() === tokenA.toLowerCase() ? balanceB : balanceA, swapTokenIn?.toLowerCase() === tokenA.toLowerCase() ? metadataB.decimals : metadataA.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} {swapTokenIn?.toLowerCase() === tokenA.toLowerCase() ? metadataB.symbol : metadataA.symbol}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-mono flex-1 font-bold text-foreground px-1 py-0.5">
                                  {parseFloat(estimatedOut).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                </span>
                                <div className="flex items-center gap-1.5 bg-card/60 px-3 py-1.5 rounded-lg border border-border/40 shrink-0">
                                  <TokenIcon address={swapTokenIn?.toLowerCase() === tokenA.toLowerCase() ? (tokenB || '') : (tokenA || '')} className="h-5 w-5" />
                                  <span className="text-xs font-bold text-foreground">
                                    {swapTokenIn?.toLowerCase() === tokenA.toLowerCase() ? metadataB.symbol : metadataA.symbol}
                                  </span>
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

                          {/* Botón de Acción de Swap */}
                          {(swapTokenIn === ETH_ADDRESS && swapAmountBigInt > wethBalance) ? (
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
                              onClick={() => handleApprove(swapTokenIn!, swapAmountIn, currentSwapDecimals)}
                              disabled={isPendingApproveA || isPendingApproveB}
                              className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform"
                            >
                              {isPendingApproveA || isPendingApproveB ? (
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
                                  {swapTokenIn === ETH_ADDRESS && (isSwapA ? tokenB : tokenA) === WETH_ADDRESS ? "Envolver ETH (Wrap)" : 
                                   swapTokenIn === WETH_ADDRESS && (isSwapA ? tokenB : tokenA) === ETH_ADDRESS ? "Desenvolver WETH (Unwrap)" : 
                                   "Intercambiar (Swap)"}
                                </>
                              )}
                            </Button>
                          )}
                        </form>
                      ) : (
                        /* PESTAÑA LIQUIDEZ (ADD/REMOVE) */
                        <div className="space-y-6">
                          <div className="flex border-b border-border/20 pb-3 flex-wrap gap-2">
                            <button
                              onClick={() => setActiveLiquidityTab('add')}
                              className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                                activeLiquidityTab === 'add' ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Aportar Liquidez
                            </button>
                            <button
                              onClick={() => setActiveLiquidityTab('remove')}
                              className={cn(
                                "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                                activeLiquidityTab === 'remove' ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Retirar Liquidez
                            </button>
                          </div>

                          {activeLiquidityTab === 'add' ? (
                            /* APORTAR LIQUIDEZ */
                            <form onSubmit={handleAddLiquidity} className="space-y-5">
                              <div className="space-y-4">
                                
                                {/* Input Token 0 */}
                                <div className="bg-muted/30 p-3 rounded-xl border border-border/20 space-y-2">
                                  <div className="flex justify-between items-center text-xs">
                                    <Label className="text-muted-foreground font-medium">Depositar {metadataA.symbol}:</Label>
                                    <span className="font-mono text-[10.5px] text-muted-foreground">
                                      Saldo: {parseFloat(formatUnits(balanceA, metadataA.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Input
                                      type="number"
                                      placeholder="0.0"
                                      value={liqAmount0}
                                      onChange={(e) => handleLiq0Change(e.target.value)}
                                      className="border-none bg-transparent shadow-none text-lg font-mono flex-1 p-0 focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none"
                                      required
                                      min="0"
                                      step="any"
                                    />
                                    <div className="flex items-center gap-1.5 bg-card/60 px-3 py-1.5 rounded-lg border border-border/40 shrink-0">
                                      <TokenIcon address={tokenA} className="h-5 w-5" />
                                      <span className="text-xs font-bold">{metadataA.symbol}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Icono de Suma */}
                                <div className="flex justify-center -my-2.5">
                                  <div className="bg-primary/10 border border-primary/20 text-primary p-1.5 rounded-full shadow-inner">
                                    <Plus className="h-3.5 w-3.5" />
                                  </div>
                                </div>

                                {/* Input Token 1 */}
                                <div className="bg-muted/30 p-3 rounded-xl border border-border/20 space-y-2">
                                  <div className="flex justify-between items-center text-xs">
                                    <Label className="text-muted-foreground font-medium">Depositar {metadataB.symbol}:</Label>
                                    <span className="font-mono text-[10.5px] text-muted-foreground">
                                      Saldo: {parseFloat(formatUnits(balanceB, metadataB.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Input
                                      type="number"
                                      placeholder="0.0"
                                      value={liqAmount1}
                                      onChange={(e) => handleLiq1Change(e.target.value)}
                                      className="border-none bg-transparent shadow-none text-lg font-mono flex-1 p-0 focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none"
                                      required
                                      min="0"
                                      step="any"
                                    />
                                    <div className="flex items-center gap-1.5 bg-card/60 px-3 py-1.5 rounded-lg border border-border/40 shrink-0">
                                      <TokenIcon address={tokenB} className="h-5 w-5" />
                                      <span className="text-xs font-bold">{metadataB.symbol}</span>
                                    </div>
                                  </div>
                                </div>

                              </div>

                              {/* Validar fondos de liquidez */}
                              {((liqAmount0 && !hasEnoughLiqBalanceA) || (liqAmount1 && !hasEnoughLiqBalanceB)) && (
                                <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
                                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                  <span>Fondos insuficientes para aportar en la proporción requerida.</span>
                                </div>
                              )}

                              {/* Aprobaciones individuales o Botón de Aportar */}
                              {isWethWrapNeededForLiq && (hasEnoughLiqBalanceA && hasEnoughLiqBalanceB) ? (
                                <Button
                                  type="button"
                                  onClick={handleAddLiquidity}
                                  disabled={isWethPending}
                                  className="w-full font-bold shadow-md bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                  {isWethPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                      Convirtiendo ETH a WETH...
                                    </>
                                  ) : (
                                    <>
                                      1. Envolver {parseFloat(formatUnits(missingWethForLiq, 18)).toFixed(4)} ETH a WETH
                                    </>
                                  )}
                                </Button>
                              ) : needsLiqApproveA && hasEnoughLiqBalanceA ? (
                                <Button
                                  type="button"
                                  onClick={() => handleApprove(tokenA, liqAmount0, metadataA.decimals)}
                                  disabled={isPendingApproveA}
                                  className="w-full font-bold shadow-md"
                                >
                                  {isPendingApproveA ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                      Aprobando {metadataA.symbol}...
                                    </>
                                  ) : (
                                    <>
                                      Aprobar {metadataA.symbol}
                                    </>
                                  )}
                                </Button>
                              ) : needsLiqApproveB && hasEnoughLiqBalanceB ? (
                                <Button
                                  type="button"
                                  onClick={() => handleApprove(tokenB, liqAmount1, metadataB.decimals)}
                                  disabled={isPendingApproveB}
                                  className="w-full font-bold shadow-md"
                                >
                                  {isPendingApproveB ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                      Aprobando {metadataB.symbol}...
                                    </>
                                  ) : (
                                    <>
                                      Aprobar {metadataB.symbol}
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  type="submit"
                                  disabled={isActionPending || !liqAmount0 || !liqAmount1 || !hasEnoughLiqBalanceA || !hasEnoughLiqBalanceB}
                                  className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform"
                                >
                                  {isActionPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                      Aportando Liquidez...
                                    </>
                                  ) : (
                                    <>
                                      Depositar Fondos (Aportar)
                                    </>
                                  )}
                                </Button>
                              )}
                            </form>
                          ) : (
                            /* RETIRAR LIQUIDEZ */
                            <form onSubmit={handleRemoveLiquidity} className="space-y-5">
                              <div className="bg-muted/30 p-3 rounded-xl border border-border/20 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <Label className="text-muted-foreground font-medium">Cantidad de LP Tokens a quemar:</Label>
                                  <span className="font-mono text-[10.5px] text-muted-foreground">
                                    Saldo LP: {parseFloat(formatUnits(lpTokenBalance, 18)).toLocaleString(undefined, { maximumFractionDigits: 6 })}
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
                                  <Button 
                                    type="button" 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-[10px] h-7 px-2 shrink-0 border-border/50"
                                    onClick={() => setRemoveLpAmount(formatUnits(lpTokenBalance, 18))}
                                  >
                                    Máx
                                  </Button>
                                </div>
                              </div>

                              {removeLpAmount && parseUnits(removeLpAmount, 18) > lpTokenBalance && (
                                <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
                                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                  <span>Supera el saldo disponible de LP tokens en esta piscina.</span>
                                </div>
                              )}

                              <Button
                                type="submit"
                                disabled={isActionPending || !removeLpAmount || parseUnits(removeLpAmount, 18) > lpTokenBalance || parseFloat(removeLpAmount) <= 0}
                                className="w-full font-bold shadow-md hover:scale-[1.01] transition-transform"
                              >
                                {isActionPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Retirando Liquidez...
                                  </>
                                ) : (
                                  <>
                                    Retirar Fondos (Quemar LP)
                                  </>
                                )}
                              </Button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
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
              <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden group hover:shadow-xl transition-all duration-300">
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
                      tokenList={selectableTokens}
                      userAddress={address}
                      excludeToken={newPoolToken1}
                    />
                    <TokenSelector
                      label="Seleccionar Token 1"
                      selectedToken={newPoolToken1}
                      onSelect={(addr) => setNewPoolToken1(addr)}
                      tokenList={selectableTokens}
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
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      Piscinas Disponibles
                    </CardTitle>
                    <CardDescription>
                      Piscinas creadas en la fábrica de DEX.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full text-xs font-semibold text-primary border border-primary/20 shrink-0">
                    {allPoolAddresses.length} pools
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
                      <PoolRow key={poolAddr} poolAddress={poolAddr} userAddress={address} />
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
