import { cn } from '@/lib/utils';

interface TokenIconProps {
  /**
   * Dirección del contrato inteligente del token para usar como semilla de DiceBear.
   */
  address?: string;
  /**
   * Clases CSS opcionales para aplicar al elemento de imagen (ej. tamaños o bordes).
   */
  className?: string;
}

/**
 * Componente TokenIcon reutilizable.
 * Genera y muestra un icono circular único basado en la dirección del contrato de un token
 * utilizando la colección "rings" de DiceBear.
 */
export function TokenIcon({ address, className }: TokenIconProps) {
  // Generar la URL de DiceBear (colección rings)
  // Si la dirección no está provista, se utiliza 'TOKEN_ADDRESS' como fallback de la semilla
  const diceBearUrl = `https://api.dicebear.com/9.x/rings/svg?seed=${address || 'TOKEN_ADDRESS'}`;

  return (
    <img
      src={diceBearUrl}
      alt="Icono del token"
      className={cn(
        "rounded-full object-cover shrink-0 border border-border/20",
        className
      )}
    />
  );
}
