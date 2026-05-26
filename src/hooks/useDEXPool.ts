import { useCallback } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getDEXPoolContract } from '@/contracts';
import { useHydrated } from './useHydrated';

/**
 * Hook para consultar el estado (reservas, tokens, total supply) de una piscina específica.
 * @param poolAddress Dirección de la piscina de DEXPool
 */
export function useDEXPool(poolAddress?: `0x${string}`) {
  const isHydrated = useHydrated();
  const contract = poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000' 
    ? getDEXPoolContract(poolAddress) 
    : null;

  // 1. Obtener dirección de Token 0
  const { data: token0, isLoading: isLoadingToken0 } = useReadContract({
    ...(contract || {}),
    functionName: 'token0',
    query: {
      enabled: isHydrated && !!contract,
    },
  });

  // 2. Obtener dirección de Token 1
  const { data: token1, isLoading: isLoadingToken1 } = useReadContract({
    ...(contract || {}),
    functionName: 'token1',
    query: {
      enabled: isHydrated && !!contract,
    },
  });

  // 3. Obtener reservas de tokens (reserve0 y reserve1)
  const { data: reservas, isLoading: isLoadingReservas, refetch: refetchReservas } = useReadContract({
    ...(contract || {}),
    functionName: 'obtenerReservas',
    query: {
      enabled: isHydrated && !!contract,
    },
  });

  // 4. Obtener totalSupply (LP tokens totales emitidos)
  const { data: totalSupply, isLoading: isLoadingSupply, refetch: refetchSupply } = useReadContract({
    ...(contract || {}),
    functionName: 'totalSupply',
    query: {
      enabled: isHydrated && !!contract,
    },
  });

  const refetch = useCallback(async () => {
    await Promise.all([refetchReservas(), refetchSupply()]);
  }, [refetchReservas, refetchSupply]);

  const [reserve0, reserve1] = (reservas as [bigint, bigint]) || [0n, 0n];

  return {
    token0: token0 as `0x${string}` | undefined,
    token1: token1 as `0x${string}` | undefined,
    reserve0,
    reserve1,
    totalSupply: totalSupply ? (totalSupply as bigint) : 0n,
    isLoading: !isHydrated || isLoadingToken0 || isLoadingToken1 || isLoadingReservas || isLoadingSupply,
    refetch,
  };
}

/**
 * Hook para consultar el balance de tokens LP del usuario en una piscina específica.
 */
export function useDEXPoolBalance(poolAddress?: `0x${string}`, accountAddress?: `0x${string}`) {
  const isHydrated = useHydrated();
  const contract = poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000' 
    ? getDEXPoolContract(poolAddress) 
    : null;

  const { data: balance, isLoading, refetch } = useReadContract({
    ...(contract || {}),
    functionName: 'balanceOf',
    args: accountAddress ? [accountAddress] : undefined,
    query: {
      enabled: isHydrated && !!contract && !!accountAddress,
    },
  });

  return {
    balance: balance ? (balance as bigint) : 0n,
    isLoading: !isHydrated || isLoading,
    refetch,
  };
}

/**
 * Hook para realizar acciones de escritura en un pool específico.
 */
export function useDEXPoolActions(poolAddress?: `0x${string}`) {
  const contract = poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000' 
    ? getDEXPoolContract(poolAddress) 
    : null;
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isWaitingForTx, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const agregarLiquidez = (cantidad0Deseada: bigint, cantidad1Deseada: bigint) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'agregarLiquidez',
      args: [cantidad0Deseada, cantidad1Deseada],
    });
  };

  const removerLiquidez = (cantidadLP: bigint) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'removerLiquidez',
      args: [cantidadLP],
    });
  };

  const swap = (tokenEntrada: `0x${string}`, cantidadEntrada: bigint) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'swap',
      args: [tokenEntrada, cantidadEntrada],
    });
  };

  return {
    agregarLiquidez,
    removerLiquidez,
    swap,
    hash,
    error,
    isPending: isPending || isWaitingForTx,
    isSuccess,
  };
}
