import Head from 'next/head';

interface SEOProps {
  /**
   * Título personalizado para la página.
   */
  title?: string;
  /**
   * Descripción SEO de la página.
   */
  description?: string;
  /**
   * Ruta relativa de la imagen Open Graph (ej. "/images/custom.png").
   * Por defecto se usará la imagen generada "/images/og-share.png".
   */
  image?: string;
  /**
   * Ruta relativa de la página actual para el canonical y og:url (ej. "/dex" o "/erc20").
   */
  urlPath?: string;
  /**
   * Tipo de contenido Open Graph (ej. "website", "profile", etc.).
   */
  type?: 'website' | 'article' | 'profile';
  /**
   * Palabras clave adicionales para la indexación.
   */
  keywords?: string[];
}

/**
 * Componente reutilizable para optimizar el posicionamiento SEO, etiquetas Open Graph
 * y Twitter Cards en todas las vistas de la dApp del Diplomado USACH.
 */
export function SEO({
  title,
  description,
  image = '/images/og-share.png',
  urlPath = '',
  type = 'website',
  keywords = [],
}: SEOProps) {
  const baseDomain = 'https://cbaeza.com';
  
  // Limpiar y estructurar los valores definitivos
  const defaultTitle = 'WEB3 USACH LAB | Laboratorio DeFi y Web3';
  const fullTitle = title ? `${title} | WEB3 USACH LAB` : defaultTitle;
  
  const defaultDescription =
    'Aplicación descentralizada (dApp) de entrenamiento y laboratorio práctico interactivo para el Diplomado en Tecnologías Blockchain de la USACH. Aprende sobre Smart Contracts, tokens ERC-20, reliquias ERC-1155 y aporta liquidez a pools en nuestro DEX.';
  const finalDescription = description || defaultDescription;
  
  // Asegurar que la URL y la imagen sean absolutas para los rastreadores
  const canonicalUrl = `${baseDomain}${urlPath}`;
  const absoluteImageUrl = image.startsWith('http') ? image : `${baseDomain}${image}`;

  // Lista de palabras clave por defecto y personalizadas combinadas
  const defaultKeywords = [
    'web3',
    'defi',
    'usach',
    'blockchain',
    'ethereum',
    'sepolia',
    'smart contracts',
    'erc20',
    'erc1155',
    'dex',
    'liquidez',
    'chile',
    'educacion web3'
  ];
  const combinedKeywords = Array.from(new Set([...defaultKeywords, ...keywords])).join(', ');

  return (
    <Head>
      {/* Metadatos Estándar */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={combinedKeywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta charSet="utf-8" />
      
      {/* Enlace Canónico */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Favicon e Iconos */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />

      {/* Open Graph (Facebook / LinkedIn / Meta) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="WEB3 USACH LAB" />
      <meta property="og:locale" content="es_CL" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={absoluteImageUrl} />
    </Head>
  );
}
