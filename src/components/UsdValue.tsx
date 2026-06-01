import { useEthPrice } from '@/hooks/useEthPrice';
import { useHydrated } from '@/hooks/useHydrated';
import { formatUnits } from 'viem';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsdValueProps {
  /**
   * Cantidad en WETH (bigint) o valor numérico directo en WETH/ETH.
   */
  wethAmount?: bigint | number;
  /**
   * Si es bigint, la cantidad de decimales (por defecto 18).
   */
  decimals?: number;
  /**
   * Si es true, muestra un esqueleto de carga en lugar de texto.
   */
  showSkeleton?: boolean;
  className?: string;
}

/**
 * Componente UsdValue
 * Convierte un valor en ETH/WETH a USD utilizando el precio de ETH/USDT en tiempo real de Binance.
 * Cuenta con mitigación de fallos de hidratación (SSR) y formateo adaptativo.
 */
export function UsdValue({ wethAmount, decimals = 18, showSkeleton = false, className }: UsdValueProps) {
  const isHydrated = useHydrated();
  const { data: ethPrice, isLoading, isError } = useEthPrice();

  if (!isHydrated || isLoading) {
    if (showSkeleton) {
      return (
        <span 
          className={cn("inline-block h-4 w-16 bg-muted/65 animate-pulse rounded", className)} 
          aria-hidden="true" 
        />
      );
    }
    return (
      <span className={cn("text-muted-foreground text-xs font-mono flex items-center gap-1.5", className)}>
        <Loader2 className="h-3 w-3 animate-spin text-teal-500" />
        <span>...</span>
      </span>
    );
  }

  if (isError || ethPrice === undefined || wethAmount === undefined) {
    return (
      <span className={cn("text-rose-500 text-xs font-mono font-semibold", className)}>
        Error USD
      </span>
    );
  }

  // Convertir a número flotante si es bigint
  let amountNum = 0;
  if (typeof wethAmount === 'bigint') {
    amountNum = Number(formatUnits(wethAmount, decimals));
  } else {
    amountNum = wethAmount;
  }

  const usdValue = amountNum * ethPrice;

  // Formateo adaptativo para precios pequeños (evitar $0.00 en tokens de bajo valor)
  let formattedUsd = '0.00';
  if (usdValue > 0) {
    if (usdValue < 0.01) {
      const exponent = Math.floor(Math.log10(usdValue));
      const decimalsNeeded = Math.min(Math.max(Math.abs(exponent) + 4, 4), 18);
      formattedUsd = usdValue.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: decimalsNeeded 
      });
    } else {
      formattedUsd = usdValue.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
  }

  return (
    <span className={cn("font-mono text-emerald-500 dark:text-emerald-400 font-bold", className)}>
      ${formattedUsd}
    </span>
  );
}
