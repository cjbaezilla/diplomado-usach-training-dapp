import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getBaseERC1155Contract } from '@/contracts';
import { useHydrated } from './useHydrated';

/**
 * Hook para interactuar con un contrato de token ERC1155 de forma dinámica.
 * @param tokenAddress Dirección del contrato ERC1155.
 */
export function useBaseERC1155(tokenAddress?: `0x${string}`) {
  const isHydrated = useHydrated();
  const contract = tokenAddress ? getBaseERC1155Contract(tokenAddress) : null;

  // Acciones de escritura
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isWaitingForTx, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mint = (account: `0x${string}`, id: bigint, amount: bigint, data: `0x${string}`) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'mint',
      args: [account, id, amount, data],
    });
  };

  const mintBatch = (
    to: `0x${string}`,
    ids: bigint[],
    amounts: bigint[],
    data: `0x${string}`
  ) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'mintBatch',
      args: [to, ids, amounts, data],
    });
  };

  const burn = (account: `0x${string}`, id: bigint, value: bigint) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'burn',
      args: [account, id, value],
    });
  };

  const safeTransferFrom = (
    from: `0x${string}`,
    to: `0x${string}`,
    id: bigint,
    value: bigint,
    data: `0x${string}`
  ) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'safeTransferFrom',
      args: [from, to, id, value, data],
    });
  };

  const setApprovalForAll = (operator: `0x${string}`, approved: boolean) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'setApprovalForAll',
      args: [operator, approved],
    });
  };

  const setURI = (newuri: string) => {
    if (!contract) return;
    writeContract({
      ...contract,
      functionName: 'setURI',
      args: [newuri],
    });
  };

  return {
    // Acciones
    mint,
    mintBatch,
    burn,
    safeTransferFrom,
    setApprovalForAll,
    setURI,
    txHash: hash,
    isPending: isPending || isWaitingForTx,
    isSuccess,
    error,
  };
}

/**
 * Hook para consultar el balance de un token específico (id) de ERC1155 para un usuario.
 */
export function useERC1155Balance(
  tokenAddress?: `0x${string}`,
  accountAddress?: `0x${string}`,
  tokenId?: bigint
) {
  const isHydrated = useHydrated();
  const contract = tokenAddress ? getBaseERC1155Contract(tokenAddress) : null;

  const { data: balance, isLoading, error, refetch } = useReadContract({
    ...(contract || {}),
    functionName: 'balanceOf',
    args: accountAddress && tokenId !== undefined ? [accountAddress, tokenId] : undefined,
    query: {
      enabled: isHydrated && !!contract && !!accountAddress && tokenId !== undefined,
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
 * Hook para consultar la URI de metadatos de un token en específico de ERC1155.
 */
export function useERC1155Uri(tokenAddress?: `0x${string}`, tokenId?: bigint) {
  const isHydrated = useHydrated();
  const contract = tokenAddress ? getBaseERC1155Contract(tokenAddress) : null;

  const { data: uri, isLoading, error, refetch } = useReadContract({
    ...(contract || {}),
    functionName: 'uri',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: isHydrated && !!contract && tokenId !== undefined,
    },
  });

  return {
    uri: (uri as string) || '',
    isLoading: !isHydrated || isLoading,
    error,
    refetch,
  };
}
