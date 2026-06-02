import type { NextApiRequest, NextApiResponse } from 'next';
import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, encodePacked, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { STUDENT_IDENTITY_CONTRACT, TOKEN_FACTORY_CONTRACT, DEX_FACTORY_CONTRACT, WETH_CONTRACT, DEPLOYMENT_BLOCK } from '@/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  const { userAddress, id } = req.body;

  if (!userAddress || id === undefined) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: userAddress, id.' });
  }

  const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });

  // Validación estricta on-chain para el Desafío 3 (ID: 2 - Registro de Identidad)
  if (Number(id) === 2) {
    try {

      const profile = await publicClient.readContract({
        ...STUDENT_IDENTITY_CONTRACT,
        functionName: 'getProfile',
        args: [userAddress as `0x${string}`],
      });

      const isRegistered = profile[6];
      if (!isRegistered) {
        return res.status(400).json({ error: 'La dirección del usuario no tiene un registro de identidad activo en la blockchain.' });
      }
    } catch (contractError: any) {
      console.error('Error al verificar el registro de identidad on-chain:', contractError);
      return res.status(500).json({ error: `Error de verificación on-chain: ${contractError.message || 'No se pudo consultar el contrato inteligente.'}` });
    }
  }

  // Validación estricta on-chain para el Desafío 4 (ID: 3 - Creación de Token ERC-20 Personalizado)
  if (Number(id) === 3) {
    try {

      const createdTokens = await publicClient.readContract({
        ...TOKEN_FACTORY_CONTRACT,
        functionName: 'getTokensByOwner',
        args: [userAddress as `0x${string}`],
      });

      if (!createdTokens || (createdTokens as any).length === 0) {
        return res.status(400).json({ error: 'La dirección del usuario no ha creado ningún token ERC-20 en la fábrica.' });
      }
    } catch (contractError: any) {
      console.error('Error al verificar la creación del token ERC-20 on-chain:', contractError);
      return res.status(500).json({ error: `Error de verificación on-chain: ${contractError.message || 'No se pudo consultar el contrato inteligente.'}` });
    }
  }

  // Validación estricta on-chain para el Desafío 5 (ID: 4 - Acuñación y Transferencia de Tokens)
  if (Number(id) === 4) {
    try {

      // 1. Obtener los tokens creados por el usuario en la fábrica
      const userTokens = await publicClient.readContract({
        ...TOKEN_FACTORY_CONTRACT,
        functionName: 'getTokensByOwner',
        args: [userAddress as `0x${string}`],
      });

      if (!userTokens || (userTokens as any).length === 0) {
        return res.status(400).json({ error: 'La dirección del usuario no ha creado ningún token ERC-20 en la fábrica.' });
      }

      // 2. Buscar eventos de acuñación (Transfer de 0x0 al usuario)
      const mintLogs = await publicClient.getLogs({
        address: userTokens as `0x${string}`[],
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
          to: userAddress as `0x${string}`
        },
        fromBlock: DEPLOYMENT_BLOCK
      });

      if (mintLogs.length === 0) {
        return res.status(400).json({ error: 'No se encontró ningún evento de acuñación (mint) para sus tokens creados.' });
      }

      // 3. Buscar eventos de transferencia (Transfer desde el usuario a cualquier otra cuenta)
      const transferLogs = await publicClient.getLogs({
        address: userTokens as `0x${string}`[],
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
          from: userAddress as `0x${string}`
        },
        fromBlock: DEPLOYMENT_BLOCK
      });

      const mintedTokenAddresses = new Set(mintLogs.map(log => log.address.toLowerCase()));
      const transferredTokenAddresses = new Set(
        transferLogs
          .filter(log => {
            const toAddress = log.args.to;
            return toAddress && 
                   toAddress.toLowerCase() !== (userAddress as string).toLowerCase() && 
                   toAddress !== '0x0000000000000000000000000000000000000000';
          })
          .map(log => log.address.toLowerCase())
      );

      const hasMintAndTransfer = Array.from(mintedTokenAddresses).some(addr => transferredTokenAddresses.has(addr));

      if (!hasMintAndTransfer) {
        return res.status(400).json({ error: 'Debe acuñar un token de la fábrica y luego transferirlo a otra dirección.' });
      }
    } catch (contractError: any) {
      console.error('Error al verificar la acuñación y transferencia on-chain:', contractError);
      return res.status(500).json({ error: `Error de verificación on-chain: ${contractError.message || 'No se pudo consultar la blockchain.'}` });
    }
  }

  // Validación estricta on-chain para el Desafío 6 (ID: 5 - Intercambio en el Mercado Descentralizado (Swap))
  if (Number(id) === 5) {
    try {

      // 1. Obtener la cantidad de pools en la fábrica del DEX
      const count = await publicClient.readContract({
        ...DEX_FACTORY_CONTRACT,
        functionName: 'cantidadPools',
      }) as bigint;
      const poolsCount = Number(count);

      if (poolsCount === 0) {
        return res.status(400).json({ error: 'No existen pools de liquidez creados en el DEX.' });
      }

      // 2. Obtener las direcciones de todos los pools
      const poolPromises = Array.from({ length: poolsCount }, (_, i) =>
        publicClient.readContract({
          ...DEX_FACTORY_CONTRACT,
          functionName: 'todosLosPools',
          args: [BigInt(i)],
        }) as Promise<`0x${string}`>
      );
      const pools = await Promise.all(poolPromises);

      // 3. Buscar eventos de Swap asociados al usuario en cualquiera de los pools
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
          usuario: userAddress as `0x${string}`
        },
        fromBlock: DEPLOYMENT_BLOCK
      });

      if (swapLogs.length === 0) {
        return res.status(400).json({ error: 'No se encontró ningún evento de intercambio (Swap) realizado por el usuario en los pools del DEX.' });
      }
    } catch (contractError: any) {
      console.error('Error al verificar el intercambio (Swap) on-chain:', contractError);
      return res.status(500).json({ error: `Error de verificación on-chain: ${contractError.message || 'No se pudo consultar la blockchain.'}` });
    }
  }

  // Validación estricta on-chain para el Desafío 7 (ID: 6 - Provisión de Liquidez en el DEX)
  if (Number(id) === 6) {
    try {

      // 1. Obtener la cantidad de pools en la fábrica del DEX
      const count = await publicClient.readContract({
        ...DEX_FACTORY_CONTRACT,
        functionName: 'cantidadPools',
      }) as bigint;
      const poolsCount = Number(count);

      if (poolsCount === 0) {
        return res.status(400).json({ error: 'No existen pools de liquidez creados en el DEX.' });
      }

      // 2. Obtener las direcciones de todos los pools
      const poolPromises = Array.from({ length: poolsCount }, (_, i) =>
        publicClient.readContract({
          ...DEX_FACTORY_CONTRACT,
          functionName: 'todosLosPools',
          args: [BigInt(i)],
        }) as Promise<`0x${string}`>
      );
      const pools = await Promise.all(poolPromises);

      // 3. Buscar eventos de LiquidezAgregada asociados al usuario en cualquiera de los pools
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
          proveedor: userAddress as `0x${string}`
        },
        fromBlock: DEPLOYMENT_BLOCK
      });

      if (liquidezLogs.length === 0) {
        return res.status(400).json({ error: 'No se encontró ningún evento de provisión de liquidez (LiquidezAgregada) realizado por el usuario en los pools del DEX.' });
      }
    } catch (contractError: any) {
      console.error('Error al verificar la provisión de liquidez on-chain:', contractError);
      return res.status(500).json({ error: `Error de verificación on-chain: ${contractError.message || 'No se pudo consultar la blockchain.'}` });
    }
  }

  // Validación estricta on-chain para el Desafío 8 (ID: 7 - Creación de una Piscina de Liquidez)
  if (Number(id) === 7) {
    try {

      // 1. Obtener los tokens creados por el usuario en la fábrica
      const userTokens = await publicClient.readContract({
        ...TOKEN_FACTORY_CONTRACT,
        functionName: 'getTokensByOwner',
        args: [userAddress as `0x${string}`],
      });

      if (!userTokens || (userTokens as any).length === 0) {
        return res.status(400).json({ error: 'La dirección del usuario no ha creado ningún token ERC-20 en la fábrica.' });
      }

      // 2. Buscar eventos de creación de pool (PoolCreado)
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
        fromBlock: DEPLOYMENT_BLOCK
      });

      const userTokensLower = (userTokens as string[]).map(t => t.toLowerCase());

      const userPoolLogs = poolCreatedLogs.filter(log => {
        const token0 = log.args.token0?.toLowerCase();
        const token1 = log.args.token1?.toLowerCase();
        return (token0 && userTokensLower.includes(token0)) || (token1 && userTokensLower.includes(token1));
      });

      if (userPoolLogs.length === 0) {
        return res.status(400).json({ error: 'No se encontró ninguna piscina de liquidez creada para sus tokens personalizados.' });
      }

      // 3. Verificar que la transacción que creó la piscina fue enviada por el usuario
      let isCreator = false;
      for (const log of userPoolLogs) {
        if (log.transactionHash) {
          const tx = await publicClient.getTransaction({
            hash: log.transactionHash,
          });
          if (tx.from.toLowerCase() === (userAddress as string).toLowerCase()) {
            isCreator = true;
            break;
          }
        }
      }

      if (!isCreator) {
        return res.status(400).json({ error: 'Debe ser el creador original de la piscina de liquidez para completar este desafío.' });
      }
    } catch (contractError: any) {
      console.error('Error al verificar la creación de piscina de liquidez on-chain:', contractError);
      return res.status(500).json({ error: `Error de verificación on-chain: ${contractError.message || 'No se pudo consultar la blockchain.'}` });
    }
  }

  // Validación estricta on-chain para el Desafío 9 (ID: 8 - Envoltura de Ether (WETH))
  if (Number(id) === 8) {
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
          dst: userAddress as `0x${string}`
        },
        fromBlock: DEPLOYMENT_BLOCK
      });

      if (depositLogs.length === 0) {
        return res.status(400).json({ error: 'No se encontró ningún evento de depósito/envoltura (Deposit) en el contrato WETH para esta dirección.' });
      }
    } catch (contractError: any) {
      console.error('Error al verificar la envoltura de WETH on-chain:', contractError);
      return res.status(500).json({ error: `Error de verificación on-chain: ${contractError.message || 'No se pudo consultar la blockchain.'}` });
    }
  }
  // Validación estricta on-chain para el Desafío 10 (ID: 9 - Maestría en Interacción On-Chain)
  if (Number(id) === 9) {
    try {
      // 1. Obtener la lista de todos los tokens de la factory y los creados por el usuario
      const allTokens = await publicClient.readContract({
        ...TOKEN_FACTORY_CONTRACT,
        functionName: 'getAllTokens',
      }) as `0x${string}`[];

      const userTokens = await publicClient.readContract({
        ...TOKEN_FACTORY_CONTRACT,
        functionName: 'getTokensByOwner',
        args: [userAddress as `0x${string}`],
      }) as `0x${string}`[];

      // Requisito 3: Haber creado al menos 5 tokens en la plataforma
      if (!userTokens || userTokens.length < 5) {
        return res.status(400).json({ error: `Debe haber creado al menos 5 tokens en la plataforma. Actual: ${userTokens ? userTokens.length : 0}` });
      }

      const userTokensSet = new Set(userTokens.map(t => t.toLowerCase()));
      const foreignTokens = allTokens.filter(t => !userTokensSet.has(t.toLowerCase()));

      // Requisito 1: Tener balance superior a 0 en más de 10 tokens creados por la factory de los cuales no sea dueño
      let tokensWithBalanceCount = 0;
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
              args: [userAddress as `0x${string}`],
            });
            return balance > 0n;
          } catch (e) {
            return false;
          }
        });
        const balancesResults = await Promise.all(balancePromises);
        tokensWithBalanceCount = balancesResults.filter(Boolean).length;
      }

      if (tokensWithBalanceCount <= 10) {
        return res.status(400).json({ error: `Debe tener balance superior a 0 en más de 10 tokens creados por otros usuarios. Actual: ${tokensWithBalanceCount}` });
      }

      // Requisito 2: Agregar liquidez a 5 diferentes pools de los cuales no sean dueños/creadores y formen par con WETH
      const count = await publicClient.readContract({
        ...DEX_FACTORY_CONTRACT,
        functionName: 'cantidadPools',
      }) as bigint;
      const poolsCount = Number(count);

      if (poolsCount === 0) {
        return res.status(400).json({ error: 'No existen pools de liquidez creados en el DEX.' });
      }

      // Obtener direcciones de todos los pools
      const poolPromises = Array.from({ length: poolsCount }, (_, i) =>
        publicClient.readContract({
          ...DEX_FACTORY_CONTRACT,
          functionName: 'todosLosPools',
          args: [BigInt(i)],
        }) as Promise<`0x${string}`>
      );
      const pools = await Promise.all(poolPromises);

      // Obtener tokens que componen cada pool
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

      // Filtrar pools que tienen par con WETH
      const wethLower = WETH_CONTRACT.address.toLowerCase();
      const wethPools = poolsData.filter(p => 
        p.token0.toLowerCase() === wethLower || p.token1.toLowerCase() === wethLower
      );

      // Filtrar pools que no correspondan a tokens creados por el usuario
      const nonOwnerWethPools = wethPools.filter(p => {
        const otherToken = p.token0.toLowerCase() === wethLower ? p.token1 : p.token0;
        return !userTokensSet.has(otherToken.toLowerCase());
      });

      if (nonOwnerWethPools.length === 0) {
        return res.status(400).json({ error: 'No se encontraron pools de par con WETH de los cuales no sea dueño de los tokens.' });
      }

      // Buscar eventos de LiquidezAgregada en estos pools para el usuario
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
          proveedor: userAddress as `0x${string}`
        },
        fromBlock: DEPLOYMENT_BLOCK
      });

      const poolsWithLiquidity = new Set(liquidezLogs.map(log => log.address.toLowerCase()));

      // Obtener creadores de las piscinas
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
        fromBlock: DEPLOYMENT_BLOCK
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

      let foreignLiquidityPoolCount = 0;
      for (const pAddr of poolsWithLiquidity) {
        if (poolCreators[pAddr] !== (userAddress as string).toLowerCase()) {
          foreignLiquidityPoolCount++;
        }
      }

      if (foreignLiquidityPoolCount < 5) {
        return res.status(400).json({ error: `Debe agregar liquidez a al menos 5 pools de par con WETH de los cuales no sea dueño o creador. Actual: ${foreignLiquidityPoolCount}` });
      }

    } catch (contractError: any) {
      console.error('Error al verificar la actividad criptográfica on-chain:', contractError);
      return res.status(500).json({ error: `Error de verificación on-chain: ${contractError.message || 'No se pudo consultar la blockchain.'}` });
    }
  }



  try {
    const privateKey = process.env.NEXT_PUBLIC_CHALLENGE_MINTER_SIGNER_PK;
    const challengeMinterAddress = process.env.NEXT_PUBLIC_CHALLENGE_MINTER_ADDRESS || '0xd898ecBD77E4A428e9EAC2B1E445c2628E033653';

    if (!privateKey) {
      return res.status(500).json({ error: 'Clave privada del firmante no configurada en el servidor.' });
    }

    // Formatear la clave privada para viem
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);

    // Generar un salt determinista único para este desafío y usuario
    const salt = keccak256(
      encodePacked(
        ['address', 'uint256', 'string'],
        [userAddress as `0x${string}`, BigInt(id), 'usach-defi-salt-nonce']
      )
    );

    // Reconstruir el hash del mensaje tal como lo hace el contrato inteligente
    const messageHash = keccak256(
      encodePacked(
        ['address', 'uint256', 'bytes32', 'address'],
        [
          userAddress as `0x${string}`,
          BigInt(id),
          salt,
          challengeMinterAddress as `0x${string}`
        ]
      )
    );

    // Firmar el hash del mensaje usando ECDSA
    const signature = await account.signMessage({
      message: { raw: messageHash }
    });

    return res.status(200).json({
      id,
      salt,
      signature
    });
  } catch (error: any) {
    console.error('Error al generar la firma del reclamo:', error);
    return res.status(500).json({ error: `Error interno al firmar: ${error.message}` });
  }
}
