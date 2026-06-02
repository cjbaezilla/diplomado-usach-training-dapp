import { trackChallengeCompletion } from '@/hooks/useChallenges';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { SEO } from '@/components/SEO';
import { useEffect, useState, useMemo } from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { baseERC20Abi } from '@/contracts/abis/baseERC20';
import { parseUnits } from 'viem';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Coins,
  Rocket,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
  ArrowLeft,
  Wallet,
  PlusCircle,
  Flame,
  Info,
  Copy,
  Check,
  Code,
  BookOpen,
  HelpCircle,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { useAllTokens, useTokenFactoryActions } from '@/hooks/useTokenFactory';
import { useBaseERC20, useERC20Balance } from '@/hooks/useBaseERC20';
import { useHydrated } from '@/hooks/useHydrated';
import { TokenIcon } from '@/components/TokenIcon';
import { Footer } from '@/components/Footer';

interface Transaction {
  id: string;
  type: 'deploy' | 'transfer' | 'mint' | 'burn';
  tokenSymbol: string;
  amount?: number;
  to?: string;
  hash: string;
  timestamp: string;
  status: 'exitoso' | 'pendiente';
}

interface TokenRowProps {
  tokenAddress: `0x${string}`;
  userAddress: `0x${string}`;
  onSelect: (address: `0x${string}`) => void;
  isSelected: boolean;
  onShowNotification?: (notification: { type: 'success' | 'error'; message: string }) => void;
}

