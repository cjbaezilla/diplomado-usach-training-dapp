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
} from 'lucide-react';
import { useAllTokens, useTokenFactoryActions } from '@/hooks/useTokenFactory';
import { useBaseERC20, useERC20Balance } from '@/hooks/useBaseERC20';

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
        <td className="px-4 py-3 flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
          <div className="space-y-1">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-3 w-10 bg-muted rounded" />
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="h-3 w-24 bg-muted rounded font-mono" />
        </td>
        <td className="px-4 py-3 text-right">
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
        "hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/20",
        isSelected && "bg-primary/10"
      )}
      onClick={() => onSelect(tokenAddress)}
    >
      <td className="px-4 py-3 flex items-center gap-2 font-medium">
        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
          {metadata.symbol.substring(0, 2).toUpperCase()}
        </span>
        <div>
          <div className="font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
            {metadata.name}
            {isOwner && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500 border border-emerald-500/20">
                Owner
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{metadata.symbol}</div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        <span className="hidden sm:inline">{tokenAddress}</span>
        <span className="sm:hidden text-[10px]">
          {tokenAddress.substring(0, 6)}...{tokenAddress.substring(tokenAddress.length - 4)}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
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

const ERC20Page: NextPage = () => {
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <Head>
        <title>Portal de Tokens ERC20 - USACH dApp</title>
        <meta
          content="Creación y administración de tokens ERC20 reales en la dApp USACH"
          name="description"
        />
      </Head>

      <Navbar />

      {/* Notificaciones flotantes */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-lg border shadow-lg animate-in slide-in-from-bottom duration-300 bg-card text-card-foreground border-border">
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

      {/* Contenido Principal */}
      <main className="flex-1 w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Volver al Inicio
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent flex items-center gap-3">
              <Coins className="h-8 w-8 text-primary animate-pulse" />
              Portal de Tokens ERC-20
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Despliega tus propios contratos de tokens ERC-20 y realiza transferencias, acuñaciones y quemas en tiempo real.
            </p>
          </div>
        </div>

        {/* Protección de Billetera */}
        {!isConnected || !address ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-16 border border-dashed border-border rounded-xl bg-card/50 text-center space-y-6 mx-auto shadow-sm">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Wallet className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Billetera Desconectada</h3>
              <p className="text-sm text-muted-foreground mx-auto">
                Para interactuar con el creador y administrador de tokens ERC-20 en la blockchain, primero debes conectar tu billetera Web3.
              </p>
            </div>
            <div className="pt-2">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Formulario de Despliegue y Acciones (Col 1) */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Desplegar Token */}
              <Card className="border border-border/80 shadow-md bg-card/40 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-600"></div>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    Crear y Desplegar Token ERC20
                  </CardTitle>
                  <CardDescription>
                    Despliega un nuevo contrato inteligente ERC-20 usando la fábrica de tokens.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleDeploy}>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="token-name">Nombre del Token</Label>
                      <Input
                        id="token-name"
                        type="text"
                        placeholder="Ej. USACH Training Token"
                        value={deployName}
                        onChange={(e) => setDeployName(e.target.value)}
                        disabled={isDeploying}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="token-symbol">Símbolo (Symbol)</Label>
                      <Input
                        id="token-symbol"
                        type="text"
                        placeholder="Ej. UTT"
                        value={deploySymbol}
                        onChange={(e) => setDeploySymbol(e.target.value)}
                        disabled={isDeploying}
                        maxLength={8}
                        required
                      />
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/30">
                      <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>
                        El suministro inicial por defecto es 0. Podrás acuñar (mint) la cantidad que desees en el panel de acciones una vez desplegado.
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center gap-4 bg-muted/20 border-t border-border/20 p-4">
                    <span className="text-xs text-muted-foreground">
                      * Requiere confirmación en tu billetera.
                    </span>
                    <Button type="submit" disabled={isDeploying} className="shadow-sm">
                      {isDeploying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                          Desplegando...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-1.5" />
                          Desplegar Token
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Acciones de Token */}
              <Card className="border border-border/80 shadow-md bg-card/40 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-primary"></div>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Acciones del Token
                  </CardTitle>
                  <CardDescription>
                    Realiza transferencias, acuñaciones o quemas sobre el token seleccionado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="select-token">Selecciona el Token</Label>
                    <select
                      id="select-token"
                      value={selectedTokenAddr || ''}
                      onChange={(e) => setSelectedTokenAddr(e.target.value as `0x${string}`)}
                      disabled={isActionPending || allTokenAddresses.length === 0}
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card text-foreground"
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
                    <>
                      {/* Tabs de Acciones */}
                      <div className="flex border-b border-border/20 mb-4 bg-muted/20 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setActiveTab('transfer')}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5",
                            activeTab === 'transfer'
                              ? "bg-background text-primary shadow-sm"
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
                                "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5",
                                activeTab === 'mint'
                                  ? "bg-background text-primary shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <PlusCircle className="h-3.5 w-3.5" /> Acuñar (Mint)
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab('burn')}
                              className={cn(
                                "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5",
                                activeTab === 'burn'
                                  ? "bg-background text-primary shadow-sm"
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
                        <form onSubmit={handleTransfer} className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="recipient">Dirección de Destino</Label>
                            <Input
                              id="recipient"
                              type="text"
                              placeholder="0x..."
                              value={transferRecipient}
                              onChange={(e) => setTransferRecipient(e.target.value)}
                              disabled={isActionPending}
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="amount">Cantidad a Transferir</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="0.00"
                              value={transferAmount}
                              onChange={(e) => setTransferAmount(e.target.value)}
                              disabled={isActionPending}
                              min="0.000001"
                              step="any"
                              required
                            />
                          </div>
                          <Button type="submit" disabled={isActionPending} className="w-full shadow-sm mt-2">
                            {isActionPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                Transferiendo...
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
                        <form onSubmit={handleMint} className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="mint-recipient">Dirección a Acuñar</Label>
                            <Input
                              id="mint-recipient"
                              type="text"
                              placeholder="0x..."
                              value={mintRecipient}
                              onChange={(e) => setMintRecipient(e.target.value)}
                              disabled={isActionPending}
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="mint-amount">Cantidad a Acuñar</Label>
                            <Input
                              id="mint-amount"
                              type="number"
                              placeholder="0.00"
                              value={mintAmount}
                              onChange={(e) => setMintAmount(e.target.value)}
                              disabled={isActionPending}
                              min="0.000001"
                              step="any"
                              required
                            />
                          </div>
                          <Button type="submit" disabled={isActionPending} className="w-full shadow-sm mt-2">
                            {isActionPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                Acuñando...
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
                        <form onSubmit={handleBurn} className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="burn-amount">Cantidad a Quemar</Label>
                            <Input
                              id="burn-amount"
                              type="number"
                              placeholder="0.00"
                              value={burnAmount}
                              onChange={(e) => setBurnAmount(e.target.value)}
                              disabled={isActionPending}
                              min="0.000001"
                              step="any"
                              required
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">
                              * Los tokens se quemarán directamente de tu balance de cuenta conectada.
                            </p>
                          </div>
                          <Button type="submit" disabled={isActionPending} variant="destructive" className="w-full shadow-sm mt-2">
                            {isActionPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                Quemando...
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
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Listado de Balances & Historial (Col 2) */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Balances */}
              <Card className="border border-border/80 shadow-md bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Tus Balances de Tokens
                  </CardTitle>
                  <CardDescription>
                    Muestra los tokens desplegados en la fábrica y tu balance en cada uno.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/40 text-xs text-muted-foreground border-y border-border/20">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Token</th>
                          <th className="px-4 py-3 font-semibold">Dirección del Contrato</th>
                          <th className="px-4 py-3 font-semibold text-right">Tu Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
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
                              No hay tokens creados por la fábrica. ¡Sé el primero en crear uno!
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
              <Card className="border border-border/80 shadow-md bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Historial de Transacciones Realizadas
                  </CardTitle>
                  <CardDescription>
                    Registro de acciones on-chain ejecutadas desde esta página en la sesión actual.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No hay transacciones registradas en esta sesión.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/10 text-sm hover:border-border/60 transition-colors"
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={cn(
                                "flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold shrink-0",
                                tx.type === 'deploy' && 'bg-blue-500/10 text-blue-500',
                                tx.type === 'transfer' && 'bg-emerald-500/10 text-emerald-500',
                                tx.type === 'mint' && 'bg-purple-500/10 text-purple-500',
                                tx.type === 'burn' && 'bg-rose-500/10 text-rose-500'
                              )}
                            >
                              {tx.type === 'deploy' && 'D'}
                              {tx.type === 'transfer' && 'T'}
                              {tx.type === 'mint' && 'M'}
                              {tx.type === 'burn' && 'B'}
                            </span>
                            <div>
                              <div className="font-semibold text-foreground text-xs sm:text-sm">
                                {tx.type === 'deploy' && `Desplegado smart contract ${tx.tokenSymbol}`}
                                {tx.type === 'transfer' && `Enviados ${tx.amount} ${tx.tokenSymbol}`}
                                {tx.type === 'mint' && `Acuñados ${tx.amount} ${tx.tokenSymbol}`}
                                {tx.type === 'burn' && `Quemados ${tx.amount} ${tx.tokenSymbol}`}
                              </div>
                              {tx.to && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Hacia: <span className="font-mono">{tx.to}</span>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground font-mono mt-0.5 break-all">
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

      <footer className="w-full border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-muted/40 mt-auto">
        <p>Universidad de Santiago de Chile &bull; Diplomado en Tecnologías Blockchain</p>
      </footer>
    </div>
  );
};

export default ERC20Page;
