import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { CheckCircle2, GraduationCap, BookOpen, ArrowRight, Wallet, Activity } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { FaucetInfo } from '@/components/FaucetInfo';
import { WalletGuide } from '@/components/WalletGuide';
import { useHydrated } from '@/hooks/useHydrated';

const Home: NextPage = () => {
  const isHydrated = useHydrated();
  const { isConnected, address } = useAccount();
  const router = useRouter();

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
      <main className="flex-1 flex flex-col p-6 sm:p-8 md:p-12 space-y-12 w-full">
        {/* Hero de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Columna Izquierda: Información Académica y DeFi */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <GraduationCap className="h-4 w-4" />
              <span>Diplomado en Tecnologías Blockchain &bull; USACH</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
              Laboratorio de Aprendizaje DeFi y Web3
            </h1>
            
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
              Esta plataforma es un entorno práctico diseñado para el estudio y experimentación de los protocolos que componen las Finanzas Descentralizadas (DeFi). Aquí podrás interactuar con Smart Contracts de forma segura y directa, aplicando los conocimientos teóricos del diplomado.
            </p>

            <div className="space-y-4 border-l-2 border-primary/20 pl-4 py-1">
              <div className="flex gap-3">
                <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">Fundamentos Teóricos con Práctica Directa</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Entiende el gas, las firmas de transacciones, los proveedores de RPC y el ciclo de vida de los bloques en una red EVM local.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">Interactúa con Tokens Estándar</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Experimenta con acuñación (minting), transferencias y quemado (burning) de tokens estándar ERC-20 y ERC-1155.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Widget de Billetera y Accesos Rápidos */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center">
            {isHydrated && (
              <div className="w-full p-6 rounded-2xl border border-border/80 bg-card/65 text-card-foreground shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-cyan-500"></div>
                {isConnected ? (
                  <div className="space-y-6 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/10 p-2 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm tracking-tight">Estudiante Conectado</h3>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Estado de Sesión Web3</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                        Activo
                      </span>
                    </div>

                    <div className="space-y-2 bg-muted/50 p-4 rounded-xl border border-border/40">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Dirección Wallet</span>
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">EVM</span>
                      </div>
                      <p className="text-xs sm:text-sm font-mono text-foreground break-all bg-background/80 p-2.5 rounded-lg border border-border/30">
                        {address}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <p className="text-xs text-muted-foreground text-center">Explora los módulos de aprendizaje disponibles:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-200" 
                          onClick={() => router.push('/erc20')}
                        >
                          <span>Simulador ERC20</span>
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-200" 
                          onClick={() => router.push('/identity')}
                        >
                          <span>Identidad Digital</span>
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="rounded-full bg-primary/10 p-3.5 text-primary">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg">Billetera Desconectada</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Para iniciar las prácticas interactivas y registrar tu progreso académico en la blockchain, por favor conecta tu billetera.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-center">
                      <ConnectButton label="Conectar Billetera de Estudio" />
                    </div>

                    <div className="text-[10px] text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/40">
                      💡 Asegúrate de estar conectado a tu red local (Hardhat) o a la red de prueba Sepolia configurada para el curso.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Secciones informativas lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start pt-8 border-t border-border/30">
          <WalletGuide />
          <FaucetInfo />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-muted/40 mt-auto">
        <p>Universidad de Santiago de Chile &bull; Diplomado en Tecnologías Blockchain</p>
      </footer>
    </div>
  );
};

export default Home;

