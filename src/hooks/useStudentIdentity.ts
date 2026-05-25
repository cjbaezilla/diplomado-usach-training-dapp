import { useMemo } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { STUDENT_IDENTITY_CONTRACT } from '@/contracts';
import { useHydrated } from './useHydrated';

/**
 * Hook para consultar el perfil de un estudiante específico.
 * @param studentAddress Dirección del estudiante.
 */
export function useStudentProfile(studentAddress?: `0x${string}`) {
  const isHydrated = useHydrated();

  const { data, isLoading, error, refetch } = useReadContract({
    ...STUDENT_IDENTITY_CONTRACT,
    functionName: 'getProfile',
    args: studentAddress ? [studentAddress] : undefined,
    query: {
      enabled: isHydrated && !!studentAddress,
    },
  });

  const profile = useMemo(() => {
    if (!data) return null;
    return {
      name: data[0],
      email: data[1],
      linkedin: data[2],
      twitter: data[3],
      avatar: data[4],
      updatedAt: Number(data[5]),
      isRegistered: data[6],
    };
  }, [data]);

  return {
    profile,
    isLoading: !isHydrated || isLoading,
    error,
    refetch,
  };
}

/**
 * Hook para consultar el conteo y la lista de todos los estudiantes registrados.
 */
export function useAllStudents() {
  const isHydrated = useHydrated();

  const { data: count, isLoading: isLoadingCount, refetch: refetchCount } = useReadContract({
    ...STUDENT_IDENTITY_CONTRACT,
    functionName: 'getStudentsCount',
    query: {
      enabled: isHydrated,
    },
  });

  const { data: addresses, isLoading: isLoadingAddresses, refetch: refetchAddresses } = useReadContract({
    ...STUDENT_IDENTITY_CONTRACT,
    functionName: 'getAllRegisteredStudents',
    query: {
      enabled: isHydrated,
    },
  });

  const refetch = async () => {
    await Promise.all([refetchCount(), refetchAddresses()]);
  };

  return {
    count: count ? Number(count) : 0,
    addresses: (addresses as `0x${string}`[]) || [],
    isLoading: !isHydrated || isLoadingCount || isLoadingAddresses,
    refetch,
  };
}

/**
 * Hook para realizar acciones de escritura en el contrato StudentIdentity (registrar/actualizar perfil).
 */
export function useStudentIdentityActions() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isWaitingForTx, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Crea o actualiza el perfil del estudiante conectado.
   */
  const setProfile = (
    name: string,
    email: string,
    linkedin: string,
    twitter: string,
    avatar: string
  ) => {
    writeContract({
      ...STUDENT_IDENTITY_CONTRACT,
      functionName: 'setProfile',
      args: [name, email, linkedin, twitter, avatar],
    });
  };

  return {
    setProfile,
    hash,
    error,
    isPending: isPending || isWaitingForTx,
    isSuccess,
  };
}
