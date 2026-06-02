import type { NextApiRequest, NextApiResponse } from 'next';
import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, encodePacked, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { STUDENT_IDENTITY_CONTRACT } from '@/contracts';

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
