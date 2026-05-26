import { useQuery } from '@tanstack/react-query';

interface BinanceTickerPrice {
  symbol: string;
  price: string;
}

/**
 * Hook personalizado para obtener el precio de ETH/USDT en tiempo real desde la API de Binance.
 * Utiliza @tanstack/react-query para manejar el estado de la consulta, caché y actualizaciones periódicas.
 */
export function useEthPrice() {
  return useQuery({
    queryKey: ['ethPrice'],
    queryFn: async (): Promise<number> => {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
      if (!response.ok) {
        throw new Error('Error al consultar la API de Binance');
      }
      const data = (await response.json()) as BinanceTickerPrice;
      const parsedPrice = parseFloat(data.price);
      if (isNaN(parsedPrice)) {
        throw new Error('El precio recibido de Binance no es un número válido');
      }
      return parsedPrice;
    },
    // Configuración para mantener el precio actualizado
    refetchInterval: 15000, // Actualizar cada 15 segundos
    staleTime: 10000,       // Considerar los datos obsoletos después de 10 segundos
    refetchOnWindowFocus: true, // Recargar si el usuario vuelve a enfocar la ventana
  });
}
