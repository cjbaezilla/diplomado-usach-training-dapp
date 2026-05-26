import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Coins, User, Award, ArrowRightLeft, Menu, X, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount } from 'wagmi';
import { useHydrated } from '@/hooks/useHydrated';
import { EthPriceTicker } from './EthPriceTicker';

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
                <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                  Laboratorio de Aprendizaje DeFi y Web3
                </span>
              </div>
            </Link>
          </div>

          {/* Widgets y Botón de Billetera */}
          <div className="flex items-center gap-6">
            <EthPriceTicker variant="dark" />
            <div className="h-6 w-[1px] bg-slate-800" />
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN INFERIOR (Desktop only) - Enlaces Principales de Navegación */}
      <div className="hidden md:block w-full bg-slate-900 border-b border-slate-800 text-slate-300">
        <div className="flex h-11 items-center justify-start px-6 sm:px-8 mx-auto w-full">
          <nav className="flex items-center gap-2">
            <Link href="/" className={getNavLinkClass('/')}>
              <Home className="h-3.5 w-3.5" />
              Inicio
            </Link>
            <Link href="/erc20" className={getNavLinkClass('/erc20')}>
              <Coins className="h-3.5 w-3.5" />
              Tokens ERC20
            </Link>
            <Link href="/dex" className={getNavLinkClass('/dex')}>
              <ArrowRightLeft className="h-3.5 w-3.5" />
              DEX
            </Link>
            <Link href="/identity" className={getNavLinkClass('/identity')}>
              <User className="h-3.5 w-3.5" />
              Identidad
            </Link>
            <Link href="/relics" className={getNavLinkClass('/relics')}>
              <Award className="h-3.5 w-3.5" />
              Reliquias
            </Link>
            {isHydrated && isConnected && address && (
              <Link
                href={`/estudiante/${address.toLowerCase()}`}
                className={getNavLinkClass(`/estudiante/${address.toLowerCase()}`)}
              >
                <User className="h-3.5 w-3.5" />
                Mi Perfil
              </Link>
            )}
          </nav>
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
            <div className="scale-90 origin-right">
              <ConnectButton />
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
                href="/identity"
                className={getMobileNavLinkClass('/identity')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Identidad
              </Link>
              <Link
                href="/relics"
                className={getMobileNavLinkClass('/relics')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Award className="h-4 w-4" />
                Reliquias
              </Link>
              {isHydrated && isConnected && address && (
                <Link
                  href={`/estudiante/${address.toLowerCase()}`}
                  className={getMobileNavLinkClass(`/estudiante/${address.toLowerCase()}`)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </Link>
              )}
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
