import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte un nombre de usuario o una URL en una URL válida completa de la red social correspondiente.
 */
export function formatSocialLink(value: string, platform: 'linkedin' | 'twitter'): string {
  if (!value) return '';
  const clean = value.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (platform === 'linkedin') {
    return `https://linkedin.com/in/${clean}`;
  }
  const handle = clean.startsWith('@') ? clean.slice(1) : clean;
  return `https://twitter.com/${handle}`;
}

/**
 * Obtiene una etiqueta o nombre de usuario representativo y limpio a partir de una URL o texto de red social.
 */
export function getSocialDisplayLabel(value: string, platform: 'linkedin' | 'twitter'): string {
  if (!value) return '';
  const clean = value.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const url = new URL(clean);
      let path = url.pathname;
      if (path.endsWith('/')) path = path.slice(0, -1);
      const parts = path.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        return platform === 'twitter' ? `@${lastPart}` : lastPart;
      }
    } catch (e) {
      // Ignorar
    }
    return clean.length > 25 ? clean.substring(0, 22) + '...' : clean;
  }
  return platform === 'twitter' && !clean.startsWith('@') ? `@${clean}` : clean;
}
