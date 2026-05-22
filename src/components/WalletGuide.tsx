import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wallet, ExternalLink, ShieldCheck, Key } from 'lucide-react';

interface WalletOption {
  name: string;
  url: string;
  description: string;
  badge: string;
  features: string[];
  hoverBorderClass: string;
  accentBgClass: string;
  buttonClass: string;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    name: 'MetaMask',
    url: 'https://metamask.io/',
    description: 'La billetera más popular y utilizada del ecosistema Web3. Disponible como extensión de navegador y aplicación móvil para interactuar con dApps de forma sencilla.',
    badge: 'Popular',
    features: ['Soporte multi-dispositivo', 'Soporta casi todas las dApps', 'Fácil de configurar'],
    hoverBorderClass: 'hover:border-[#e17726]/40 dark:hover:border-[#e17726]/50',
    accentBgClass: 'group-hover/item:text-[#e17726]',
    buttonClass: 'bg-[#e17726] hover:bg-[#c9621b] text-white',
  },
  {
    name: 'Rabby Wallet',
    url: 'https://rabby.io/',
    description: 'Billetera de última generación diseñada específicamente para redes compatibles con EVM. Ofrece una experiencia más segura y detallada para transacciones complejas.',
    badge: 'Recomendada',
    features: ['Previsualización detallada de firmas', 'Protección integrada contra phishing', 'Auto-conmutación inteligente de redes'],
    hoverBorderClass: 'hover:border-[#0c58ff]/40 dark:hover:border-[#0c58ff]/50',
    accentBgClass: 'group-hover/item:text-[#0c58ff]',
    buttonClass: 'bg-[#0c58ff] hover:bg-[#0040cc] text-white',
  }
];

export function WalletGuide() {
  return (
    <div className="w-full space-y-6 text-left animate-in fade-in-50 duration-500">
      {/* Encabezado */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <Wallet className="h-6 w-6 text-primary animate-pulse" />
        <h2 className="text-2xl font-bold tracking-tight">Billeteras Web3 (Wallets)</h2>
      </div>

      {/* Tarjeta Principal */}
      <Card className="border border-border/80 shadow-md bg-card/40 backdrop-blur-sm relative overflow-hidden group">
        {/* Línea decorativa superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-cyan-500"></div>
        
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            ¿Qué es una Billetera Web3 y por qué la necesitas?
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              Una <strong>billetera Web3</strong> (Wallet) es tu identidad y portal de acceso al mundo descentralizado. 
              A diferencia de las aplicaciones tradicionales donde inicias sesión con un correo y contraseña, en la Web3 
              tú eres el único custodio de tus activos e interacciones.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-start gap-2 bg-muted/40 p-2.5 rounded-lg border border-border/45">
                <Key className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Custodia de claves:</strong> Almacena de forma segura tu clave privada o frase semilla. Jamás la compartas con nadie.
                </span>
              </div>
              <div className="flex items-start gap-2 bg-muted/40 p-2.5 rounded-lg border border-border/45">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Firma de transacciones:</strong> Cada acción que modifica la blockchain (como enviar tokens o registrar datos) requiere tu firma explícita.
                </span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <h3 className="text-sm font-semibold text-foreground/80">Opciones recomendadas para comenzar:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WALLET_OPTIONS.map((wallet, index) => (
              <div
                key={index}
                className={`flex flex-col justify-between p-5 rounded-xl border border-border bg-card/60 hover:bg-muted/30 transition-all duration-300 group/item shadow-sm hover:shadow-md ${wallet.hoverBorderClass}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-lg text-foreground transition-colors ${wallet.accentBgClass}`}>
                      {wallet.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
                      {wallet.badge}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {wallet.description}
                  </p>
                  
                  <div className="space-y-1.5 pt-2">
                    {wallet.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/20">
                  <a
                    href={wallet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow ${wallet.buttonClass}`}
                  >
                    <span>Instalar {wallet.name}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
