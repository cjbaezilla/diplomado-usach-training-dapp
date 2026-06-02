import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { BASE_ERC1155_CONTRACT } from '@/contracts';
import { useHydrated } from './useHydrated';

/**
 * Función de utilidad pura para registrar la completación de un desafío en localStorage.
 * Ideal para ser llamada dentro de callbacks de eventos o hooks de éxito de transacciones.
 */
export function trackChallengeCompletion(id: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`usach_challenge_${id}_completed`, 'true');
    // Notificar a los hooks activos en la misma ventana
    window.dispatchEvent(new Event('usach_challenges_updated'));
  } catch (e) {
    console.error(`Error al escribir desafío ${id} en localStorage:`, e);
  }
}

/**
 * Hook reactivo para leer y reaccionar ante el estado de completación de desafíos.
 * Sincroniza automáticamente los cambios entre componentes y pestañas del navegador,
 * además de validar dinámicamente on-chain si el estudiante posee el NFT respectivo.
 * Utiliza caché local en localStorage para carga instantánea sin tiempos de espera fijos.
 */
export function useChallenges() {
  const isHydrated = useHydrated();
  const { address, isConnected } = useAccount();
  
  // Estado local para los desafíos completados en el cliente
  const [localCompleted, setLocalCompleted] = useState<Record<number, boolean>>({});
  
  // Estado local para los balances de los NFTs (inicializado desde caché para carga inmediata)
  const [nftBalances, setNftBalances] = useState<bigint[]>(() => Array(10).fill(0n));
  const [hasCachedBalances, setHasCachedBalances] = useState(false);

  // Cargar estado desde localStorage
  const loadLocalState = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // 1. Cargar retos completados localmente
    const loadedChallenges: Record<number, boolean> = {};
    for (let i = 0; i < 10; i++) {
      try {
        const val = localStorage.getItem(`usach_challenge_${i}_completed`);
        loadedChallenges[i] = val === 'true';
      } catch {
        loadedChallenges[i] = false;
      }
    }
    setLocalCompleted(loadedChallenges);

    // 2. Cargar caché de balances de NFT para la dirección activa
    if (address) {
      try {
        const cached = localStorage.getItem(`usach_nft_balances_${address.toLowerCase()}`);
        if (cached) {
          const parsed = JSON.parse(cached) as string[];
          setNftBalances(parsed.map(val => BigInt(val)));
          setHasCachedBalances(true);
        } else {
          setNftBalances(Array(10).fill(0n));
          setHasCachedBalances(false);
        }
      } catch {
        setNftBalances(Array(10).fill(0n));
        setHasCachedBalances(false);
      }
    } else {
      setNftBalances(Array(10).fill(0n));
      setHasCachedBalances(false);
    }
  }, [address]);

  // Cargar estado inicial al montar o cuando cambie la dirección
  useEffect(() => {
    loadLocalState();
  }, [loadLocalState]);

  // Escuchar eventos de actualización locales y globales de almacenamiento
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('usach_challenges_updated', loadLocalState);
    window.addEventListener('storage', loadLocalState); // Sincronización entre pestañas

    return () => {
      window.removeEventListener('usach_challenges_updated', loadLocalState);
      window.removeEventListener('storage', loadLocalState);
    };
  }, [loadLocalState]);

  // Consultar en lote las reliquias (ERC-1155) de la dirección del usuario conectado
  const { data: batchBalances, refetch: refetchBalances, isLoading: isLoadingBalances } = useReadContract({
    ...BASE_ERC1155_CONTRACT,
    functionName: 'balanceOfBatch',
    args: address ? [
      Array(10).fill(address),
      Array.from({ length: 10 }, (_, i) => BigInt(i))
    ] : undefined,
    query: {
      enabled: isHydrated && !!address,
    }
  });

  // Callback de sincronización: actualiza el estado y escribe en caché local en cuanto se resuelve la promesa de Wagmi
  useEffect(() => {
    if (batchBalances && address) {
      const balancesArray = batchBalances as bigint[];
      setNftBalances(balancesArray);
      setHasCachedBalances(true);
      try {
        // Almacenar como strings de números para evitar error de serialización de BigInt
        const stringified = JSON.stringify(balancesArray.map(b => b.toString()));
        localStorage.setItem(`usach_nft_balances_${address.toLowerCase()}`, stringified);
      } catch (e) {
        console.error('Error al guardar cache de reliquias:', e);
      }
    }
  }, [batchBalances, address]);

  // Determinar si posee el NFT relic para un desafío específico
  const hasNft = useCallback((id: number) => {
    if (!isConnected || !address) return false;
    const balance = nftBalances[id];
    return balance !== undefined && balance > 0n;
  }, [isConnected, address, nftBalances]);

  // Si el desafío está completado (ya sea porque posee el NFT on-chain o porque completó el paso localmente)
  const isCompleted = useCallback((id: number) => {
    if (!isConnected) return false;
    if (hasNft(id)) return true;
    if (id === 0) return true; // El paso 0 (conectar billetera) está completo si está conectado
    return !!localCompleted[id];
  }, [isConnected, hasNft, localCompleted]);

  // Determinar el índice del desafío activo actual (el primer desafío donde NO posee el NFT relic)
  const activeChallengeIndex = useMemo(() => {
    if (!isConnected) return 0;
    const index = Array.from({ length: 10 }, (_, i) => i).findIndex((idx) => !hasNft(idx));
    return index === -1 ? 10 : index;
  }, [isConnected, hasNft]);

  const completeChallenge = useCallback((id: number) => {
    trackChallengeCompletion(id);
  }, []);

  return {
    localCompleted,
    ownedBalances: nftBalances,
    hasNft,
    isCompleted,
    activeChallengeIndex,
    // Solo bloquea si no tiene balances en caché y está cargando por primera vez desde la blockchain
    isLoading: isLoadingBalances && !hasCachedBalances,
    refetch: refetchBalances,
    completeChallenge
  };
}
