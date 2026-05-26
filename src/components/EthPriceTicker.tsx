import { useState, useEffect, useRef } from 'react';
import { useEthPrice } from '@/hooks/useEthPrice';
import { useHydrated } from '@/hooks/useHydrated';
import { TrendingUp, AlertCircle, Loader2, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Componente EthPriceTicker
 * Muestra el precio actual de ETH/USDT obtenido en tiempo real desde la API de Binance.
 * Se actualiza automáticamente cada 15 segundos y reacciona visualmente ante cambios de precio
 * (verde para subidas, rojo para bajadas, con micro-animaciones).
 */
export function EthPriceTicker({ variant = 'default' }: { variant?: 'default' | 'dark' }) {
  const isHydrated = useHydrated();
  const { data: price, isLoading, isError } = useEthPrice();
  
  const [trend, setTrend] = useState<'up' | 'down' | 'same'>('same');
  const prevPriceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (price !== undefined) {
      if (prevPriceRef.current !== undefined) {
        if (price > prevPriceRef.current) {
          setTrend('up');
          const timer = setTimeout(() => setTrend('same'), 4000);
          return () => clearTimeout(timer);
        } else if (price < prevPriceRef.current) {
          setTrend('down');
          const timer = setTimeout(() => setTrend('same'), 4000);
          return () => clearTimeout(timer);
        }
      }
      prevPriceRef.current = price;
    }
  }, [price]);

  // Si no está hidratado en el cliente, mostramos un estado de carga sutil para evitar Hydration Mismatch
  if (!isHydrated) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs",
        variant === 'dark'
          ? "bg-slate-900/50 border-slate-800/80 text-slate-400"
          : "bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground/60"
      )}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Cargando...</span>
      </div>
    );
  }

  // Estado de carga inicial de React Query
  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs",
        variant === 'dark'
          ? "bg-slate-900/50 border-slate-800/80 text-slate-400"
          : "bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground/60"
      )}>
        <Loader2 className="h-3 w-3 animate-spin text-teal-400" />
        <span className="font-medium">Cargando ETH...</span>
      </div>
    );
  }

  // Estado de error si la API de Binance falla
  if (isError || price === undefined) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs">
        <AlertCircle className="h-3.5 w-3.5" />
        <span className="font-semibold">Error precio</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all duration-500 shadow-sm",
        trend === 'up'
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 scale-[1.03]"
          : trend === 'down'
          ? "bg-rose-500/10 border-rose-500/30 text-rose-400 scale-[1.03]"
          : variant === 'dark'
          ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
          : "bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground/90 hover:bg-primary-foreground/10 hover:border-primary-foreground/20"
      )}
      title="Precio en tiempo real de Binance API (Actualizado cada 15s)"
    >
      <div className="flex items-center gap-1">
        {trend === 'up' ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
        ) : trend === 'down' ? (
          <TrendingDown className="h-3.5 w-3.5 text-rose-400 animate-bounce" />
        ) : (
          <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
        )}
        <span className={cn(
          "font-bold tracking-tight select-none",
          variant === 'dark' ? "text-white" : "text-slate-700"
        )}>
          ETH
        </span>
      </div>
      <span className={cn(
        "font-bold transition-all duration-300",
        trend === 'up'
          ? "text-emerald-400"
          : trend === 'down'
          ? "text-rose-400"
          : variant === 'dark'
          ? "text-slate-200"
          : "text-primary-foreground"
      )}>
        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      
      {/* Indicador de pulso activo */}
      <span className="flex h-1.5 w-1.5 relative">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          trend === 'up' ? "bg-emerald-400" : trend === 'down' ? "bg-rose-400" : "bg-teal-400"
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-1.5 w-1.5",
          trend === 'up' ? "bg-emerald-500" : trend === 'down' ? "bg-rose-500" : "bg-teal-500"
        )}></span>
      </span>
    </div>
  );
}
