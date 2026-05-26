import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { WETH_CONTRACT } from '@/contracts';
import { useHydrated } from './useHydrated';

/**
 * Hook para interactuar con el contrato WETH (deposit/withdraw/ERC20) de forma reactiva.
 * Refleja fielmente todas las capacidades expuestas por WETH.sol.
 * @param userAddress Dirección de la billetera del usuario conectado.
 */
export function useWETH(userAddress?: `0x${string}`) {
  const isHydrated = useHydrated();

  // 1. Consultar balance de ETH nativo
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: userAddress,
    query: {
      enabled: isHydrated && !!userAddress,
    },
  });

  // 2. Consultar balance de WETH
  const { data: wethBalance, refetch: refetchWethBalance } = useReadContract({
    ...WETH_CONTRACT,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: isHydrated && !!userAddress,
    },
  });

  // 3. Consultar metadatos generales
  const { data: name } = useReadContract({
    ...WETH_CONTRACT,
    functionName: 'name',
    query: {
      enabled: isHydrated,
    },
  });

  const { data: symbol } = useReadContract({
    ...WETH_CONTRACT,
    functionName: 'symbol',
    query: {
      enabled: isHydrated,
    },
  });

  const { data: decimals } = useReadContract({
    ...WETH_CONTRACT,
    functionName: 'decimals',
    query: {
      enabled: isHydrated,
    },
  });

  const { data: totalSupply } = useReadContract({
    ...WETH_CONTRACT,
    functionName: 'totalSupply',
    query: {
      enabled: isHydrated,
    },
  });

  // 4. Acciones de escritura (deposit, withdraw, approve, transfer, transferFrom)
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isWaitingForTx, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Envuelve ETH nativo enviando valor payable al contrato de WETH.
   * @param amount Cantidad de ETH en wei a envolver.
   */
  const deposit = (amount: bigint) => {
    writeContract({
      ...WETH_CONTRACT,
      functionName: 'deposit',
      value: amount,
    });
  };

  /**
   * Quema tokens WETH para recibir ETH nativo.
   * @param amount Cantidad de WETH en wei a retirar y desenvolver.
   */
  const withdraw = (amount: bigint) => {
    writeContract({
      ...WETH_CONTRACT,
      functionName: 'withdraw',
      args: [amount],
    });
  };

  /**
   * Aprueba a un tercero a gastar una cantidad de tokens WETH.
   * @param guy Dirección autorizada a gastar.
   * @param wad Cantidad autorizada.
   */
  const approve = (guy: `0x${string}`, wad: bigint) => {
    writeContract({
      ...WETH_CONTRACT,
      functionName: 'approve',
      args: [guy, wad],
    });
  };

  /**
   * Transfiere tokens WETH a un destinatario.
   * @param dst Dirección del destinatario.
   * @param wad Cantidad de tokens a transferir.
   */
  const transfer = (dst: `0x${string}`, wad: bigint) => {
    writeContract({
      ...WETH_CONTRACT,
      functionName: 'transfer',
      args: [dst, wad],
    });
  };

  /**
   * Transfiere tokens WETH en representación de otra dirección.
   * @param src Dirección del propietario de los fondos.
   * @param dst Dirección del destinatario.
   * @param wad Cantidad de tokens a transferir.
   */
  const transferFrom = (src: `0x${string}`, dst: `0x${string}`, wad: bigint) => {
    writeContract({
      ...WETH_CONTRACT,
      functionName: 'transferFrom',
      args: [src, dst, wad],
    });
  };

  const refetchBalances = async () => {
    await Promise.all([refetchEthBalance(), refetchWethBalance()]);
  };

  return {
    metadata: {
      name: (name as string) || 'Wrapped Ether',
      symbol: (symbol as string) || 'WETH',
      decimals: decimals ? Number(decimals) : 18,
      totalSupply: totalSupply ? (totalSupply as bigint) : 0n,
    },
    ethBalance: ethBalance ? ethBalance.value : 0n,
    wethBalance: wethBalance ? (wethBalance as bigint) : 0n,
    deposit,
    withdraw,
    approve,
    transfer,
    transferFrom,
    isPending: isPending || isWaitingForTx,
    isSuccess,
    hash,
    error,
    refetchBalances,
  };
}
