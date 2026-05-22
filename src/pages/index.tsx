import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { FaucetInfo } from '@/components/FaucetInfo';
import { WalletGuide } from '@/components/WalletGuide';

const Home: NextPage = () => {
  const [mounted, setMounted] = useState(false);
  const { isConnected, address } = useAccount();
  const router = useRouter();

  // Asegura que el componente esté montado en el cliente para evitar fallos de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <Head>
        <title>USACH dApp de Entrenamiento</title>
        <meta
          content="Aplicación descentralizada de entrenamiento para el Diplomado de la USACH"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      {/* Barra de navegación responsiva */}
      <Navbar />

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto space-y-8 w-full">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Módulo de Aprendizaje Activo</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
            Plataforma de Entrenamiento Web3
          </h1>
          
          <p className="max-w-[42rem] mx-auto leading-normal text-muted-foreground sm:text-lg sm:leading-8">
            Bienvenido a la dApp oficial de entrenamiento. Esta interfaz simplificada te permite conectar tu billetera y comenzar a interactuar con las redes Web3 compatibles.
          </p>
        </div>

        {/* Estado Interactivo (Protección de Hidratación) */}
        {mounted && (
          <div className="w-full max-w-md p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md">
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-500/10 p-3 text-green-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Billetera Conectada</h3>
                  <p className="text-sm text-muted-foreground break-all bg-muted p-2 rounded-md font-mono">
                    {address}
                  </p>
                </div>
                <div className="pt-2">
                  <Button variant="default" className="w-full sm:w-auto" onClick={() => router.push('/erc20')}>
                    Ir a Simulador ERC20
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Billetera Desconectada</h3>
                <p className="text-sm text-muted-foreground">
                  Por favor, conecta tu billetera en la barra superior o utiliza el siguiente botón para iniciar.
                </p>
                <div className="pt-2 flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Componente nuevo de información sobre Wallets */}
        <WalletGuide />

        {/* Componente nuevo de información sobre Faucets */}
        <FaucetInfo />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-muted/40 mt-auto">
        <p>Universidad de Santiago de Chile &bull; Diplomado en Tecnologías Blockchain</p>
      </footer>
    </div>
  );
};

export default Home;
