import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Coins, User, Award, ArrowRightLeft, Menu, X, Home, HelpCircle, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { useHydrated } from '@/hooks/useHydrated';
import { EthPriceTicker } from './EthPriceTicker';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

function CustomConnectButton() {
  const isHydrated = useHydrated();
  const router = useRouter();
  const { address } = useAccount();

  const isActive = (path: string) => router.pathname === path;

  // Botón reutilizable del Ranking de Tokens
  const rankingButton = (
    <Link
      href="/ranking"
      title="Ranking de Tokens"
      className={cn(
        "flex items-center justify-center h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-primary hover:border-primary/50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm shrink-0",
        isActive('/ranking') && "text-primary border-primary bg-primary/5"
      )}
    >
      <TrendingUp className="h-4 w-4" />
    </Link>
  );

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        if (!ready) {
          return (
            <div className="flex items-center gap-2">
              {rankingButton}
              <div
                aria-hidden={true}
                style={{
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
                className="h-8 w-28 bg-slate-800 rounded-lg animate-pulse"
              />
            </div>
          );
        }

        if (!connected) {
          return (
            <div className="flex items-center gap-2">
              {rankingButton}
              <button
                onClick={openConnectModal}
                type="button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-3.5 py-1.5 rounded-lg text-xs tracking-wider uppercase transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md shadow-primary/10 border border-primary/20"
              >
                Conectar
              </button>
            </div>
          );
        }

        if (chain.unsupported) {
          return (
            <div className="flex items-center gap-2">
              {rankingButton}
              <button
                onClick={openChainModal}
                type="button"
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-3.5 py-1.5 rounded-lg text-xs tracking-wider uppercase transition-all duration-200 active:scale-95 border border-red-500/30"
              >
                Red no soportada
              </button>
            </div>
          );
        }

        const profilePath = `/estudiante/${address?.toLowerCase()}`;

        return (
          <div className="flex items-center gap-2">
            {/* Enlace "Ranking" siempre visible */}
            {rankingButton}

            {/* Enlace "Mi Perfil" al lado izquierdo del selector de red */}
            {isHydrated && address && (
              <Link
                href={profilePath}
                title="Mi Perfil"
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-primary hover:border-primary/50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm shrink-0",
                  isActive(profilePath) && "text-primary border-primary bg-primary/5"
                )}
              >
                <User className="h-4 w-4" />
              </Link>
            )}

            {/* Selector de red */}
            <button
              onClick={openChainModal}
              type="button"
              className="flex items-center gap-1.5 h-8 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all duration-200 active:scale-95 shrink-0"
            >
              {chain.hasIcon && (
                <div
                  style={{
                    background: chain.iconBackground,
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                  className="flex items-center justify-center shrink-0"
                >
                  {chain.iconUrl && (
                    <img
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      style={{ width: 16, height: 16 }}
                    />
                  )}
                </div>
              )}
              <span className="hidden sm:inline">{chain.name}</span>
            </button>

            {/* Selector de cuenta */}
            <button
              onClick={openAccountModal}
              type="button"
              className="flex items-center justify-center h-8 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all duration-200 active:scale-95 shrink-0"
            >
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function Navbar() {
  const router = useRouter();
  const isHydrated = useHydrated();
  const { address, isConnected } = useAccount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Función para verificar si la ruta actual es la activa
  const isActive = (path: string) => router.pathname === path;

  // Clases para los enlaces de escritorio
  const getNavLinkClass = (path: string) =>
    cn(
      "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wider transition-all duration-200 relative uppercase",
      isActive(path)
        ? "text-primary border-b-2 border-primary font-bold"
        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 rounded-md"
    );

  // Clases para los enlaces móviles
  const getMobileNavLinkClass = (path: string) =>
    cn(
      "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200",
      isActive(path)
        ? "bg-primary/10 text-primary border-l-4 border-primary font-bold"
        : "text-slate-300 hover:text-white hover:bg-slate-800/40"
    );

  return (
    <header className="sticky top-0 z-50 w-full shadow-md select-none">
      {/* 1. SECCIÓN SUPERIOR (Desktop only) - Marca, Info e Interactividad */}
      <div className="hidden md:block w-full bg-slate-950 border-b border-slate-900 text-white">
        <div className="flex h-14 items-center justify-between px-6 sm:px-8 mx-auto w-full">
          {/* Logo y Nombre Institucional */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <img
                src="/usach-logo-blanco.png"
                alt="Logo USACH"
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="font-extrabold tracking-wider text-xs leading-none text-white uppercase">
                  Universidad de Santiago de Chile
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
                    Laboratorio de Aprendizaje DeFi y Web3
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[8px] font-extrabold tracking-normal uppercase border border-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.1)]">
                    v1.04
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Widgets y Botón de Billetera */}
          <div className="flex items-center gap-4">
            <EthPriceTicker variant="dark" />
            <div className="h-6 w-[1px] bg-slate-800" />
            <CustomConnectButton />
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN INFERIOR (Desktop only) - Enlaces Principales de Navegación */}
      <div className="hidden md:block w-full bg-slate-900 border-b border-slate-800 text-slate-300">
        <div className="flex h-11 items-center justify-between px-6 sm:px-8 mx-auto w-full">
          <nav className="flex items-center gap-2">
            <Link href="/" className={getNavLinkClass('/')}>
              <Home className="h-3.5 w-3.5" />
              Inicio
            </Link>
            <Link href="/identity" className={getNavLinkClass('/identity')}>
              <User className="h-3.5 w-3.5" />
              Identidad
            </Link>
            <Link href="/desafios" className={getNavLinkClass('/desafios')}>
              <Trophy className="h-3.5 w-3.5" />
              Desafíos
            </Link>
            <Link href="/erc20" className={getNavLinkClass('/erc20')}>
              <Coins className="h-3.5 w-3.5" />
              Tokens ERC20
            </Link>
            <Link href="/dex" className={getNavLinkClass('/dex')}>
              <ArrowRightLeft className="h-3.5 w-3.5" />
              DEX
            </Link>
            <Link href="/relics" className={getNavLinkClass('/relics')}>
              <Award className="h-3.5 w-3.5" />
              Reliquias
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/cjbaezilla/diplomado-usach-training-dapp-contracts"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wider text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 rounded-md transition-all duration-200 uppercase"
              title="Contratos inteligentes de la DApp"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              Contratos
            </a>
            <a
              href="https://github.com/cjbaezilla/diplomado-usach-training-dapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wider text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 rounded-md transition-all duration-200 uppercase"
              title="Código fuente de la DApp"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              Código Fuente
            </a>
            <div className="h-5 w-[1px] bg-slate-800 self-center" />
            <Link
              href="/aprender"
              className={getNavLinkClass('/aprender')}
              title="Centro de Aprendizaje de la DApp"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Aprender
            </Link>
          </div>
        </div>
      </div>

      {/* 3. VERSIÓN MÓVIL COMPACTA (Mobile only) */}
      <div className="md:hidden w-full bg-slate-950 border-b border-slate-900 text-white">
        <div className="flex h-16 items-center justify-between px-4 w-full">
          {/* Logo y Nombre Corto */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/usach-logo-blanco.png"
              alt="Logo USACH"
              className="h-9 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-[11px] text-white leading-tight">
                USACH
              </span>
              <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">
                Blockchain DApp
              </span>
            </div>
          </Link>

          {/* Acciones y Hamburguesa */}
          <div className="flex items-center gap-2">
            <div className="scale-85 origin-right">
              <CustomConnectButton />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. MENÚ MÓVIL DESPLEGABLE (Drawer Overlay) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[64px] bottom-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between border-t border-slate-900 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {/* Widget de Precio en Móvil */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estado de Red y Mercado</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Precio ETH/USDT:</span>
                <EthPriceTicker variant="dark" />
              </div>
            </div>

            {/* Enlaces de Navegación en Móvil */}
            <nav className="flex flex-col gap-1.5">
              <Link
                href="/"
                className={getMobileNavLinkClass('/')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Inicio
              </Link>
              <Link
                href="/identity"
                className={getMobileNavLinkClass('/identity')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Identidad
              </Link>
              <Link
                href="/desafios"
                className={getMobileNavLinkClass('/desafios')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Trophy className="h-4 w-4" />
                Desafíos
              </Link>
              <Link
                href="/erc20"
                className={getMobileNavLinkClass('/erc20')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Coins className="h-4 w-4" />
                Tokens ERC20
              </Link>
              <Link
                href="/dex"
                className={getMobileNavLinkClass('/dex')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ArrowRightLeft className="h-4 w-4" />
                DEX
              </Link>
              <Link
                href="/relics"
                className={getMobileNavLinkClass('/relics')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Award className="h-4 w-4" />
                Reliquias
              </Link>
              <Link
                href="/aprender"
                className={getMobileNavLinkClass('/aprender')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HelpCircle className="h-4 w-4" />
                Aprender
              </Link>
              <a
                href="https://github.com/cjbaezilla/diplomado-usach-training-dapp-contracts"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <GithubIcon className="h-4 w-4" />
                Contratos (GitHub)
              </a>
              <a
                href="https://github.com/cjbaezilla/diplomado-usach-training-dapp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <GithubIcon className="h-4 w-4" />
                Código Fuente (GitHub)
              </a>
            </nav>
          </div>

          {/* Footer del Menú Móvil */}
          <div className="p-6 border-t border-slate-900 bg-slate-950 text-center space-y-2">
            <p className="text-[10px] text-slate-500 font-medium">
              Diplomado en Tecnologías Blockchain &bull; USACH
            </p>
            <p className="text-[9px] text-slate-600">
              Departamento de Ingeniería Informática
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
