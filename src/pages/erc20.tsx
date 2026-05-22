import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
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
} from 'lucide-react';

interface Token {
  address: string;
  name: string;
  symbol: string;
  supply: number;
  balance: number;
}

interface Transaction {
  id: string;
  type: 'deploy' | 'transfer';
  tokenSymbol: string;
  amount?: number;
  to?: string;
  hash: string;
  timestamp: string;
  status: 'exitoso' | 'pendiente';
}

const initialTokens: Token[] = [
  {
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    name: 'USACH Coin',
    symbol: 'USACH',
    supply: 1000000,
    balance: 100000,
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    name: 'Tether USD',
    symbol: 'USDT',
    supply: 50000000,
    balance: 1500,
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    name: 'USD Coin',
    symbol: 'USDC',
    supply: 40000000,
    balance: 2300,
  },
];

const ERC20Page: NextPage = () => {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address } = useAccount();

  // Estados de simulación
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-1',
      type: 'deploy',
      tokenSymbol: 'USACH',
      hash: '0x8f2d5a...3c2f',
      timestamp: 'Hace 5 minutos',
      status: 'exitoso',
    },
  ]);

  // Estados de formularios
  const [deployName, setDeployName] = useState('');
  const [deploySymbol, setDeploySymbol] = useState('');
  const [deploySupply, setDeploySupply] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  const [selectedTokenAddr, setSelectedTokenAddr] = useState(initialTokens[0].address);
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

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
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Simular el despliegue del token
  const handleDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deployName || !deploySymbol || !deploySupply) {
      setNotification({
        type: 'error',
        message: 'Por favor, completa todos los campos para desplegar el token.',
      });
      return;
    }

    const supplyNum = parseFloat(deploySupply);
    if (isNaN(supplyNum) || supplyNum <= 0) {
      setNotification({
        type: 'error',
        message: 'El suministro inicial debe ser un número positivo.',
      });
      return;
    }

    setIsDeploying(true);

    setTimeout(() => {
      // Crear dirección aleatoria ficticia
      const randomHex = Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      const mockAddress = `0x${randomHex.substring(0, 6)}...${randomHex.substring(34)}`;
      const txHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('').substring(0, 6)}...${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('').substring(58)}`;

      const newToken: Token = {
        address: `0x${randomHex}`,
        name: deployName,
        symbol: deploySymbol.toUpperCase(),
        supply: supplyNum,
        balance: supplyNum, // El creador recibe todo el suministro inicial
      };

      setTokens((prev) => [newToken, ...prev]);
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: 'deploy',
          tokenSymbol: newToken.symbol,
          hash: txHash,
          timestamp: 'Justo ahora',
          status: 'exitoso',
        },
        ...prev,
      ]);

      // Seleccionar el nuevo token de forma predeterminada para transferir
      setSelectedTokenAddr(newToken.address);

      // Limpiar formulario
      setDeployName('');
      setDeploySymbol('');
      setDeploySupply('');
      setIsDeploying(false);

      setNotification({
        type: 'success',
        message: `¡Token ${newToken.symbol} desplegado exitosamente en la dirección ${mockAddress}!`,
      });
    }, 2000);
  };

  // Simular la transferencia del token
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRecipient || !transferAmount) {
      setNotification({
        type: 'error',
        message: 'Por favor, completa todos los campos para transferir.',
      });
      return;
    }

    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setNotification({
        type: 'error',
        message: 'La cantidad a transferir debe ser un número positivo.',
      });
      return;
    }

    // Verificar formato de dirección destino (básico)
    if (!transferRecipient.startsWith('0x') || transferRecipient.length < 10) {
      setNotification({
        type: 'error',
        message: 'La dirección de destino no parece una dirección hexadecimal válida.',
      });
      return;
    }

    // Buscar token seleccionado
    const tokenIndex = tokens.findIndex((t) => t.address === selectedTokenAddr);
    if (tokenIndex === -1) {
      setNotification({
        type: 'error',
        message: 'Token no encontrado.',
      });
      return;
    }

    const token = tokens[tokenIndex];

    if (token.balance < amountNum) {
      setNotification({
        type: 'error',
        message: `Saldo insuficiente. Tu saldo actual de ${token.symbol} es ${token.balance.toLocaleString()}.`,
      });
      return;
    }

    setIsTransferring(true);

    setTimeout(() => {
      // Actualizar balance
      const updatedTokens = [...tokens];
      updatedTokens[tokenIndex] = {
        ...token,
        balance: token.balance - amountNum,
      };
      setTokens(updatedTokens);

      const txHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('').substring(0, 6)}...${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('').substring(58)}`;

      // Agregar transacción
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: 'transfer',
          tokenSymbol: token.symbol,
          amount: amountNum,
          to: transferRecipient.substring(0, 6) + '...' + transferRecipient.substring(transferRecipient.length - 4),
          hash: txHash,
          timestamp: 'Justo ahora',
          status: 'exitoso',
        },
        ...prev,
      ]);

      // Limpiar formulario de transferencia
      setTransferAmount('');
      setTransferRecipient('');
      setIsTransferring(false);

      setNotification({
        type: 'success',
        message: `¡Transferidos ${amountNum.toLocaleString()} ${token.symbol} a ${transferRecipient.substring(0, 6)}... exitosamente!`,
      });
    }, 1500);
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
        <title>Simulador ERC20 - USACH dApp</title>
        <meta
          content="Simulador de creación y transferencia de tokens ERC20 para entrenamiento"
          name="description"
        />
      </Head>

      {/* Barra de navegación responsiva */}
      <Navbar />

      {/* Notificaciones flotantes */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md p-4 rounded-lg border shadow-lg animate-in slide-in-from-bottom duration-300 bg-card text-card-foreground">
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            )}
            <div>
              <h4 className="font-semibold text-sm">
                {notification.type === 'success' ? 'Operación Exitosa' : 'Ocurrió un error'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Encabezado de la página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Volver al Inicio
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent flex items-center gap-3">
              <Coins className="h-8 w-8 text-primary" />
              Portal de Tokens ERC-20
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Despliega tus propios tokens personalizados y simula transferencias de forma inmediata en el entorno de desarrollo.
            </p>
          </div>
        </div>

        {/* Protección de Conexión de Billetera */}
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-16 border border-dashed border-border rounded-xl bg-card/50 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Wallet className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Billetera Desconectada</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Para interactuar con el simulador de tokens ERC-20, crear tus propios activos blockchain y transferirlos, primero debes conectar tu billetera Web3.
              </p>
            </div>
            <div className="pt-2">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Formulario de Despliegue (Col 1) */}
            <div className="lg:col-span-6 space-y-8">
              <Card className="border border-border/80 shadow-md bg-card/40 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-teal-600"></div>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    Crear y Desplegar Token ERC20
                  </CardTitle>
                  <CardDescription>
                    Define los parámetros básicos para desplegar tu propio smart contract de token ERC20 simulado.
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div className="space-y-1.5">
                        <Label htmlFor="token-supply">Suministro Inicial</Label>
                        <Input
                          id="token-supply"
                          type="number"
                          placeholder="Ej. 1000000"
                          value={deploySupply}
                          onChange={(e) => setDeploySupply(e.target.value)}
                          disabled={isDeploying}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center gap-4 bg-muted/20 border-t border-border/20 p-4">
                    <span className="text-xs text-muted-foreground">
                      * El suministro se asignará completamente a tu cuenta.
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

              {/* Formulario de Transferencia */}
              <Card className="border border-border/80 shadow-md bg-card/40 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 to-primary"></div>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    Transferir Token ERC-20
                  </CardTitle>
                  <CardDescription>
                    Envía tokens de tu balance simulado a otra dirección hexadecimal.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleTransfer}>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="select-token">Selecciona el Token</Label>
                      <select
                        id="select-token"
                        value={selectedTokenAddr}
                        onChange={(e) => setSelectedTokenAddr(e.target.value)}
                        disabled={isTransferring}
                        className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card text-foreground"
                      >
                        {tokens.map((token) => (
                          <option key={token.address} value={token.address}>
                            {token.name} ({token.symbol}) - Saldo: {token.balance.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="recipient">Dirección de Destino</Label>
                      <Input
                        id="recipient"
                        type="text"
                        placeholder="0x..."
                        value={transferRecipient}
                        onChange={(e) => setTransferRecipient(e.target.value)}
                        disabled={isTransferring}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="amount">Cantidad a Enviar</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        disabled={isTransferring}
                        min="0.000001"
                        step="any"
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center gap-4 bg-muted/20 border-t border-border/20 p-4">
                    <span className="text-xs text-muted-foreground">
                      * Simulación de red instantánea sin costos de gas.
                    </span>
                    <Button type="submit" disabled={isTransferring} className="shadow-sm">
                      {isTransferring ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                          Transfiriendo...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1.5" />
                          Enviar Tokens
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
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
                    Balances actuales del usuario conectado para interactuar en la simulación.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/40 text-xs text-muted-foreground border-y border-border/20">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Token</th>
                          <th className="px-4 py-3 font-semibold">Dirección de Contrato</th>
                          <th className="px-4 py-3 font-semibold text-right">Tu Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {tokens.map((token) => (
                          <tr key={token.address} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 flex items-center gap-2 font-medium">
                              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                {token.symbol.substring(0, 2)}
                              </span>
                              <div>
                                <div className="font-semibold text-foreground">{token.name}</div>
                                <div className="text-xs text-muted-foreground">{token.symbol}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                              {token.address.substring(0, 6)}...{token.address.substring(token.address.length - 4)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                              {token.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </td>
                          </tr>
                        ))}
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
                    Historial de Transacciones (Simulado)
                  </CardTitle>
                  <CardDescription>
                    Registro de acciones que has realizado durante esta sesión de simulación.
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
                              className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold ${
                                tx.type === 'deploy'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : 'bg-green-500/10 text-green-500'
                              }`}
                            >
                              {tx.type === 'deploy' ? 'D' : 'T'}
                            </span>
                            <div>
                              <div className="font-semibold text-foreground">
                                {tx.type === 'deploy'
                                  ? `Desplegado smart contract ${tx.tokenSymbol}`
                                  : `Enviado ${tx.amount?.toLocaleString()} ${tx.tokenSymbol}`}
                              </div>
                              {tx.to && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Hacia: <span className="font-mono">{tx.to}</span>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                Hash: {tx.hash}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
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

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-muted/40 mt-auto">
        <p>Universidad de Santiago de Chile &bull; Diplomado en Tecnologías Blockchain</p>
      </footer>
    </div>
  );
};

export default ERC20Page;
