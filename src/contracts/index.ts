import { studentIdentityAbi } from './abis/studentIdentity';
import { tokenFactoryAbi } from './abis/tokenFactory';
import { baseERC1155Abi } from './abis/baseERC1155';
import { baseERC20Abi } from './abis/baseERC20';
import { dexFactoryAbi } from './abis/dexFactory';
import { dexPoolAbi } from './abis/dexPool';
import { wethABI } from './abis/weth';
import { challengeMinterAbi } from './abis/challengeMinter';

// Direcciones por defecto de la red local Hardhat (localhost)
const DEFAULT_STUDENT_IDENTITY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const DEFAULT_TOKEN_FACTORY_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const DEFAULT_BASE_ERC1155_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
const DEFAULT_DEX_FACTORY_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
const DEFAULT_WETH_ADDRESS = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6';
const DEFAULT_CHALLENGE_MINTER_ADDRESS = '0xd898ecBD77E4A428e9EAC2B1E445c2628E033653';

// Bloque de despliegue en Sepolia (para optimizar la búsqueda de eventos y evitar límites de RPC)
const DEFAULT_DEPLOYMENT_BLOCK = '10968530';
export const DEPLOYMENT_BLOCK = BigInt(process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK || DEFAULT_DEPLOYMENT_BLOCK);

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

export const DEX_FACTORY_CONTRACT = {
  address: (process.env.NEXT_PUBLIC_DEX_FACTORY_ADDRESS || DEFAULT_DEX_FACTORY_ADDRESS) as `0x${string}`,
  abi: dexFactoryAbi,
} as const;

export const WETH_CONTRACT = {
  address: (process.env.NEXT_PUBLIC_WETH_ADDRESS || DEFAULT_WETH_ADDRESS) as `0x${string}`,
  abi: wethABI,
} as const;

export const CHALLENGE_MINTER_CONTRACT = {
  address: (process.env.NEXT_PUBLIC_CHALLENGE_MINTER_ADDRESS || DEFAULT_CHALLENGE_MINTER_ADDRESS) as `0x${string}`,
  abi: challengeMinterAbi,
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

/**
 * Retorna la configuración para interactuar con una piscina de DEXPool dinámica.
 * @param address Dirección del contrato DEXPool
 */
export const getDEXPoolContract = (address: `0x${string}`) => ({
  address,
  abi: dexPoolAbi,
} as const);

