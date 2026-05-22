import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Droplet, ExternalLink, Info, HelpCircle } from 'lucide-react';

interface FaucetLink {
  name: string;
  url: string;
  description: string;
  requiresAccount: boolean;
  dailyAmount: string;
}

const SEPOLIA_FAUCETS: FaucetLink[] = [
  {
    name: 'Alchemy Sepolia Faucet',
    url: 'https://sepoliafaucet.com/',
    description: 'Grifo popular y rápido. Requiere iniciar sesión con una cuenta gratuita de Alchemy.',
    requiresAccount: true,
    dailyAmount: '0.5 Sepolia ETH',
  },
  {
    name: 'Google Cloud Faucet',
    url: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
    description: 'Grifo oficial de Google Cloud Web3. Requiere iniciar sesión con una cuenta de Google.',
    requiresAccount: true,
    dailyAmount: '0.05 Sepolia ETH',
  },
  {
    name: 'QuickNode Faucet',
    url: 'https://faucet.quicknode.com/ethereum/sepolia',
    description: 'Permite reclamar Sepolia ETH diariamente. Otorga un bono si compartes en redes sociales.',
    requiresAccount: false,
    dailyAmount: '0.05 - 0.1 Sepolia ETH',
  },
  {
    name: 'Infura Sepolia Faucet',
    url: 'https://www.infura.io/faucet/sepolia',
    description: 'Grifo confiable provisto por Infura. Requiere una cuenta gratuita de Infura.',
    requiresAccount: true,
    dailyAmount: '0.5 Sepolia ETH',
  },
  {
    name: 'Chainlink Faucet',
    url: 'https://faucets.chain.link/sepolia',
    description: 'Ideal para obtener Sepolia ETH de prueba y tokens LINK para desarrollo de Smart Contracts.',
    requiresAccount: false,
    dailyAmount: '0.1 Sepolia ETH',
  },
  {
    name: 'Sepolia PoW Faucet',
    url: 'https://sepolia-faucet.pk910.de/',
    description: 'Grifo basado en Proof-of-Work (minería en navegador). No requiere cuenta, evita spam mediante poder de cómputo.',
    requiresAccount: false,
    dailyAmount: 'Variable según minado',
  }
];

export function FaucetInfo() {
  return (
    <div className="w-full space-y-6 text-left animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <Droplet className="h-6 w-6 text-primary animate-pulse" />
        <h2 className="text-2xl font-bold tracking-tight">Grifos de Prueba (Faucets)</h2>
      </div>

      <Card className="border border-border/80 shadow-md bg-card/40 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-teal-600"></div>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            ¿Qué es un Faucet y por qué lo necesitas?
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            Para realizar transacciones, desplegar contratos inteligentes e interactuar con la red de prueba 
            <strong> Ethereum Sepolia</strong>, necesitas pagar tarifas de gas. Dado que es una red de prueba, 
            puedes obtener este saldo gratis a través de los grifos (faucets) listados a continuación. 
            <em> ¡Nunca utilices fondos de la red principal (Mainnet) aquí!</em>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SEPOLIA_FAUCETS.map((faucet, index) => (
              <a
                key={index}
                href={faucet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/30 hover:border-primary/50 transition-all duration-300 group/item shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground group-hover/item:text-primary transition-colors flex items-center gap-1.5">
                      {faucet.name}
                      <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all" />
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                      {faucet.dailyAmount}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">
                    {faucet.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/20 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> Requisitos:
                  </span>
                  <span className={`font-semibold ${faucet.requiresAccount ? 'text-amber-500' : 'text-green-500'}`}>
                    {faucet.requiresAccount ? 'Requiere Registro/Cuenta' : 'Sin Registro Directo'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
