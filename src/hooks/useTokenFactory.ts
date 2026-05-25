import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TOKEN_FACTORY_CONTRACT } from '@/contracts';
import { useHydrated } from './useHydrated';

/**
 * Hook para consultar todos los tokens ERC20 creados por la fábrica.
 */
export function useAllTokens() {
  const isHydrated = useHydrated();

  const { data: count, isLoading: isLoadingCount, refetch: refetchCount } = useReadContract({
    ...TOKEN_FACTORY_CONTRACT,
    functionName: 'getTokensCount',
    query: {
      enabled: isHydrated,
    },
  });

  const { data: tokens, isLoading: isLoadingTokens, refetch: refetchTokens } = useReadContract({
    ...TOKEN_FACTORY_CONTRACT,
    functionName: 'getAllTokens',
    query: {
      enabled: isHydrated,
    },
  });

  const refetch = async () => {
    await Promise.all([refetchCount(), refetchTokens()]);
  };

  return {
    count: count ? Number(count) : 0,
    tokens: (tokens as `0x${string}`[]) || [],
    isLoading: !isHydrated || isLoadingCount || isLoadingTokens,
    refetch,
  };
}

/**
 * Hook para obtener la lista de tokens creados y pertenecientes a un propietario.
 * @param ownerAddress Dirección del propietario.
 */
export function useTokensByOwner(ownerAddress?: `0x${string}`) {
  const isHydrated = useHydrated();

  const { data: tokens, isLoading, error, refetch } = useReadContract({
    ...TOKEN_FACTORY_CONTRACT,
    functionName: 'getTokensByOwner',
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: isHydrated && !!ownerAddress,
    },
  });

  return {
    tokens: (tokens as `0x${string}`[]) || [],
    isLoading: !isHydrated || isLoading,
    error,
    refetch,
  };
}

/**
 * Hook para realizar acciones en el contrato TokenFactory (por ejemplo, crear nuevos tokens).
 */
export function useTokenFactoryActions() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isWaitingForTx, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Solicita la creación de un nuevo token ERC20.
   * @param name Nombre del token.
   * @param symbol Símbolo del token.
   * @param initialOwner Dirección del propietario inicial.
   */
  const createToken = (name: string, symbol: string, initialOwner: `0x${string}`) => {
    writeContract({
      ...TOKEN_FACTORY_CONTRACT,
      functionName: 'createToken',
      args: [name, symbol, initialOwner],
    });
  };

  return {
    createToken,
    hash,
    error,
    isPending: isPending || isWaitingForTx,
    isSuccess,
  };
}
