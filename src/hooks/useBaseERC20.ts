import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getBaseERC20Contract } from '@/contracts';
import { useHydrated } from './useHydrated';

/**
 * Hook principal para interactuar con un contrato de token ERC20 de forma dinámica.
 * Permite consultar metadatos y ejecutar funciones de escritura.
 * @param tokenAddress Dirección del contrato del token ERC20.
 */
export function useBaseERC20(tokenAddress?: `0x${string}`) {
  const isHydrated = useHydrated();
  const contract = tokenAddress ? getBaseERC20Contract(tokenAddress) : null;

  // 1. Consultas de lectura de metadatos estáticos/generales
  const { data: name, isLoading: isLoadingName } = useReadContract({
    ...(contract || {}),
    functionName: 'name',
    query: {
      enabled: isHydrated && !!contract,
    },
  });

  const { data: symbol, isLoading: isLoadingSymbol } = useReadContract({
    ...(contract || {}),
    functionName: 'symbol',
    query: {
      enabled: isHydrated && !!contract,
    },
  });

  const { data: decimals, isLoading: isLoadingDecimals } = useReadContract({
    ...(contract || {}),
    functionName: 'decimals',
    query: {
      enabled: isHydrated && !!contract,
    },
  });

  const { data: totalSupply, isLoading: isLoadingSupply } = useReadContract({
    ...(contract || {}),
    functionName: 'totalSupply',
    query: {
      enabled: isHydrated && !!contract,
    },
  });

  const { data: owner, isLoading: isLoadingOwner } = useReadContract({
    ...(contract || {}),
    functionName: 'owner',
    query: {
      enabled: isHydrated && !!contract,
    },
  });

  // 2. Transacciones de escritura
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isWaitingForTx, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const transfer = (to: `0x${string}`, amount: bigint) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'transfer',
      args: [to, amount],
    });
  };

  const approve = (spender: `0x${string}`, amount: bigint) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  const mint = (to: `0x${string}`, amount: bigint) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'mint',
      args: [to, amount],
    });
  };

  const burn = (amount: bigint) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'burn',
      args: [amount],
    });
  };

  return {
    metadata: {
      name: (name as string) || '',
      symbol: (symbol as string) || '',
      decimals: decimals ? Number(decimals) : 18,
      totalSupply: totalSupply ? (totalSupply as bigint) : 0n,
      owner: (owner as `0x${string}`) || '0x0000000000000000000000000000000000000000',
    },
    isLoadingMetadata:
      !isHydrated ||
      isLoadingName ||
      isLoadingSymbol ||
      isLoadingDecimals ||
      isLoadingSupply ||
      isLoadingOwner,
    // Acciones de escritura
    transfer,
    approve,
    mint,
    burn,
    txHash: hash,
    isPending: isPending || isWaitingForTx,
    isSuccess,
    error,
  };
}

/**
 * Hook para consultar el balance de un usuario en un token ERC20 de forma reactiva.
 * @param tokenAddress Dirección del contrato del token ERC20.
 * @param accountAddress Dirección del usuario a consultar.
 */
export function useERC20Balance(tokenAddress?: `0x${string}`, accountAddress?: `0x${string}`) {
  const isHydrated = useHydrated();
  const contract = tokenAddress ? getBaseERC20Contract(tokenAddress) : null;

  const { data: balance, isLoading, error, refetch } = useReadContract({
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
    error,
    refetch,
  };
}

/**
 * Hook para consultar la cantidad aprobada (allowance) de un token para un tercero.
 * @param tokenAddress Dirección del contrato del token ERC20.
 * @param ownerAddress Dirección del propietario de los fondos.
 * @param spenderAddress Dirección autorizada a gastar.
 */
export function useERC20Allowance(
  tokenAddress?: `0x${string}`,
  ownerAddress?: `0x${string}`,
  spenderAddress?: `0x${string}`
) {
  const isHydrated = useHydrated();
  const contract = tokenAddress ? getBaseERC20Contract(tokenAddress) : null;

  const { data: allowance, isLoading, error, refetch } = useReadContract({
    ...(contract || {}),
    functionName: 'allowance',
    args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
    query: {
      enabled: isHydrated && !!contract && !!ownerAddress && !!spenderAddress,
    },
  });

  return {
    allowance: allowance ? (allowance as bigint) : 0n,
    isLoading: !isHydrated || isLoading,
    error,
    refetch,
  };
}

