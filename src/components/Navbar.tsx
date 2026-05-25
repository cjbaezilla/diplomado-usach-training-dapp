import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Coins, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const router = useRouter();

  // Función para verificar si la ruta actual es la activa
  const isActive = (path: string) => router.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-foreground/10 bg-primary py-3 shadow-md">
      <div className="flex h-12 items-center justify-between px-4 sm:px-8 mx-auto w-full">
        {/* Logo / Título con imagen de la USACH */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src="/usach-logo-blanco.png"
              alt="Logo USACH"
              className="h-14 w-auto object-contain"
            />
            <span className="font-bold tracking-tight text-lg sm:text-xl text-primary-foreground">
              WEB3
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground px-2.5 py-0.5 text-xs font-semibold">
            Entrenamiento
          </span>
        </div>

        {/* Enlaces de Navegación */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link
            href="/"
            className={cn(
              "transition-colors",
              isActive('/')
                ? "text-primary-foreground underline decoration-2 underline-offset-4"
                : "text-primary-foreground/85 hover:text-primary-foreground"
            )}
          >
            Inicio
          </Link>
          <Link
            href="/erc20"
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              isActive('/erc20')
                ? "text-primary-foreground underline decoration-2 underline-offset-4"
                : "text-primary-foreground/85 hover:text-primary-foreground"
            )}
          >
            <Coins className="h-4 w-4" />
            Tokens ERC20
          </Link>
          <Link
            href="/identity"
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              isActive('/identity')
                ? "text-primary-foreground underline decoration-2 underline-offset-4"
                : "text-primary-foreground/85 hover:text-primary-foreground"
            )}
          >
            <User className="h-4 w-4" />
            Identidad
          </Link>
        </nav>

        {/* Botón de Conexión de RainbowKit */}
        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