function TokenRow({ tokenAddress, userAddress, onSelect, isSelected, onShowNotification }: TokenRowProps) {
  const { metadata, isLoadingMetadata } = useBaseERC20(tokenAddress);
  const { balance, isLoading: isLoadingBalance } = useERC20Balance(tokenAddress, userAddress);
  const [addressCopied, setAddressCopied] = useState(false);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar seleccionar el token al hacer clic en el botón de copiar
    navigator.clipboard.writeText(tokenAddress);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleAddTokenToWallet = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar cambiar la selección de token al hacer clic en el botón

    if (typeof window === 'undefined') return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      onShowNotification?.({
        type: 'error',
        message: 'No se detectó ninguna billetera compatible (ej. MetaMask).',
      });
      return;
    }

    try {
      // Usar PNG de Dicebear para compatibilidad visual con billeteras
      const diceBearUrl = `https://api.dicebear.com/9.x/rings/png?seed=${tokenAddress}`;

      const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
            image: diceBearUrl,
          },
        },
      });

      if (wasAdded) {
        onShowNotification?.({
          type: 'success',
          message: `¡Token ${metadata.symbol} añadido exitosamente a tu billetera!`,
        });
      } else {
        onShowNotification?.({
          type: 'error',
          message: `Operación cancelada. No se añadió ${metadata.symbol}.`,
        });
      }
    } catch (err: any) {
      console.error("Error adding token to wallet:", err);
      onShowNotification?.({
        type: 'error',
        message: `Error al añadir el token: ${err.message || 'Error desconocido'}`,
      });
    }
  };

  if (isLoadingMetadata || isLoadingBalance) {
    return (
      <tr className="animate-pulse">
        <td className="px-4 py-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
          <div className="space-y-1">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-3 w-10 bg-muted rounded" />
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="h-3 w-28 bg-muted rounded font-mono" />
        </td>
        <td className="px-4 py-4 text-right">
          <div className="h-4 w-16 bg-muted rounded ml-auto" />
        </td>
        <td className="px-4 py-4 text-center">
          <div className="h-8 w-8 bg-muted rounded mx-auto" />
        </td>
      </tr>
    );
  }

  const isOwner = metadata.owner.toLowerCase() === userAddress.toLowerCase();

  const formattedBalance = balance
    ? (Number(balance) / 10 ** metadata.decimals).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
    : '0.00';

  const formattedTotalSupply = metadata.totalSupply
    ? (Number(metadata.totalSupply) / 10 ** metadata.decimals).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })
    : '0';

  return (
    <tr
      className={cn(
        "hover:bg-muted/40 transition-colors cursor-pointer border-b border-border/20",
        isSelected && "bg-primary/10 border-l-2 border-l-primary"
      )}
      onClick={() => onSelect(tokenAddress)}
    >
      <td className="px-4 py-4 flex items-center gap-3 font-medium">
        <TokenIcon address={tokenAddress} className="h-8 w-8" />
        <div>
          <div className="font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
            {metadata.name}
            {isOwner && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500 border border-emerald-500/20">
                Creador
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{metadata.symbol}</div>
        </div>
      </td>
      <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>
            {tokenAddress.substring(0, 6)}...{tokenAddress.substring(tokenAddress.length - 4)}
          </span>
          <button
            onClick={handleCopyAddress}
            className="p-1 rounded hover:bg-primary/10 text-foreground/80 hover:text-primary transition-all duration-200 shrink-0"
            title="Copiar dirección del contrato"
          >
            {addressCopied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="font-mono font-bold text-foreground">{formattedBalance}</div>
        <div className="text-[10px] text-muted-foreground">
          Suministro: {formattedTotalSupply}
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-3 border-border/60 hover:bg-muted/80 hover:text-primary transition-all duration-200 hover:scale-[1.02] active:scale-95 group font-semibold text-xs shrink-0"
          onClick={handleAddTokenToWallet}
          title={`Agregar ${metadata.symbol} a tu billetera`}
        >
          <PlusCircle className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span>Agregar a billetera</span>
        </Button>
      </td>
    </tr>
  );
}

interface TokenOptionProps {
  tokenAddress: `0x${string}`;
  userAddress: `0x${string}`;
}

function TokenOption({ tokenAddress, userAddress }: TokenOptionProps) {
  const { metadata, isLoadingMetadata } = useBaseERC20(tokenAddress);
  const { balance, isLoading: isLoadingBalance } = useERC20Balance(tokenAddress, userAddress);

  if (isLoadingMetadata || isLoadingBalance) {
    return <option value={tokenAddress}>Cargando {tokenAddress.substring(0, 6)}...</option>;
  }

  const formattedBalance = balance
    ? (Number(balance) / 10 ** metadata.decimals).toLocaleString(undefined, {
      maximumFractionDigits: 6,
    })
    : '0';

  return (
    <option value={tokenAddress} className="bg-card text-foreground">
      {metadata.name} ({metadata.symbol}) - Saldo: {formattedBalance}
    </option>
  );
}

const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract BaseERC20 is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
    
    constructor(string memory name, string memory symbol, address initialOwner) ERC20(name, symbol) Ownable(initialOwner) ERC20Permit(name) {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}`;

const ERC20Page: NextPage = () => {
  const isHydrated = useHydrated();
  const { isConnected, address, chain } = useAccount();
  const explorerUrl = chain?.blockExplorers?.default?.url || 'https://sepolia.etherscan.io';

  // Estados de carga de fábrica de tokens
  const { tokens: allTokenAddresses, isLoading: isLoadingAllTokens, refetch: refetchAllTokens } = useAllTokens();
  const [selectedTokenAddr, setSelectedTokenAddr] = useState<`0x${string}` | undefined>(undefined);

  // Consultar balances y dueños de todos los tokens en paralelo
  const { data: tokenDetails, isLoading: isLoadingDetails, refetch: refetchDetails } = useReadContracts({
    contracts: allTokenAddresses.flatMap((addr) => [
      {
        address: addr,
        abi: baseERC20Abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
      },
      {
        address: addr,
        abi: baseERC20Abi,
        functionName: 'owner',
      }
    ]),
    query: {
      enabled: isHydrated && !!address && allTokenAddresses.length > 0,
    },
  });

  const visibleTokenAddresses = useMemo(() => {
    if (!allTokenAddresses || !tokenDetails) return [];
    return allTokenAddresses.filter((addr, index) => {
      const balanceResult = tokenDetails[2 * index];
      const ownerResult = tokenDetails[2 * index + 1];
      
      const balance = balanceResult && balanceResult.status === 'success' ? (balanceResult.result as bigint) : 0n;
      const owner = ownerResult && ownerResult.status === 'success' ? (ownerResult.result as string) : '';
      
      const isOwner = address && owner.toLowerCase() === address.toLowerCase();
      
      return balance > 0n || isOwner;
    });
  }, [allTokenAddresses, tokenDetails, address]);

  // Seleccionar automáticamente el primer token con saldo o propiedad
  useEffect(() => {
    if (visibleTokenAddresses.length > 0) {
      if (!selectedTokenAddr || !visibleTokenAddresses.includes(selectedTokenAddr)) {
        setSelectedTokenAddr(visibleTokenAddresses[0]);
      }
    } else {
      setSelectedTokenAddr(undefined);
    }
  }, [visibleTokenAddresses, selectedTokenAddr]);

  // Hooks para interactuar con el token seleccionado
  const {
    metadata: selectedMetadata,
    isLoadingMetadata: isLoadingSelectedMetadata,
    transfer: selectedTransfer,
    mint: selectedMint,
    burn: selectedBurn,
    txHash: actionTxHash,
    isPending: isActionPending,
    isSuccess: isActionSuccess,
    error: actionError,
  } = useBaseERC20(selectedTokenAddr);

  const {
    balance: selectedBalance,
    refetch: refetchSelectedBalance,
  } = useERC20Balance(selectedTokenAddr, address);

  // Estados del deployador de tokens
  const {
    createToken,
    hash: deployHash,
    error: deployError,
    isPending: isDeploying,
    isSuccess: isDeploySuccess,
  } = useTokenFactoryActions();

  // Historial de transacciones de la sesión
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Estados de formularios
  const [deployName, setDeployName] = useState('');
  const [deploySymbol, setDeploySymbol] = useState('');

  // Estados de acciones del token
  const [activeTab, setActiveTab] = useState<'transfer' | 'mint' | 'burn'>('transfer');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [mintRecipient, setMintRecipient] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');

  // Estados de retroalimentación
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    txHash?: string;
  } | null>(null);

  // Copiado de código
  const [copied, setCopied] = useState(false);

  // Ocultar notificaciones automáticamente
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Escuchar el éxito en el despliegue del token
  useEffect(() => {
    if (isDeploySuccess && deployHash) {
      setNotification({
        type: 'success',
        message: `¡Token creado exitosamente! Hash: ${deployHash.substring(0, 10)}...`,
        txHash: deployHash,
      });

      // Registrar el logro del desafío 3 en localStorage
      trackChallengeCompletion(3);

      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: 'deploy',
          tokenSymbol: deploySymbol.toUpperCase(),
          hash: deployHash,
          timestamp: 'Justo ahora',
          status: 'exitoso',
        },
        ...prev,
      ]);

      refetchAllTokens();
      refetchDetails();
      setDeployName('');
      setDeploySymbol('');
    }
  }, [isDeploySuccess, deployHash]);

  // Escuchar errores en el despliegue del token
  useEffect(() => {
    if (deployError) {
      setNotification({
        type: 'error',
        message: `Error al desplegar token: ${deployError.message || 'Error desconocido'}`,
      });
    }
  }, [deployError]);

  // Escuchar el éxito en las acciones del token
  useEffect(() => {
    if (isActionSuccess && actionTxHash) {
      let actionLabel = 'Transacción';
      let actionAmountStr = '';

      if (activeTab === 'transfer') {
        actionLabel = `Transferencia de ${selectedMetadata.symbol}`;
        actionAmountStr = transferAmount;
        setTransferAmount('');
        setTransferRecipient('');

        // Registrar el logro del desafío 4 en localStorage
        trackChallengeCompletion(4);
      } else if (activeTab === 'mint') {
        actionLabel = `Acuñación de ${selectedMetadata.symbol}`;
        actionAmountStr = mintAmount;
        setMintAmount('');
        setMintRecipient('');

        // Registrar el logro del desafío 4 en localStorage
        trackChallengeCompletion(4);
      } else if (activeTab === 'burn') {
        actionLabel = `Quema de ${selectedMetadata.symbol}`;
        actionAmountStr = burnAmount;
        setBurnAmount('');
      }

      setNotification({
        type: 'success',
        message: `${actionLabel} completada exitosamente.`,
        txHash: actionTxHash,
      });

      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: activeTab,
          tokenSymbol: selectedMetadata.symbol,
          amount: parseFloat(actionAmountStr) || undefined,
          to: activeTab === 'transfer' ? transferRecipient.substring(0, 6) + '...' + transferRecipient.substring(transferRecipient.length - 4) : undefined,
          hash: actionTxHash,
          timestamp: 'Justo ahora',
          status: 'exitoso',
        },
        ...prev,
      ]);

      refetchSelectedBalance();
      refetchAllTokens();
      refetchDetails();
    }
  }, [isActionSuccess, actionTxHash]);

  // Escuchar errores en las acciones del token
  useEffect(() => {
    if (actionError) {
      setNotification({
        type: 'error',
        message: `Error en la transacción: ${actionError.message || 'Error desconocido'}`,
      });
    }
  }, [actionError]);

  // Determinar si el usuario es el dueño del token seleccionado
  const isOwner = selectedMetadata && address && selectedMetadata.owner.toLowerCase() === address.toLowerCase();

  // Asegurar que no nos quedemos en una pestaña de dueño si dejamos de serlo o cambiamos de token
  useEffect(() => {
    if (!isOwner && activeTab !== 'transfer') {
      setActiveTab('transfer');
    }
  }, [isOwner, activeTab]);

  // Desplegar el token usando la fábrica
  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deployName || !deploySymbol || !address) {
      setNotification({
        type: 'error',
        message: 'Por favor, completa todos los campos para desplegar el token.',
      });
      return;
    }
    createToken(deployName, deploySymbol, address);
  };

  // Enviar transferencia
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokenAddr || !transferRecipient || !transferAmount) return;
    try {
      const amount = parseUnits(transferAmount, selectedMetadata.decimals);
      if (amount <= 0n) {
        setNotification({ type: 'error', message: 'La cantidad debe ser mayor que cero.' });
        return;
      }
      if (selectedBalance < amount) {
        setNotification({ type: 'error', message: 'Saldo insuficiente en tu balance.' });
        return;
      }
      if (!transferRecipient.startsWith('0x') || transferRecipient.length !== 42) {
        setNotification({ type: 'error', message: 'Dirección de destino inválida.' });
        return;
      }
      selectedTransfer(transferRecipient as `0x${string}`, amount);
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Formato de cantidad o dirección inválido.' });
    }
  };

  // Enviar acuñación (mint)
  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokenAddr || !mintRecipient || !mintAmount) return;
    try {
      const amount = parseUnits(mintAmount, selectedMetadata.decimals);
      if (amount <= 0n) {
        setNotification({ type: 'error', message: 'La cantidad debe ser mayor que cero.' });
        return;
      }
      if (!mintRecipient.startsWith('0x') || mintRecipient.length !== 42) {
        setNotification({ type: 'error', message: 'Dirección de destino inválida.' });
        return;
      }
      selectedMint(mintRecipient as `0x${string}`, amount);
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Formato de cantidad o dirección inválido.' });
    }
  };

  // Enviar quema (burn)
  const handleBurn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokenAddr || !burnAmount) return;
    try {
      const amount = parseUnits(burnAmount, selectedMetadata.decimals);
      if (amount <= 0n) {
        setNotification({ type: 'error', message: 'La cantidad debe ser mayor que cero.' });
        return;
      }
      if (selectedBalance < amount) {
        setNotification({ type: 'error', message: 'Saldo insuficiente para quemar esa cantidad.' });
        return;
      }
      selectedBurn(amount);
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Formato de cantidad inválido.' });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(solidityCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <SEO
        title="Fábrica de Tokens ERC-20"
        description="Aprende sobre el estándar ERC-20, crea y personaliza tus propios tokens (nombre, símbolo, suministro) en la blockchain Sepolia de forma instantánea."
        urlPath="/erc20"
      />

      <Navbar />

      {/* Notificaciones flotantes */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-2xl animate-in slide-in-from-bottom duration-300 bg-card/95 backdrop-blur-md text-card-foreground border-border/80">
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            )}
            <div>
              <h4 className="font-semibold text-sm">
                {notification.type === 'success' ? 'Operación Exitosa' : 'Ocurrió un error'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px] break-all">
                {notification.message}
              </p>
              {notification.txHash && (
                <a
                  href={`${explorerUrl}/tx/${notification.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary hover:underline font-semibold"
                >
                  Ver transacción
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal - Ocupa ancho completo sin max-w */}
      <main className="flex-1 w-full p-4 sm:p-8 space-y-8">

        {/* Encabezado Principal Homologado */}
        <PageHeader
          title="Estándar y Despliegue de Tokens ERC-20"
          description="Aprende el funcionamiento técnico de los tokens fungibles de Ethereum, visualiza su código Solidity y crea tu propio contrato inteligente al instante."
          icon={Coins}
          breadcrumbItems={[
            { label: 'Tokens ERC-20' }
          ]}
          actions={
            <Link href="/aprender">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/60 hover:bg-muted/80 text-xs font-semibold"
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                Aprender
              </Button>
            </Link>
          }
        />

        {/* Sección Superior: Grid Educativo de Fórmulas, Teoría y Código Solidity (10 Columnas) */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">

          {/* Columna Izquierda: Teoría y Estructura ERC-20 con Tabs (6 Columnas) */}
          <Card className="xl:col-span-6 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-teal-500"></div>
            <div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Mecánica y Teoría del Estándar ERC-20
                </CardTitle>
                <CardDescription>
                  Aprende la arquitectura técnica y el funcionamiento de los tokens fungibles en la EVM.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Tabs defaultValue="fundamentos" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto gap-1 bg-muted/50 p-1 rounded-lg border border-border/10">
                    <TabsTrigger value="fundamentos" className="text-xs py-1.5 font-semibold">
                      Fundamentos
                    </TabsTrigger>
                    <TabsTrigger value="arquitectura" className="text-xs py-1.5 font-semibold">
                      Arquitectura y EVM
                    </TabsTrigger>
                    <TabsTrigger value="funciones" className="text-xs py-1.5 font-semibold">
                      Funciones Clave
                    </TabsTrigger>
                    <TabsTrigger value="eventos" className="text-xs py-1.5 font-semibold">
                      Eventos y Logs
                    </TabsTrigger>
                    <TabsTrigger value="seguridad" className="text-xs py-1.5 font-semibold">
                      Gasto Seguro
                    </TabsTrigger>
                    <TabsTrigger value="extensiones" className="text-xs py-1.5 font-semibold">
                      Extensiones
                    </TabsTrigger>
                  </TabsList>

                  {/* Fundamentos */}
                  <TabsContent value="fundamentos" className="space-y-4 mt-4 text-sm text-muted-foreground font-light leading-relaxed">
                    <p>
                      El estándar <strong className="text-foreground font-semibold">ERC-20</strong> (formalizado bajo el EIP-20 en 2015) sentó las bases de la economía de tokens en Ethereum. Define las reglas matemáticas e interfaces de programación necesarias para la implementación de <strong className="text-foreground font-semibold">tokens fungibles</strong>. La fungibilidad implica que cada unidad de token posee idénticas propiedades de valor y utilidad que otra (por ejemplo, un token ERC-20 de balance equivale exactamente a cualquier otro del mismo contrato, al igual que los átomos de carbono o las monedas de curso legal).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 font-normal">
                      <div className="bg-muted/20 p-4 rounded-xl border border-border/10 space-y-2">
                        <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                          <BookOpen className="h-3.5 w-3.5 text-primary" /> Composabilidad DeFi
                        </h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground font-light">
                          Es la capacidad de los contratos inteligentes para interactuar de forma modular. Al unificar la interfaz (API), las plataformas de finanzas descentralizadas (DEXs, Lending, Yield Farming) pueden integrar cualquier token sin reescribir su lógica.
                        </p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-xl border border-border/10 space-y-2">
                        <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                          <Coins className="h-3.5 w-3.5 text-emerald-500" /> vs. NFT (ERC-721)
                        </h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground font-light">
                          A diferencia de los tokens no fungibles (NFT), donde cada activo es único y posee un identificador de token (<code>tokenId</code>) exclusivo, en el ERC-20 los saldos se agregan aritméticamente en cuentas sin distinción de origen.
                        </p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-xl border border-border/10 space-y-2">
                        <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                          <Activity className="h-3.5 w-3.5 text-indigo-500" /> Multicapa (ERC-1155)
                        </h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground font-light">
                          Los tokens semi-fungibles (como el ERC-1155) fusionan las ventajas del ERC-20 y ERC-721 dentro de un único contrato desplegado, permitiendo gestionar colecciones de elementos fungibles y no fungibles con máxima eficiencia de gas.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Arquitectura y EVM */}
                  <TabsContent value="arquitectura" className="space-y-4 mt-4 text-sm text-muted-foreground font-light leading-relaxed">
                    <p>
                      En el nivel físico del protocolo Ethereum, un contrato inteligente ERC-20 mantiene la propiedad y balances en el estado global (State Tree). El contrato declara variables clave que residen en posiciones numeradas de 32 bytes de almacenamiento en disco conocidas como <strong className="text-foreground font-semibold">Storage Slots</strong> de la EVM:
                    </p>
                    <div className="space-y-3 font-normal">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2.5 border-b border-border/10 text-xs">
                        <span className="font-mono text-emerald-400 font-bold shrink-0">_balances</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed font-light">
                          Declarado como <code>mapping(address =&gt; uint256)</code>. Para obtener el saldo del usuario `A`, la EVM calcula el hash keccak256 de la dirección `A` concatenada con la posición del slot asignada para resolver la clave directa. Modificar este saldo mediante transferencias implica la instrucción <code>SSTORE</code> (que cuesta hasta 20,000 unidades de gas si cambia de cero a un valor distinto).
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2.5 border-b border-border/10 text-xs">
                        <span className="font-mono text-primary font-bold shrink-0">_allowances</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed font-light">
                          Representa una tabla bidimensional <code>mapping(address =&gt; mapping(address =&gt; uint256))</code>. Almacena las autorizaciones de gasto otorgadas. Permite a un propietario habilitar a un tercero (por ejemplo, un router DEX) para debitar tokens. Las lecturas en esta estructura consumen gas de ejecución (<code>SLOAD</code> - 2,100 gas en frío).
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2.5 border-b border-border/10 text-xs">
                        <span className="font-mono text-purple-400 font-bold shrink-0">_totalSupply</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed font-light">
                          Una variable de tipo entero <code>uint256</code> que define la cantidad acumulada de tokens flotantes en circulación. Su valor teórico debe coincidir exactamente con la sumatoria aritmética de todos los saldos de los usuarios que poseen tokens.
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Funciones Clave */}
                  <TabsContent value="funciones" className="space-y-4 mt-4 text-sm text-muted-foreground font-light leading-relaxed">
                    <p>
                      La especificación EIP-20 formaliza la API obligatoria que debe exponer el contrato inteligente. Estas funciones se dividen según su impacto en el estado de la blockchain:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 font-normal">
                      <div className="bg-muted/15 p-4 rounded-xl border border-border/10 space-y-2">
                        <span className="font-mono text-primary font-bold text-xs block border-b border-border/10 pb-1">Lectura de Estado (Gratuitas / View)</span>
                        <div className="space-y-2 text-[11px] leading-relaxed text-muted-foreground font-light font-sans">
                          <p>
                            <code className="text-foreground font-bold font-mono">totalSupply() public view returns (uint256)</code><br />
                            Retorna el volumen de circulante emitido en el ecosistema.
                          </p>
                          <p>
                            <code className="text-foreground font-bold font-mono">balanceOf(address account) public view returns (uint256)</code><br />
                            Consulta el saldo del mapeo interno del address solicitado.
                          </p>
                          <p>
                            <code className="text-foreground font-bold font-mono">allowance(address owner, address spender) public view returns (uint256)</code><br />
                            Consulta el cupo disponible asignado al gastador (spender).
                          </p>
                          <p>
                            <code className="text-foreground font-bold font-mono">decimals() public view returns (uint8)</code><br />
                            Establece el factor de escala visual para el frontend (generalmente 18 decimales, emulando la relación entre Wei y Ether).
                          </p>
                        </div>
                      </div>
                      <div className="bg-muted/15 p-4 rounded-xl border border-border/10 space-y-2">
                        <span className="font-mono text-emerald-400 font-bold text-xs block border-b border-border/10 pb-1">Mutación de Estado (Transacciones / Gas)</span>
                        <div className="space-y-2 text-[11px] leading-relaxed text-muted-foreground font-light font-sans">
                          <p>
                            <code className="text-foreground font-bold font-mono">transfer(address recipient, uint256 amount) public returns (bool)</code><br />
                            Desplaza `amount` desde el emisor al destinatario. Requiere revertir si el emisor no dispone de saldo suficiente.
                          </p>
                          <p>
                            <code className="text-foreground font-bold font-mono">approve(address spender, uint256 amount) public returns (bool)</code><br />
                            Define y sobrescribe la cantidad límite autorizada de gasto delegado.
                          </p>
                          <p>
                            <code className="text-foreground font-bold font-mono">transferFrom(address sender, address recipient, uint256 amount) public returns (bool)</code><br />
                            Cobra el cobro delegado de la cuenta `sender` a `recipient`. Requiere que el cupo verificado del emisor sea mayor o igual al monto.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Eventos y Logs */}
                  <TabsContent value="eventos" className="space-y-4 mt-4 text-sm text-muted-foreground font-light leading-relaxed">
                    <p>
                      Los <strong className="text-foreground font-semibold">Eventos</strong> son el mecanismo nativo mediante el cual los contratos inteligentes notifican a las aplicaciones cliente sobre sucesos ocurridos en el motor de ejecución de la EVM. Al emitirse un evento, los datos son almacenados en la estructura de <strong className="text-foreground font-semibold">Logs de la transacción</strong> (no en el almacenamiento principal, abaratando gas):
                    </p>
                    <div className="space-y-3 font-normal">
                      <div className="bg-muted/15 p-3 rounded-lg border border-border/10 font-mono text-[10px] text-foreground/90 space-y-1.5">
                        <p className="font-bold text-emerald-400">event Transfer(address indexed from, address indexed to, uint256 value)</p>
                        <p className="text-muted-foreground font-sans text-[11px] font-light">Se emite obligatoriamente en cada movimiento de tokens, incluyendo la acuñación inicial (origen <code>0x0</code>) y la quema (destino <code>0x0</code>).</p>

                        <p className="font-bold text-primary mt-2">event Approval(address indexed owner, address indexed spender, uint256 value)</p>
                        <p className="text-muted-foreground font-sans text-[11px] font-light">Se emite al modificarse con éxito el cupo permitido para un spender.</p>
                      </div>

                      <div className="bg-muted/20 p-4 rounded-xl border border-border/10 space-y-2">
                        <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                          <Activity className="h-3.5 w-3.5 text-primary" /> Criptografía y Logs: El Concepto de "Indexed"
                        </h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground font-light">
                          En Solidity, el modificador <code className="text-foreground font-mono">indexed</code> sobre los parámetros (hasta un máximo de 3) indica a la EVM que aloje estos valores en la estructura de <strong>Topics (Temas)</strong> del log, que son indexados usando filtros criptográficos Bloom. Esto permite que servicios externos (tales como nodos RPC de Ethereum, proveedores o indexadores descentralizados como <strong>The Graph</strong>) filtren y recuperen instantáneamente el historial de transacciones de un usuario específico sin necesidad de buscar bloque por bloque ni leer variables internas.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Gasto Seguro */}
                  <TabsContent value="seguridad" className="space-y-4 mt-4 text-sm text-muted-foreground font-light leading-relaxed">
                    <p>
                      La adopción y expansión del estándar ERC-20 ha revelado ciertas deficiencias e implicancias de seguridad críticas que todo desarrollador de Solidity debe comprender y mitigar:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 font-normal">
                      <div className="bg-muted/20 p-4 rounded-xl border border-border/10 space-y-2">
                        <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" /> Ataque de Aprobación
                        </h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground font-light">
                          Si un usuario cambia su aprobación de 50 a 100 mediante <code>approve()</code>, un spender malicioso puede realizar front-running (pagando más gas) para ejecutar <code>transferFrom(50)</code> justo antes de que se mine la transacción, y luego gastar los 100 aprobados, retirando 150 en total.
                        </p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-xl border border-border/10 space-y-2">
                        <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Aprobación Segura
                        </h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground font-light">
                          Para mitigar la carrera, las librerías modernas de OpenZeppelin implementan los métodos auxiliares no estándar <code>increaseAllowance()</code> y <code>decreaseAllowance()</code>, los cuales operan de forma incremental sumando/restando sobre el saldo autorizado, evitando sobrescrituras concurrentes peligrosas.
                        </p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-xl border border-border/10 space-y-2">
                        <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                          <Flame className="h-3.5 w-3.5 text-amber-500" /> Pérdida de Tokens
                        </h5>
                        <p className="text-[11px] leading-relaxed text-muted-foreground font-light">
                          Si envías tokens ERC-20 directamente a un contrato que no está programado para gestionarlos mediante <code>transfer()</code>, los tokens quedarán atrapados permanentemente. Esta debilidad motivó estándares alternativos como ERC-223 o ERC-777.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Extensiones */}
                  <TabsContent value="extensiones" className="space-y-4 mt-4 text-sm text-muted-foreground font-light leading-relaxed">
                    <p>
                      Para responder a demandas complejas de gobernanza y experiencia de usuario, la comunidad Ethereum ha desarrollado extensiones complementarias estandarizadas:
                    </p>
                    <div className="space-y-3 font-normal">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-border/10 text-xs">
                        <span className="font-mono text-emerald-400 font-bold shrink-0">ERC20Permit (EIP-2612)</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed font-light">
                          Habilita el mecanismo de <strong>Aprobaciones sin Gas</strong>. En lugar de enviar una transacción on-chain para ejecutar <code>approve()</code>, el usuario firma un mensaje estructurado (según el estándar criptográfico EIP-712) off-chain. Dicha firma es transmitida por un tercero (relayer) al contrato del token a través de la función <code>permit()</code>, que la verifica criptográficamente y aprueba el cupo en un único paso integrado en la compra, mejorando radicalmente la UX.
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-border/10 text-xs">
                        <span className="font-mono text-primary font-bold shrink-0">ERC20Votes</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed font-light">
                          Agrega una lógica de histórico de saldos mediante <strong>Checkpoints</strong> (puntos de control). Permite delegar el poder de voto proporcional al balance de tokens a cualquier dirección sin mover los tokens físicos, previniendo la manipulación y la doble contabilidad en votaciones de gobernanza de Organizaciones Autónomas Descentralizadas (DAOs).
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-border/10 text-xs">
                        <span className="font-mono text-purple-400 font-bold shrink-0">ERC20Capped & Burnable</span>
                        <span className="text-muted-foreground sm:col-span-2 leading-relaxed font-light">
                          <code>Capped</code> añade un límite rígido insuperable sobre la creación de tokens (evitando emisiones arbitrarias maliciosas), mientras que <code>Burnable</code> expone funciones de quema pública estandarizadas que permiten al portador destruir sus propios saldos para reducir el suministro circulante.
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </div>

            <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-primary" /> Usa las pestañas para explorar cada sección del estándar en detalle.
              </span>
            </CardFooter>
          </Card>

          {/* Columna Derecha: Código Smart Contract (Solidity) (4 Columnas) */}
          <Card className="xl:col-span-4 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 to-emerald-500"></div>
            <div>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                    <Code className="h-5 w-5 text-emerald-500" />
                    Código Smart Contract (Solidity)
                  </CardTitle>
                  <CardDescription>
                    Código base en Solidity utilizando OpenZeppelin.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border/60 hover:bg-muted/80 transition-colors"
                  onClick={handleCopyCode}
                  title="Copiar código"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="relative rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-inner group/code">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono">
                    <span>BaseERC20.sol</span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      solc 0.8.35
                    </span>
                  </div>
                  <pre className="text-[10px] sm:text-[11px] font-mono p-4 overflow-x-auto leading-relaxed text-zinc-300 max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                    <code>
                      <span className="text-zinc-500">// SPDX-License-Identifier: MIT</span>{"\n"}
                      <span className="text-pink-500">pragma</span> <span className="text-amber-500">solidity</span> <span className="text-blue-400">^0.8.35</span>;{"\n\n"}
                      <span className="text-pink-500">import</span> {"{"}<span className="text-blue-400">Ownable</span>{"}"} <span className="text-pink-500">from</span> <span className="text-emerald-400">"@openzeppelin/contracts/access/Ownable.sol"</span>;{"\n"}
                      <span className="text-pink-500">import</span> {"{"}<span className="text-blue-400">ERC20</span>{"}"} <span className="text-pink-500">from</span> <span className="text-emerald-400">"@openzeppelin/contracts/token/ERC20/ERC20.sol"</span>;{"\n"}
                      <span className="text-pink-500">import</span> {"{"}<span className="text-blue-400">ERC20Burnable</span>{"}"} <span className="text-pink-500">from</span> <span className="text-emerald-400">"@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol"</span>;{"\n"}
                      <span className="text-pink-500">import</span> {"{"}<span className="text-blue-400">ERC20Pausable</span>{"}"} <span className="text-pink-500">from</span> <span className="text-emerald-400">"@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol"</span>;{"\n"}
                      <span className="text-pink-500">import</span> {"{"}<span className="text-blue-400">ERC20Permit</span>{"}"} <span className="text-pink-500">from</span> <span className="text-emerald-400">"@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol"</span>;{"\n\n"}
                      <span className="text-blue-500">contract</span> <span className="text-yellow-400 font-bold">BaseERC20</span> <span className="text-pink-500">is</span> <span className="text-yellow-400">ERC20</span>, <span className="text-yellow-400">ERC20Burnable</span>, <span className="text-yellow-400">ERC20Pausable</span>, <span className="text-yellow-400">Ownable</span>, <span className="text-yellow-400">ERC20Permit</span> {"{"}{"\n"}
                      {"    "}{"\n"}
                      {"    "}<span className="text-blue-500">constructor</span>(<span className="text-blue-400">string</span> <span className="text-pink-500">memory</span> name, <span className="text-blue-400">string</span> <span className="text-pink-500">memory</span> symbol, <span className="text-blue-400">address</span> initialOwner) <span className="text-yellow-400">ERC20</span>(name, symbol) <span className="text-yellow-400">Ownable</span>(initialOwner) <span className="text-yellow-400">ERC20Permit</span>(name) {"{}"}{"\n\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">pause</span>() <span className="text-pink-500">public</span> <span className="text-amber-500">onlyOwner</span> {"{"}{"\n"}
                      {"        "}<span className="text-purple-400">_pause</span>();{"\n"}
                      {"    "}{"}"}{"\n\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">unpause</span>() <span className="text-pink-500">public</span> <span className="text-amber-500">onlyOwner</span> {"{"}{"\n"}
                      {"        "}<span className="text-purple-400">_unpause</span>();{"\n"}
                      {"    "}{"}"}{"\n\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">mint</span>(<span className="text-blue-400">address</span> to, <span className="text-blue-400">uint256</span> amount) <span className="text-pink-500">public</span> <span className="text-amber-500">onlyOwner</span> {"{"}{"\n"}
                      {"        "}<span className="text-purple-400">_mint</span>(to, amount);{"\n"}
                      {"    "}{"}"}{"\n\n"}
                      {"    "}<span className="text-zinc-500">// The following functions are overrides required by Solidity.</span>{"\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">_update</span>(<span className="text-blue-400">address</span> from, <span className="text-blue-400">address</span> to, <span className="text-blue-400">uint256</span> value) <span className="text-pink-500">internal</span> <span className="text-pink-500">override</span>(<span className="text-yellow-400">ERC20</span>, <span className="text-yellow-400">ERC20Pausable</span>) {"{"}{"\n"}
                      {"        "}<span className="text-purple-400">super</span>.<span className="text-teal-400">_update</span>(from, to, value);{"\n"}
                      {"    "}{"}"}{"\n"}
                      {"}"}
                    </code>
                  </pre>
                </div>
              </CardContent>
            </div>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <span className="text-[10.5px] text-muted-foreground">
                * Este código es un ejemplo básico. La fábrica utiliza un contrato similar.
              </span>
              <a
                href="https://github.com/cjbaezilla/diplomado-usach-training-dapp-contracts/blob/main/contracts/BaseERC20.sol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10.5px] text-emerald-500 hover:text-emerald-600 hover:underline flex items-center gap-1 font-semibold shrink-0"
              >
                Ver en GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </CardFooter>
          </Card>

        </div>

        {/* Base de Interacción y Operaciones */}
        {!isConnected || !address ? (
          /* Estado Desconectado - Panel de Acciones Bloqueado */
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/60 rounded-2xl bg-card/25 text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4 text-primary border border-primary/20 shadow-inner">
              <Coins className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold tracking-tight text-foreground">Dashboard de Interacción</h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Conecta tu billetera para interactuar con los tokens ERC-20, realizar transferencias, acuñar nuevos saldos o quemar excedentes.
              </p>
            </div>
            <div className="pt-2">
              <ConnectButton />
            </div>
          </div>
        ) : (
          /* Estado Conectado - Dashboard de Interacción Activo */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Columna Izquierda: Despliegue y Acciones */}
            <div className="lg:col-span-2 space-y-8">

              {/* Tarjeta de Despliegue de Token */}
              <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-primary"></div>
                <div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                      <Rocket className="h-5 w-5 text-primary" />
                      Desplegar Token ERC-20
                    </CardTitle>
                    <CardDescription>
                      Crea y compila tu token real en la blockchain seleccionada.
                    </CardDescription>
                  </CardHeader>

                  <form onSubmit={handleDeploy} className="flex-1 flex flex-col justify-between">
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="token-name" className="text-xs font-semibold text-foreground">Nombre del Token</Label>
                        <Input
                          id="token-name"
                          type="text"
                          placeholder="Ej. USACH Training Token"
                          value={deployName}
                          onChange={(e) => setDeployName(e.target.value)}
                          disabled={isDeploying}
                          className="bg-background/80 border-border/80 focus:ring-primary focus:border-primary text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="token-symbol" className="text-xs font-semibold text-foreground">Símbolo (Symbol)</Label>
                        <Input
                          id="token-symbol"
                          type="text"
                          placeholder="Ej. UTT"
                          value={deploySymbol}
                          onChange={(e) => setDeploySymbol(e.target.value)}
                          disabled={isDeploying}
                          className="bg-background/80 border-border/80 focus:ring-primary focus:border-primary text-sm font-mono"
                          maxLength={8}
                          required
                        />
                      </div>

                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/30 shadow-inner">
                        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          El suministro inicial por defecto es 0. Podrás acuñar (mint) tokens desde el panel inferior una vez desplegado.
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between items-center gap-4 bg-muted/10 border-t border-border/20 p-4 w-full mt-auto">
                      <span className="text-[10px] text-muted-foreground">
                        * Requiere gas.
                      </span>
                      <Button type="submit" disabled={isDeploying} className="shadow-md font-bold px-4 py-2 hover:scale-[1.02] transition-transform">
                        {isDeploying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                            Desplegando...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4 mr-1.5" />
                            Desplegar
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </div>
              </Card>

              {/* Acciones de Token */}
              <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-emerald-500"></div>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2 font-bold text-foreground">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Acciones del Token
                  </CardTitle>
                  <CardDescription>
                    Interactúa con el token seleccionado a través de transacciones reales en el cliente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="select-token" className="text-xs font-semibold text-foreground">Seleccionar Token Activo</Label>
                      {selectedTokenAddr && (
                        <TokenIcon address={selectedTokenAddr} className="h-6 w-6 border border-primary/20" />
                      )}
                    </div>
                    <select
                      id="select-token"
                      value={selectedTokenAddr || ''}
                      onChange={(e) => setSelectedTokenAddr(e.target.value as `0x${string}`)}
                      disabled={isActionPending || visibleTokenAddresses.length === 0}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                    >
                      {visibleTokenAddresses.length === 0 ? (
                        <option value="" disabled className="bg-card text-foreground">No hay tokens disponibles</option>
                      ) : (
                        visibleTokenAddresses.map((addr) => (
                          <TokenOption key={addr} tokenAddress={addr} userAddress={address} />
                        ))
                      )}
                    </select>
                  </div>

                  {selectedTokenAddr && (
                    <div className="space-y-4">
                      {/* Tabs de Acciones con glassmorphism */}
                      <div className="flex border border-border/40 mb-4 bg-muted/30 p-1.5 rounded-xl backdrop-blur-sm">
                        <button
                          type="button"
                          onClick={() => setActiveTab('transfer')}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                            activeTab === 'transfer'
                              ? "bg-background text-primary shadow-md scale-[1.01]"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Send className="h-3.5 w-3.5" /> Transferir
                        </button>
                        {isOwner && (
                          <>
                            <button
                              type="button"
                              onClick={() => setActiveTab('mint')}
                              className={cn(
                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                                activeTab === 'mint'
                                  ? "bg-background text-primary shadow-md scale-[1.01]"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <PlusCircle className="h-3.5 w-3.5" /> Acuñar (Mint)
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab('burn')}
                              className={cn(
                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                                activeTab === 'burn'
                                  ? "bg-background text-primary shadow-md scale-[1.01]"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Flame className="h-3.5 w-3.5" /> Quemar (Burn)
                            </button>
                          </>
                        )}
                      </div>

                      {/* Formulario Dinámico según Tab */}
                      {activeTab === 'transfer' && (
                        <form onSubmit={handleTransfer} className="space-y-4 animate-in fade-in duration-200">
                          <div className="space-y-1.5">
                            <Label htmlFor="recipient" className="text-xs font-semibold text-foreground">Dirección de Destino</Label>
                            <Input
                              id="recipient"
                              type="text"
                              placeholder="0x..."
                              value={transferRecipient}
                              onChange={(e) => setTransferRecipient(e.target.value)}
                              disabled={isActionPending}
                              className="bg-background/80 border-border/80 text-sm font-mono"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="amount" className="text-xs font-semibold text-foreground">Cantidad a Transferir</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="0.00"
                              value={transferAmount}
                              onChange={(e) => setTransferAmount(e.target.value)}
                              disabled={isActionPending}
                              min="0.000001"
                              step="any"
                              className="bg-background/80 border-border/80 text-sm"
                              required
                            />
                          </div>
                          <Button type="submit" disabled={isActionPending} className="w-full shadow-md mt-2 font-bold py-2">
                            {isActionPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                Procesando transferencia...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1.5" />
                                Transferir Tokens
                              </>
                            )}
                          </Button>
                        </form>
                      )}

                      {activeTab === 'mint' && (
                        <form onSubmit={handleMint} className="space-y-4 animate-in fade-in duration-200">
                          <div className="space-y-1.5">
                            <Label htmlFor="mint-recipient" className="text-xs font-semibold text-foreground">Dirección del Receptor</Label>
                            <Input
                              id="mint-recipient"
                              type="text"
                              placeholder="0x..."
                              value={mintRecipient}
                              onChange={(e) => setMintRecipient(e.target.value)}
                              disabled={isActionPending}
                              className="bg-background/80 border-border/80 text-sm font-mono"
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="mint-amount" className="text-xs font-semibold text-foreground">Cantidad a Acuñar</Label>
                            <Input
                              id="mint-amount"
                              type="number"
                              placeholder="0.00"
                              value={mintAmount}
                              onChange={(e) => setMintAmount(e.target.value)}
                              disabled={isActionPending}
                              min="0.000001"
                              step="any"
                              className="bg-background/80 border-border/80 text-sm"
                              required
                            />
                          </div>
                          <Button type="submit" disabled={isActionPending} className="w-full shadow-md mt-2 font-bold py-2">
                            {isActionPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                Acuñando tokens...
                              </>
                            ) : (
                              <>
                                <PlusCircle className="h-4 w-4 mr-1.5" />
                                Acuñar Tokens
                              </>
                            )}
                          </Button>
                        </form>
                      )}

                      {activeTab === 'burn' && (
                        <form onSubmit={handleBurn} className="space-y-4 animate-in fade-in duration-200">
                          <div className="space-y-1.5">
                            <Label htmlFor="burn-amount" className="text-xs font-semibold text-foreground">Cantidad a Quemar</Label>
                            <Input
                              id="burn-amount"
                              type="number"
                              placeholder="0.00"
                              value={burnAmount}
                              onChange={(e) => setBurnAmount(e.target.value)}
                              disabled={isActionPending}
                              min="0.000001"
                              step="any"
                              className="bg-background/80 border-border/80 text-sm"
                              required
                            />
                            <p className="text-[10px] text-muted-foreground mt-1.5 bg-destructive/5 p-2 rounded border border-destructive/10">
                              * Atención: Los tokens se destruirán permanentemente de tu cuenta activa.
                            </p>
                          </div>
                          <Button type="submit" disabled={isActionPending} variant="destructive" className="w-full shadow-md mt-2 font-bold py-2">
                            {isActionPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                Quemando tokens...
                              </>
                            ) : (
                              <>
                                <Flame className="h-4 w-4 mr-1.5" />
                                Quemar Tokens
                              </>
                            )}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Balances de Tokens & Historial */}
            <div className="lg:col-span-3 space-y-8">

              {/* Tabla de Balances */}
              <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2 font-bold text-foreground">
                    <Coins className="h-5 w-5 text-primary" />
                    Tus Balances de Tokens
                  </CardTitle>
                  <CardDescription>
                    Lista de contratos creados por la fábrica de la dApp y tu saldo actual en cada uno.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-xs text-muted-foreground border-y border-border/20">
                        <tr>
                          <th className="px-4 py-3 font-bold">Token</th>
                          <th className="px-4 py-3 font-bold">Dirección del Contrato</th>
                          <th className="px-4 py-3 font-bold text-right">Tu Balance</th>
                          <th className="px-4 py-3 font-bold text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {isLoadingAllTokens || (isLoadingDetails && allTokenAddresses.length > 0) ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8">
                              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                Cargando balances...
                              </div>
                            </td>
                          </tr>
                        ) : visibleTokenAddresses.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                              {allTokenAddresses.length === 0
                                ? "No hay tokens creados por la fábrica. ¡Sé el primero en desplegar uno!"
                                : "No tienes saldo en ningún token."}
                            </td>
                          </tr>
                        ) : (
                          visibleTokenAddresses.map((addr) => (
                            <TokenRow
                              key={addr}
                              tokenAddress={addr}
                              userAddress={address}
                              isSelected={selectedTokenAddr === addr}
                              onSelect={setSelectedTokenAddr}
                              onShowNotification={setNotification}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Historial de Transacciones */}
              <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2 font-bold text-foreground">
                    <Activity className="h-5 w-5 text-primary" />
                    Historial de Transacciones
                  </CardTitle>
                  <CardDescription>
                    Registro de acciones on-chain procesadas en la sesión actual desde este panel.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No hay transacciones registradas en esta sesión.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-border/30 bg-muted/10 text-sm hover:border-border/60 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={cn(
                                "flex items-center justify-center h-8 w-8 rounded-full text-xs font-black shrink-0 border",
                                tx.type === 'deploy' && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                                tx.type === 'transfer' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                tx.type === 'mint' && 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                                tx.type === 'burn' && 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              )}
                            >
                              {tx.type === 'deploy' && 'D'}
                              {tx.type === 'transfer' && 'T'}
                              {tx.type === 'mint' && 'M'}
                              {tx.type === 'burn' && 'B'}
                            </span>
                            <div>
                              <div className="font-bold text-foreground text-xs sm:text-sm">
                                {tx.type === 'deploy' && `Desplegado smart contract ${tx.tokenSymbol}`}
                                {tx.type === 'transfer' && `Enviados ${tx.amount} ${tx.tokenSymbol}`}
                                {tx.type === 'mint' && `Acuñados ${tx.amount} ${tx.tokenSymbol}`}
                                {tx.type === 'burn' && `Quemados ${tx.amount} ${tx.tokenSymbol}`}
                              </div>
                              {tx.to && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Destinatario: <span className="font-mono">{tx.to}</span>
                                </div>
                              )}
                              <a
                                href={`${explorerUrl}/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-primary hover:underline font-mono mt-1 break-all bg-muted/30 px-2 py-0.5 rounded border border-border/20 max-w-fit inline-flex items-center gap-1"
                              >
                                Hash: {tx.hash}
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500 border border-emerald-500/20">
                              {tx.status}
                            </span>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {tx.timestamp}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ERC20Page;
