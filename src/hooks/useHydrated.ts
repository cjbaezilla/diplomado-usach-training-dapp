import { useEffect, useState } from 'react';

/**
 * Hook personalizado para determinar si el componente ya se ha montado
 * en el cliente (hidratado). Evita errores de "Hydration Mismatch" 
 * al interactuar con estado Web3 o variables del cliente durante el SSR.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
