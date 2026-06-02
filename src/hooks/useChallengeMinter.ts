import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CHALLENGE_MINTER_CONTRACT } from '@/contracts';
import { useHydrated } from './useHydrated';

/**
 * Hook para interactuar con el contrato ChallengeMinter.
 */
export function useChallengeMinter() {
  const isHydrated = useHydrated();

  // Acciones de escritura
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isWaitingForTx, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimChallenge = (id: bigint, salt: `0x${string}`, signature: `0x${string}`) => {
    writeContract({
      ...CHALLENGE_MINTER_CONTRACT,
      functionName: 'claimChallenge',
      args: [id, salt, signature],
    });
  };

  return {
    claimChallenge,
    txHash: hash,
    isPending: isPending || isWaitingForTx,
    isSuccess,
    error,
  };
}

/**
 * Hook para consultar si una firma ya ha sido utilizada en el contrato.
 */
export function useUsedSignatures(signatureHash?: `0x${string}`) {
  const isHydrated = useHydrated();

  const { data: isUsed, isLoading, error, refetch } = useReadContract({
    ...CHALLENGE_MINTER_CONTRACT,
    functionName: 'usedSignatures',
    args: signatureHash ? [signatureHash] : undefined,
    query: {
      enabled: isHydrated && !!signatureHash,
    },
  });

  return {
    isUsed: isUsed ? (isUsed as boolean) : false,
    isLoading: !isHydrated || isLoading,
    error,
    refetch,
  };
}
