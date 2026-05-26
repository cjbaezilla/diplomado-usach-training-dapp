import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { DEX_FACTORY_CONTRACT } from '@/contracts';
import { useHydrated } from './useHydrated';

/**
 * Hook para consultar todas las piscinas (pools) creadas por la fábrica de DEX.
 */
export function useAllDEXPools() {
  const isHydrated = useHydrated();

  // 1. Obtener la cantidad total de pools
  const { data: count, isLoading: isLoadingCount, refetch: refetchCount } = useReadContract({
    ...DEX_FACTORY_CONTRACT,
    functionName: 'cantidadPools',
    query: {
      enabled: isHydrated,
    },
  });

  const poolsCount = count ? Number(count) : 0;

  // 2. Construir llamadas para obtener las direcciones de cada pool
  const contracts = Array.from({ length: poolsCount }, (_, i) => ({
    ...DEX_FACTORY_CONTRACT,
    functionName: 'todosLosPools',
    args: [BigInt(i)] as const,
  }));

  const { data: poolsData, isLoading: isLoadingPools, refetch: refetchPools } = useReadContracts({
    contracts: contracts as any,
    query: {
      enabled: isHydrated && poolsCount > 0,
    },
  });

  const pools = poolsData
    ? (poolsData.map((res) => res.result).filter(Boolean) as `0x${string}`[])
    : [];

  const refetch = async () => {
    await Promise.all([refetchCount(), refetchPools()]);
  };

  return {
    poolsCount,
    pools,
    isLoading: !isHydrated || isLoadingCount || (poolsCount > 0 && isLoadingPools),
    refetch,
  };
}

/**
 * Hook para buscar la dirección de un pool específico dados dos tokens.
 */
export function useGetPool(tokenA?: `0x${string}`, tokenB?: `0x${string}`) {
  const isHydrated = useHydrated();

  const { data: poolAddress, isLoading, refetch } = useReadContract({
    ...DEX_FACTORY_CONTRACT,
    functionName: 'obtenerPool',
    args: tokenA && tokenB ? [tokenA, tokenB] : undefined,
    query: {
      enabled: isHydrated && !!tokenA && !!tokenB,
    },
  });

  const exists = poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000';

  return {
    poolAddress: poolAddress as `0x${string}` | undefined,
    exists,
    isLoading: !isHydrated || isLoading,
    refetch,
  };
}

/**
 * Hook para realizar acciones de escritura en el contrato DEXFactory (crear pools).
 */
export function useDEXFactoryActions() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isWaitingForTx, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const crearPool = (tokenA: `0x${string}`, tokenB: `0x${string}`) => {
    writeContract({
      ...DEX_FACTORY_CONTRACT,
      functionName: 'crearPool',
      args: [tokenA, tokenB],
    });
  };

  return {
    crearPool,
    hash,
    error,
    isPending: isPending || isWaitingForTx,
    isSuccess,
  };
}
