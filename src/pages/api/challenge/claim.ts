import type { NextApiRequest, NextApiResponse } from 'next';
import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, encodePacked, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { STUDENT_IDENTITY_CONTRACT, TOKEN_FACTORY_CONTRACT, DEX_FACTORY_CONTRACT, DEPLOYMENT_BLOCK } from '@/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  const { userAddress, id } = req.body;

  if (!userAddress || id === undefined) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: userAddress, id.' });
  }

  // Validación estricta on-chain para el Desafío 3 (ID: 2 - Registro de Identidad)
  if (Number(id) === 2) {
    try {
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
      });

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
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
      });

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
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
      });

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
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
      });

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
