import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
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
} from 'lucide-react';
import { useAllTokens, useTokenFactoryActions } from '@/hooks/useTokenFactory';
import { useBaseERC20, useERC20Balance } from '@/hooks/useBaseERC20';
import { useHydrated } from '@/hooks/useHydrated';
import { TokenIcon } from '@/components/TokenIcon';

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
}

function TokenRow({ tokenAddress, userAddress, onSelect, isSelected }: TokenRowProps) {
  const { metadata, isLoadingMetadata } = useBaseERC20(tokenAddress);
  const { balance, isLoading: isLoadingBalance } = useERC20Balance(tokenAddress, userAddress);

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
        <span className="hidden sm:inline">{tokenAddress}</span>
        <span className="sm:hidden text-[10px]">
          {tokenAddress.substring(0, 6)}...{tokenAddress.substring(tokenAddress.length - 4)}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="font-mono font-bold text-foreground">{formattedBalance}</div>
        <div className="text-[10px] text-muted-foreground">
          Suministro: {formattedTotalSupply}
        </div>
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
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MiToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}`;

const ERC20Page: NextPage = () => {
  const isHydrated = useHydrated();
  const { isConnected, address } = useAccount();

  // Estados de carga de fábrica de tokens
  const { tokens: allTokenAddresses, isLoading: isLoadingAllTokens, refetch: refetchAllTokens } = useAllTokens();
  const [selectedTokenAddr, setSelectedTokenAddr] = useState<`0x${string}` | undefined>(undefined);

  // Seleccionar automáticamente el primer token una vez cargados
  useEffect(() => {
    if (allTokenAddresses.length > 0 && !selectedTokenAddr) {
      setSelectedTokenAddr(allTokenAddresses[0]);
    }
  }, [allTokenAddresses, selectedTokenAddr]);

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
      });

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
      } else if (activeTab === 'mint') {
        actionLabel = `Acuñación de ${selectedMetadata.symbol}`;
        actionAmountStr = mintAmount;
        setMintAmount('');
        setMintRecipient('');
      } else if (activeTab === 'burn') {
        actionLabel = `Quema de ${selectedMetadata.symbol}`;
        actionAmountStr = burnAmount;
        setBurnAmount('');
      }

      setNotification({
        type: 'success',
        message: `${actionLabel} completada exitosamente.`,
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
      <Head>
        <title>Portal de Tokens ERC-20 - USACH dApp</title>
        <meta
          content="Aprende sobre el estándar ERC-20 y despliega tus propios contratos inteligentes en tiempo real."
          name="description"
        />
      </Head>

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
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal - Ocupa ancho completo sin max-w */}
      <main className="flex-1 w-full p-4 sm:p-8 space-y-8">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Volver al Inicio
            </Link>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl bg-gradient-to-r from-primary via-emerald-500 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
              <Coins className="h-8 w-8 text-primary animate-pulse" />
              Estándar y Despliegue de Tokens ERC-20
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Aprende el funcionamiento técnico de los tokens fungibles de Ethereum, visualiza su código Solidity y crea tu propio contrato inteligente al instante.
            </p>
          </div>
        </div>

        {/* Sección Superior: Grid Educativo y de Despliegue (3 Columnas, tercera más pequeña) */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          
          {/* Columna 1: ¿Qué es ERC-20 y su Estructura? */}
          <Card className="xl:col-span-2 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-teal-500"></div>
            <div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                  <BookOpen className="h-5 w-5 text-primary" />
                  1. Estructura y Estándar
                </CardTitle>
                <CardDescription>
                  Concepto fundamental de los tokens fungibles de Ethereum.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  El estándar <strong className="text-foreground font-semibold">ERC-20</strong> es una interfaz común que asegura que los tokens en redes EVM se comporten de forma predecible.
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Propiedades del Contrato</h4>
                  <ul className="grid grid-cols-2 gap-2 text-xs">
                    <li className="bg-muted/40 p-2 rounded border border-border/20">
                      <span className="block font-bold text-foreground">name()</span>
                      Nombre del token (ej. Bitcoin).
                    </li>
                    <li className="bg-muted/40 p-2 rounded border border-border/20">
                      <span className="block font-bold text-foreground">symbol()</span>
                      Abreviación (ej. BTC).
                    </li>
                    <li className="bg-muted/40 p-2 rounded border border-border/20">
                      <span className="block font-bold text-foreground">decimals()</span>
                      Divisibilidad (ej. 18).
                    </li>
                    <li className="bg-muted/40 p-2 rounded border border-border/20">
                      <span className="block font-bold text-foreground">totalSupply()</span>
                      Suministro total emitido.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Funciones Clave</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1">
                      <span className="font-mono text-primary font-bold shrink-0">transfer()</span>
                      <span>Envía saldo directamente desde tu cuenta a otra dirección.</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-mono text-primary font-bold shrink-0">approve()</span>
                      <span>Otorga a una aplicación (ej. DEX) permiso de gasto sobre tus tokens.</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-mono text-primary font-bold shrink-0">transferFrom()</span>
                      <span>Realiza una transferencia delegada usando el cupo aprobado previamente.</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Eventos Principales</h4>
                  <div className="space-y-1 text-xs">
                    <p><code className="text-emerald-500 font-mono font-bold">Transfer(from, to, value)</code>: Emitido en cada movimiento de tokens.</p>
                    <p><code className="text-emerald-500 font-mono font-bold">Approval(owner, spender, value)</code>: Emitido al actualizar límites autorizados.</p>
                  </div>
                </div>
              </CardContent>
            </div>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-primary" /> ERC: Ethereum Request for Comments #20
              </span>
            </CardFooter>
          </Card>

          {/* Columna 2: Ejemplo de Código Solidity */}
          <Card className="xl:col-span-2 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 to-emerald-500"></div>
            <div>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                    <Code className="h-5 w-5 text-emerald-500" />
                    2. Contrato Inteligente
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
                    <span>MiToken.sol</span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      solc 0.8.20
                    </span>
                  </div>
                  <pre className="text-[10px] sm:text-[11px] font-mono p-4 overflow-x-auto leading-relaxed text-zinc-300 max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                    <code>
                      <span className="text-zinc-500">// SPDX-License-Identifier: MIT</span>{"\n"}
                      <span className="text-pink-500">pragma</span> <span className="text-amber-500">solidity</span> <span className="text-blue-400">^0.8.20</span>;{"\n\n"}
                      <span className="text-pink-500">import</span> <span className="text-emerald-400">"@openzeppelin/contracts/token/ERC20/ERC20.sol"</span>;{"\n"}
                      <span className="text-pink-500">import</span> <span className="text-emerald-400">"@openzeppelin/contracts/access/Ownable.sol"</span>;{"\n\n"}
                      <span className="text-blue-500">contract</span> <span className="text-yellow-400 font-bold">MiToken</span> <span className="text-pink-500">is</span> <span className="text-yellow-400">ERC20</span>, <span className="text-yellow-400">Ownable</span> {"{"}{"\n"}
                      {"    "}<span className="text-blue-500">constructor</span>({"\n"}
                      {"        "}<span className="text-blue-400">string</span> <span className="text-pink-500">memory</span> name,{"\n"}
                      {"        "}<span className="text-blue-400">string</span> <span className="text-pink-500">memory</span> symbol,{"\n"}
                      {"        "}<span className="text-blue-400">uint256</span> initialSupply{"\n"}
                      {"    "}) <span className="text-yellow-400">ERC20</span>(name, symbol) <span className="text-yellow-400">Ownable</span>(<span className="text-violet-400">msg.sender</span>) {"{"}{"\n"}
                      {"        "}<span className="text-purple-400">_mint</span>(<span className="text-violet-400">msg.sender</span>, initialSupply);{"\n"}
                      {"    "}{"}"}{"\n\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">mint</span>(<span className="text-blue-400">address</span> to, <span className="text-blue-400">uint256</span> amount) <span className="text-pink-500">public</span> <span className="text-amber-500">onlyOwner</span> {"{"}{"\n"}
                      {"        "}<span className="text-purple-400">_mint</span>(to, amount);{"\n"}
                      {"    "}{"}"}{"\n"}
                      {"}"}
                    </code>
                  </pre>
                </div>
              </CardContent>
            </div>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
              <span className="text-[10.5px] text-muted-foreground">
                * Este código es un ejemplo básico. La fábrica utiliza un contrato similar.
              </span>
            </CardFooter>
          </Card>

          {/* Columna 3: Crear y Desplegar Token */}
          <Card className="xl:col-span-1 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-primary"></div>
            <div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                  <Rocket className="h-5 w-5 text-primary" />
                  3. Desplegar Token ERC-20
                </CardTitle>
                <CardDescription>
                  Crea y compila tu token real en la blockchain seleccionada.
                </CardDescription>
              </CardHeader>
              
              {!isConnected || !address ? (
                /* Estado Desconectado en Columna 3 */
                <CardContent className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4 flex-1">
                  <div className="rounded-full bg-primary/10 p-3 text-primary border border-primary/20 shadow-inner">
                    <Wallet className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">Conecta tu Billetera</h4>
                    <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
                      Se requiere una billetera Web3 conectada para firmar la transacción de despliegue en la blockchain.
                    </p>
                  </div>
                  <div className="pt-2">
                    <ConnectButton />
                  </div>
                </CardContent>
              ) : (
                /* Estado Conectado: Formulario de Despliegue */
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
              )}
            </div>
            
            {!isConnected || !address ? (
              <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Listo para conectar
                </span>
              </CardFooter>
            ) : null}
          </Card>

        </div>

        {/* Sección Inferior: Dashboard de Interacción (2 Columnas) */}
        {!isConnected || !address ? (
          /* Estado Desconectado - Panel de Acciones Bloqueado */
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/60 rounded-2xl bg-card/25 text-center space-y-3">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <Coins className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight text-foreground">Dashboard de Interacción</h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Conecta tu billetera para interactuar con los tokens ERC-20 ya desplegados, enviar transferencias, acuñar nuevos saldos o quemar excedentes.
              </p>
            </div>
          </div>
        ) : (
          /* Estado Conectado - Dashboard de Interacción Activo */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
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
                    disabled={isActionPending || allTokenAddresses.length === 0}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  >
                    {allTokenAddresses.length === 0 ? (
                      <option value="" disabled className="bg-card text-foreground">No hay tokens disponibles</option>
                    ) : (
                      allTokenAddresses.map((addr) => (
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

            {/* Balances de Tokens & Historial */}
            <div className="space-y-8">
              
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {isLoadingAllTokens ? (
                          <tr>
                            <td colSpan={3} className="text-center py-8">
                              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                Cargando contratos...
                              </div>
                            </td>
                          </tr>
                        ) : allTokenAddresses.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center py-8 text-xs text-muted-foreground">
                              No hay tokens creados por la fábrica. ¡Sé el primero en desplegar uno!
                            </td>
                          </tr>
                        ) : (
                          allTokenAddresses.map((addr) => (
                            <TokenRow
                              key={addr}
                              tokenAddress={addr}
                              userAddress={address}
                              isSelected={selectedTokenAddr === addr}
                              onSelect={setSelectedTokenAddr}
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
                              <div className="text-xs text-muted-foreground font-mono mt-1 break-all bg-muted/30 px-2 py-0.5 rounded border border-border/20 max-w-fit">
                                Hash: {tx.hash}
                              </div>
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

      <footer className="w-full border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-muted/30 mt-auto">
        <p>Universidad de Santiago de Chile &bull; Diplomado en Tecnologías Blockchain</p>
      </footer>
    </div>
  );
};

export default ERC20Page;
