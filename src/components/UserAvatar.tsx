import { useState, useEffect } from 'react';
import { useStudentProfile } from '@/hooks/useStudentIdentity';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  /**
   * Dirección Ethereum del usuario para consultar su perfil on-chain y usar de semilla de DiceBear.
   */
  address?: `0x${string}`;
  /**
   * Clases de CSS opcionales para personalizar estilos (ej. tamaño o bordes con Tailwind).
   */
  className?: string;
}

/**
 * Componente UserAvatar reutilizable.
 * Consulta la identidad estudiantil del usuario en el contrato inteligente.
 * - Si está registrado y tiene avatar, muestra el avatar de la blockchain.
 * - Si no está registrado o no tiene avatar, muestra un avatar autogenerado usando la librería DiceBear (colección Dylan).
 * - Muestra un efecto de carga skeleton mientras consulta la información.
 */
export function UserAvatar({ address, className }: UserAvatarProps) {
  const { profile, isLoading } = useStudentProfile(address);
  const [imgError, setImgError] = useState(false);

  // Reiniciar el estado de error de la imagen si la dirección consultada cambia
  useEffect(() => {
    setImgError(false);
  }, [address]);

  // Si está cargando la información de la blockchain (y está habilitada la consulta)
  if (isLoading && address) {
    return (
      <div
        className={cn(
          "rounded-full bg-muted animate-pulse shrink-0 border border-border/20",
          className
        )}
      />
    );
  }

  // Si no hay dirección o no se ha encontrado perfil registrado, usar DiceBear (colección dylan)
  // Usamos la dirección como seed, o fallback a 'USER_PRIVATE_KEY' si la dirección no está disponible
  const diceBearUrl = `https://api.dicebear.com/9.x/dylan/svg?seed=${address || 'USER_PRIVATE_KEY'}`;

  // Determinar si debemos usar el avatar de la blockchain o el fallback de DiceBear
  const hasOnChainAvatar = !!(profile?.isRegistered && profile?.avatar && !imgError);
  const avatarSrc = hasOnChainAvatar ? profile.avatar : diceBearUrl;

  return (
    <img
      src={avatarSrc}
      alt={profile?.name ? `Avatar de ${profile.name}` : "Avatar de usuario"}
      className={cn(
        "rounded-full object-cover border border-border/20 shrink-0",
        className
      )}
      onError={() => {
        // Si el avatar de la blockchain falla en cargar, marcamos el error para hacer fallback a Dicebear
        if (hasOnChainAvatar) {
          setImgError(true);
        }
      }}
    />
  );
}
