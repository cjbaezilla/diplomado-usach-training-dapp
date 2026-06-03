import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useReadContract, useBalance, usePublicClient, useBlockNumber } from 'wagmi';
import { BASE_ERC1155_CONTRACT, STUDENT_IDENTITY_CONTRACT, TOKEN_FACTORY_CONTRACT, DEX_FACTORY_CONTRACT, WETH_CONTRACT, DEPLOYMENT_BLOCK } from '@/contracts';
import { useHydrated } from './useHydrated';
import challengesData from '../../public/desafios.json';

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
  const publicClient = usePublicClient();
  
  const { data: blockNumber } = useBlockNumber({
    watch: true,
  });

  const safeFromBlock = useMemo(() => {
    if (!blockNumber) return DEPLOYMENT_BLOCK;
    const limit = 9500n;
    const diff = blockNumber - DEPLOYMENT_BLOCK;
    if (diff > limit) {
      return blockNumber - limit;
    }
    return DEPLOYMENT_BLOCK;
  }, [blockNumber]);
  
  // Consultar balance de ETH nativo para validar Desafío #02 (Faucet)
  const { data: ethBalanceData, refetch: refetchEthBalance } = useBalance({
    address,
    query: {
      enabled: isHydrated && !!address,
    },
  });
  
  // Consultar perfil de estudiante para validar Desafío #03 (Registro Identidad)
  const { data: studentProfileData, refetch: refetchStudentProfile } = useReadContract({
    ...STUDENT_IDENTITY_CONTRACT,
    functionName: 'getProfile',
    args: [address || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: isHydrated && !!address,
    },
  });

  const isStudentRegistered = useMemo(() => {
    if (!studentProfileData) return false;
    return (studentProfileData as any)[6] === true;
  }, [studentProfileData]);

  // Consultar tokens creados por el usuario en TokenFactory para validar Desafío #04 (Creación Token ERC-20 Personalizado)
  const { data: createdTokensData, refetch: refetchCreatedTokens } = useReadContract({
    ...TOKEN_FACTORY_CONTRACT,
    functionName: 'getTokensByOwner',
    args: [address || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: isHydrated && !!address,
    },
  });

  const hasCreatedToken = useMemo(() => {
    if (!createdTokensData) return false;
    return (createdTokensData as any).length > 0;
  }, [createdTokensData]);

  // Estado y callback para validar el Desafío #05 (Acuñación y Transferencia de Tokens ERC-20)
  const [isMintAndTransferCompleted, setIsMintAndTransferCompleted] = useState(false);

  const checkMintAndTransfer = useCallback(async () => {
    if (!publicClient || !address || !blockNumber) {
      setIsMintAndTransferCompleted(false);
      return;
    }
    try {
      const userTokens = createdTokensData as `0x${string}`[];

      if (!userTokens || userTokens.length === 0) {
        setIsMintAndTransferCompleted(false);
        return;
      }

      // Buscar eventos de acuñación (Transfer de 0x0 al usuario)
      const mintLogs = await publicClient.getLogs({
        address: userTokens,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', name: 'from', indexed: true },
            { type: 'address', name: 'to', indexed: true },
            { type: 'uint256', name: 'value' }
          ]
        },
        args: {
          from: '0x0000000000000000000000000000000000000000',
          to: address
        },
        fromBlock: safeFromBlock
      });

      if (mintLogs.length === 0) {
        setIsMintAndTransferCompleted(false);
        return;
      }

      // Buscar eventos de transferencia (Transfer desde el usuario a cualquier otra cuenta)
      const transferLogs = await publicClient.getLogs({
        address: userTokens,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', name: 'from', indexed: true },
            { type: 'address', name: 'to', indexed: true },
            { type: 'uint256', name: 'value' }
          ]
        },
        args: {
          from: address
        },
        fromBlock: safeFromBlock
      });

      const mintedTokenAddresses = new Set(mintLogs.map(log => log.address.toLowerCase()));
      const transferredTokenAddresses = new Set(
        transferLogs
          .filter(log => {
            const toAddress = log.args.to;
            return toAddress && 
                   toAddress.toLowerCase() !== address.toLowerCase() && 
                   toAddress !== '0x0000000000000000000000000000000000000000';
          })
          .map(log => log.address.toLowerCase())
      );

      const hasMintAndTransfer = Array.from(mintedTokenAddresses).some(addr => transferredTokenAddresses.has(addr));
      setIsMintAndTransferCompleted(hasMintAndTransfer);
    } catch (err) {
      console.error('Error al verificar desafío de acuñación y transferencia:', err);
      setIsMintAndTransferCompleted(false);
    }
  }, [publicClient, address, createdTokensData, blockNumber, safeFromBlock]);

  useEffect(() => {
    checkMintAndTransfer();
  }, [checkMintAndTransfer]);

  // Estado y callback para validar el Desafío #06 (Intercambio en el Mercado Descentralizado (Swap))
  const [isSwapCompleted, setIsSwapCompleted] = useState(false);

  const checkSwap = useCallback(async () => {
    if (!publicClient || !address || !blockNumber) {
      setIsSwapCompleted(false);
      return;
    }
    try {
      const count = await publicClient.readContract({
        ...DEX_FACTORY_CONTRACT,
        functionName: 'cantidadPools',
      }) as bigint;
      const poolsCount = Number(count);

      if (poolsCount === 0) {
        setIsSwapCompleted(false);
        return;
      }

      const poolPromises = Array.from({ length: poolsCount }, (_, i) =>
        publicClient.readContract({
          ...DEX_FACTORY_CONTRACT,
          functionName: 'todosLosPools',
          args: [BigInt(i)],
        }) as Promise<`0x${string}`>
      );
      const pools = await Promise.all(poolPromises);

      const swapLogs = await publicClient.getLogs({
        address: pools,
        event: {
          type: 'event',
          name: 'Swap',
          inputs: [
            { type: 'address', name: 'usuario', indexed: true },
            { type: 'address', name: 'tokenEntrada', indexed: true },
            { type: 'uint256', name: 'cantidadEntrada' },
            { type: 'uint256', name: 'cantidadSalida' }
          ]
        },
        args: {
          usuario: address
        },
        fromBlock: safeFromBlock
      });

      setIsSwapCompleted(swapLogs.length > 0);
    } catch (err) {
      console.error('Error al verificar desafío de swap:', err);
      setIsSwapCompleted(false);
    }
  }, [publicClient, address, blockNumber, safeFromBlock]);

  useEffect(() => {
    checkSwap();
  }, [checkSwap]);

  // Estado y callback para validar el Desafío #07 (Provisión de Liquidez en el DEX)
  const [isLiquidityCompleted, setIsLiquidityCompleted] = useState(false);

  const checkLiquidity = useCallback(async () => {
    if (!publicClient || !address || !blockNumber) {
      setIsLiquidityCompleted(false);
      return;
    }
    try {
      const count = await publicClient.readContract({
        ...DEX_FACTORY_CONTRACT,
        functionName: 'cantidadPools',
      }) as bigint;
      const poolsCount = Number(count);

      if (poolsCount === 0) {
        setIsLiquidityCompleted(false);
        return;
      }

      const poolPromises = Array.from({ length: poolsCount }, (_, i) =>
        publicClient.readContract({
          ...DEX_FACTORY_CONTRACT,
          functionName: 'todosLosPools',
          args: [BigInt(i)],
        }) as Promise<`0x${string}`>
      );
      const pools = await Promise.all(poolPromises);

      const liquidezLogs = await publicClient.getLogs({
        address: pools,
        event: {
          type: 'event',
          name: 'LiquidezAgregada',
          inputs: [
            { type: 'address', name: 'proveedor', indexed: true },
            { type: 'uint256', name: 'cantidad0' },
            { type: 'uint256', name: 'cantidad1' },
            { type: 'uint256', name: 'tokensLP' }
          ]
        },
        args: {
          proveedor: address
        },
        fromBlock: safeFromBlock
      });

      setIsLiquidityCompleted(liquidezLogs.length > 0);
    } catch (err) {
      console.error('Error al verificar desafío de liquidez:', err);
      setIsLiquidityCompleted(false);
    }
  }, [publicClient, address, blockNumber, safeFromBlock]);

  useEffect(() => {
    checkLiquidity();
  }, [checkLiquidity]);

  // Estado y callback para validar el Desafío #08 (ID: 7 - Creación de una Piscina de Liquidez)
  const [isCreatePoolCompleted, setIsCreatePoolCompleted] = useState(false);

  const checkCreatePool = useCallback(async () => {
    if (!publicClient || !address || !blockNumber) {
      setIsCreatePoolCompleted(false);
      return;
    }
    try {
      const userTokens = createdTokensData as `0x${string}`[];

      if (!userTokens || userTokens.length === 0) {
        setIsCreatePoolCompleted(false);
        return;
      }

      const count = await publicClient.readContract({
        ...DEX_FACTORY_CONTRACT,
        functionName: 'cantidadPools',
      }) as bigint;
      const poolsCount = Number(count);

      if (poolsCount === 0) {
        setIsCreatePoolCompleted(false);
        return;
      }

      const poolCreatedLogs = await publicClient.getLogs({
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
        fromBlock: safeFromBlock
      });

      const userTokensLower = userTokens.map(t => t.toLowerCase());

      const userPoolLogs = poolCreatedLogs.filter(log => {
        const token0 = log.args.token0?.toLowerCase();
        const token1 = log.args.token1?.toLowerCase();
        return (token0 && userTokensLower.includes(token0)) || (token1 && userTokensLower.includes(token1));
      });

      if (userPoolLogs.length === 0) {
        setIsCreatePoolCompleted(false);
        return;
      }

      let isCreator = false;
      for (const log of userPoolLogs) {
        if (log.transactionHash) {
          const tx = await publicClient.getTransaction({
            hash: log.transactionHash,
          });
          if (tx.from.toLowerCase() === address.toLowerCase()) {
            isCreator = true;
            break;
          }
        }
      }

      setIsCreatePoolCompleted(isCreator);
    } catch (err) {
      console.error('Error al verificar desafío de creación de piscina:', err);
      setIsCreatePoolCompleted(false);
    }
  }, [publicClient, address, createdTokensData, blockNumber, safeFromBlock]);

  useEffect(() => {
    checkCreatePool();
  }, [checkCreatePool]);

  // Estado y callback para validar el Desafío #09 (ID: 8 - Envoltura de Ether (WETH))
  const [isWethCompleted, setIsWethCompleted] = useState(false);

  const checkWeth = useCallback(async () => {
    if (!publicClient || !address || !blockNumber) {
      setIsWethCompleted(false);
      return;
    }
    try {
      // Buscar eventos de Deposit (Wrap) asociados al usuario en el contrato WETH
      const depositLogs = await publicClient.getLogs({
        address: WETH_CONTRACT.address,
        event: {
          type: 'event',
          name: 'Deposit',
          inputs: [
            { type: 'address', name: 'dst', indexed: true },
            { type: 'uint256', name: 'wad' }
          ]
        },
        args: {
          dst: address
        },
        fromBlock: safeFromBlock
      });

      setIsWethCompleted(depositLogs.length > 0);
    } catch (err) {
      console.error('Error al verificar desafío de WETH:', err);
      setIsWethCompleted(false);
    }
  }, [publicClient, address, blockNumber, safeFromBlock]);

  useEffect(() => {
    checkWeth();
  }, [checkWeth]);

  // Estado y contadores para validar el Desafío #10 (ID: 9 - Maestría en Interacción On-Chain)
  const [isActivityCompleted, setIsActivityCompleted] = useState(false);
  const [createdTokensCount, setCreatedTokensCount] = useState(0);
  const [foreignTokensWithBalanceCount, setForeignTokensWithBalanceCount] = useState(0);
  const [foreignLiquidityPoolsCount, setForeignLiquidityPoolsCount] = useState(0);

  const checkActivity = useCallback(async () => {
    if (!publicClient || !address || !blockNumber) {
      setIsActivityCompleted(false);
      setCreatedTokensCount(0);
      setForeignTokensWithBalanceCount(0);
      setForeignLiquidityPoolsCount(0);
      return;
    }
    try {
      // 1. Obtener todos los tokens creados por la fábrica
      const allTokens = await publicClient.readContract({
        ...TOKEN_FACTORY_CONTRACT,
        functionName: 'getAllTokens',
      }) as `0x${string}`[];

      // 2. Obtener los tokens creados por el propio usuario
      const userTokens = await publicClient.readContract({
        ...TOKEN_FACTORY_CONTRACT,
        functionName: 'getTokensByOwner',
        args: [address],
      }) as `0x${string}`[];

      const userTokensCount = userTokens ? userTokens.length : 0;
      setCreatedTokensCount(userTokensCount);

      const userTokensSet = new Set((userTokens || []).map(t => t.toLowerCase()));
      const foreignTokens = (allTokens || []).filter(t => !userTokensSet.has(t.toLowerCase()));

      // 3. Consultar balance de la dirección del usuario en cada uno de estos tokens
      let tokensWithBalance = 0;
      if (foreignTokens.length > 0) {
        const balancePromises = foreignTokens.map(async (tokenAddress) => {
          try {
            const balance = await publicClient.readContract({
              address: tokenAddress,
              abi: [
                {
                  "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
                  "name": "balanceOf",
                  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                  "stateMutability": "view",
                  "type": "function"
                }
              ] as const,
              functionName: 'balanceOf',
              args: [address],
            });
            return balance > 0n;
          } catch (e) {
            return false;
          }
        });
        const balancesResults = await Promise.all(balancePromises);
        tokensWithBalance = balancesResults.filter(Boolean).length;
      }
      setForeignTokensWithBalanceCount(tokensWithBalance);

      // Requisito 1: Tener balance > 0 en más de 10 tokens ajenos
      const req1 = tokensWithBalance > 10;

      // Requisito 3: Haber creado al menos 5 tokens
      const req3 = userTokensCount >= 5;

      // Requisito 2: Agregar liquidez a 5 diferentes pools ajenos de par con WETH
      let foreignLiquidityPoolCount = 0;
      const count = await publicClient.readContract({
        ...DEX_FACTORY_CONTRACT,
        functionName: 'cantidadPools',
      }) as bigint;
      const poolsCount = Number(count);

      if (poolsCount > 0) {
        const poolPromises = Array.from({ length: poolsCount }, (_, i) =>
          publicClient.readContract({
            ...DEX_FACTORY_CONTRACT,
            functionName: 'todosLosPools',
            args: [BigInt(i)],
          }) as Promise<`0x${string}`>
        );
        const pools = await Promise.all(poolPromises);

        const poolDataPromises = pools.map(async (poolAddress) => {
          try {
            const [token0, token1] = await Promise.all([
              publicClient.readContract({
                address: poolAddress,
                abi: [
                  {
                    "inputs": [],
                    "name": "token0",
                    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                    "stateMutability": "view",
                    "type": "function"
                  }
                ] as const,
                functionName: 'token0',
              }),
              publicClient.readContract({
                address: poolAddress,
                abi: [
                  {
                    "inputs": [],
                    "name": "token1",
                    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                    "stateMutability": "view",
                    "type": "function"
                  }
                ] as const,
                functionName: 'token1',
              })
            ]);
            return { poolAddress, token0, token1 };
          } catch (e) {
            return null;
          }
        });

        const poolsData = (await Promise.all(poolDataPromises)).filter(p => p !== null) as { poolAddress: `0x${string}`, token0: `0x${string}`, token1: `0x${string}` }[];

        const wethLower = WETH_CONTRACT.address.toLowerCase();
        const wethPools = poolsData.filter(p => 
          p.token0.toLowerCase() === wethLower || p.token1.toLowerCase() === wethLower
        );

        const nonOwnerWethPools = wethPools.filter(p => {
          const otherToken = p.token0.toLowerCase() === wethLower ? p.token1 : p.token0;
          return !userTokensSet.has(otherToken.toLowerCase());
        });

        if (nonOwnerWethPools.length > 0) {
          const poolAddressesToSearch = nonOwnerWethPools.map(p => p.poolAddress);
          const liquidezLogs = await publicClient.getLogs({
            address: poolAddressesToSearch,
            event: {
              type: 'event',
              name: 'LiquidezAgregada',
              inputs: [
                { type: 'address', name: 'proveedor', indexed: true },
                { type: 'uint256', name: 'cantidad0' },
                { type: 'uint256', name: 'cantidad1' },
                { type: 'uint256', name: 'tokensLP' }
              ]
            },
            args: {
              proveedor: address
            },
            fromBlock: safeFromBlock
          });

          const poolsWithLiquidity = new Set(liquidezLogs.map(log => log.address.toLowerCase()));

          const poolCreatedLogs = await publicClient.getLogs({
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
            fromBlock: safeFromBlock
          });

          const poolCreators: Record<string, string> = {};
          for (const log of poolCreatedLogs) {
            const pAddr = log.args.pool?.toLowerCase();
            if (pAddr && poolsWithLiquidity.has(pAddr) && log.transactionHash) {
              try {
                const tx = await publicClient.getTransaction({
                  hash: log.transactionHash,
                });
                poolCreators[pAddr] = tx.from.toLowerCase();
              } catch (txErr) {
                // Ignorar errores al buscar transacciones
              }
            }
          }

          for (const pAddr of poolsWithLiquidity) {
            if (poolCreators[pAddr] !== address.toLowerCase()) {
              foreignLiquidityPoolCount++;
            }
          }
        }
      }
      setForeignLiquidityPoolsCount(foreignLiquidityPoolCount);

      const req2 = foreignLiquidityPoolCount >= 5;

      setIsActivityCompleted(req1 && req2 && req3);
    } catch (err) {
      console.error('Error al verificar desafío de actividad criptográfica:', err);
      setIsActivityCompleted(false);
    }
  }, [publicClient, address, blockNumber, safeFromBlock]);

  useEffect(() => {
    checkActivity();
  }, [checkActivity]);
  
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
    args: [
      Array(10).fill(address || '0x0000000000000000000000000000000000000000'),
      Array.from({ length: 10 }, (_, i) => BigInt(i))
    ],
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

  // Determinar si posee el NFT relic para un desafío específico (por índice en el array)
  const hasNft = useCallback((index: number) => {
    if (!isConnected || !address) return false;
    const challenge = challengesData[index];
    if (!challenge) return false;
    const balance = nftBalances[challenge.rewardRelicNft];
    return balance !== undefined && balance > 0n;
  }, [isConnected, address, nftBalances]);

  // Si el desafío está completado (ya sea porque posee el NFT on-chain o porque completó el paso localmente)
  const isCompleted = useCallback((index: number) => {
    if (!isConnected) return false;
    if (hasNft(index)) return true;
    const challenge = challengesData[index];
    if (!challenge) return false;
    if (challenge.id === 0) return true; // El paso con id 0 (conectar billetera) está completo si está conectado
    
    // Desafío 2 (index 1, id 1: Faucet) se completa automáticamente si la cuenta posee un balance de ETH > 0 en Sepolia
    if (challenge.id === 1) {
      return !!(ethBalanceData && ethBalanceData.value > 0n) || !!localCompleted[challenge.id];
    }
    
    // Desafío 3 (index 2, id 2: Registro Identidad) se completa únicamente si el perfil está registrado on-chain
    if (challenge.id === 2) {
      return isStudentRegistered;
    }

    // Desafío 4 (index 3, id 3: Creación de Token ERC-20 Personalizado) se completa únicamente si existe algún token creado por la dirección del usuario en la fábrica
    if (challenge.id === 3) {
      return hasCreatedToken;
    }
    
    // Desafío 5 (index 4, id 4: Acuñación y Transferencia de Tokens) se completa si el usuario acuñó y transfirió un token, o si lo completó localmente
    if (challenge.id === 4) {
      return isMintAndTransferCompleted || !!localCompleted[challenge.id];
    }

    // Desafío 6 (index 5, id 5: Intercambio en el Mercado Descentralizado (Swap)) se completa si el usuario realizó un swap en el DEX, o si lo completó localmente
    if (challenge.id === 5) {
      return isSwapCompleted || !!localCompleted[challenge.id];
    }

    // Desafío 7 (index 6, id 6: Provisión de Liquidez en el DEX) se completa si el usuario aportó liquidez en el DEX, o si lo completó localmente
    if (challenge.id === 6) {
      return isLiquidityCompleted || !!localCompleted[challenge.id];
    }

    // Desafío 8 (index 7, id 7: Creación de una Piscina de Liquidez) se completa si el usuario creó un pool en el DEX, o si lo completó localmente
    if (challenge.id === 7) {
      return isCreatePoolCompleted || !!localCompleted[challenge.id];
    }

    // Desafío 9 (index 8, id 8: Envoltura de Ether (WETH)) se completa si el usuario envolvió ETH (Deposit), o si lo completó localmente
    if (challenge.id === 8) {
      return isWethCompleted || !!localCompleted[challenge.id];
    }
    // Desafío 10 (index 9, id 9: Maestría en Interacción On-Chain) se completa si el usuario cumplió los 3 requisitos de actividad on-chain, o si lo completó localmente
    if (challenge.id === 9) {
      return isActivityCompleted || !!localCompleted[challenge.id];
    }
    
    return !!localCompleted[challenge.id];
  }, [isConnected, hasNft, localCompleted, ethBalanceData, isStudentRegistered, hasCreatedToken, isMintAndTransferCompleted, isSwapCompleted, isLiquidityCompleted, isCreatePoolCompleted, isWethCompleted, isActivityCompleted]);

  // Determinar el índice del desafío activo actual (el primer desafío donde NO posee el NFT relic)
  const activeChallengeIndex = useMemo(() => {
    if (!isConnected) return 0;
    const index = challengesData.findIndex((_, idx) => !hasNft(idx));
    return index === -1 ? challengesData.length : index;
  }, [isConnected, hasNft]);

  const completeChallenge = useCallback((id: number) => {
    trackChallengeCompletion(id);
  }, []);

  // Función unificada para refrescar tanto balances de tokens como balance de ETH e identidad
  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchBalances(),
      refetchEthBalance(),
      refetchStudentProfile(),
      refetchCreatedTokens(),
      checkMintAndTransfer(),
      checkSwap(),
      checkLiquidity(),
      checkCreatePool(),
      checkWeth(),
      checkActivity()
    ]);
  }, [refetchBalances, refetchEthBalance, refetchStudentProfile, refetchCreatedTokens, checkMintAndTransfer, checkSwap, checkLiquidity, checkCreatePool, checkWeth, checkActivity]);

  return {
    localCompleted,
    ownedBalances: nftBalances,
    hasNft,
    isCompleted,
    activeChallengeIndex,
    // Solo bloquea si no tiene balances en caché y está cargando por primera vez desde la blockchain
    isLoading: isLoadingBalances && !hasCachedBalances,
    refetch: refetchAll,
    completeChallenge,
    createdTokensCount,
    foreignTokensWithBalanceCount,
    foreignLiquidityPoolsCount
  };
}
