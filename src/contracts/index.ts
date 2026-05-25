import { studentIdentityAbi } from './abis/studentIdentity';
import { tokenFactoryAbi } from './abis/tokenFactory';
import { baseERC1155Abi } from './abis/baseERC1155';
import { baseERC20Abi } from './abis/baseERC20';

// Direcciones por defecto de la red local Hardhat (localhost)
const DEFAULT_STUDENT_IDENTITY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const DEFAULT_TOKEN_FACTORY_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const DEFAULT_BASE_ERC1155_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

export const STUDENT_IDENTITY_CONTRACT = {
  address: (process.env.NEXT_PUBLIC_STUDENT_IDENTITY_ADDRESS || DEFAULT_STUDENT_IDENTITY_ADDRESS) as `0x${string}`,
  abi: studentIdentityAbi,
} as const;

export const TOKEN_FACTORY_CONTRACT = {
  address: (process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS || DEFAULT_TOKEN_FACTORY_ADDRESS) as `0x${string}`,
  abi: tokenFactoryAbi,
} as const;

export const BASE_ERC1155_CONTRACT = {
  address: (process.env.NEXT_PUBLIC_BASE_ERC1155_ADDRESS || DEFAULT_BASE_ERC1155_ADDRESS) as `0x${string}`,
  abi: baseERC1155Abi,
} as const;

/**
 * Retorna la configuración para interactuar con un token ERC20 dinámico.
 * @param address Dirección del contrato ERC20
 */
export const getBaseERC20Contract = (address: `0x${string}`) => ({
  address,
  abi: baseERC20Abi,
} as const);

/**
 * Retorna la configuración para interactuar con un token ERC1155 dinámico.
 * @param address Dirección del contrato ERC1155
 */
export const getBaseERC1155Contract = (address: `0x${string}`) => ({
  address,
  abi: baseERC1155Abi,
} as const);
