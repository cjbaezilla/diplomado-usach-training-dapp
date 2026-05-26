import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { PageHeader } from '@/components/PageHeader';
import { Footer } from '@/components/Footer';
import { useHydrated } from '@/hooks/useHydrated';
import { Button } from '@/components/ui/button';
import { Trophy, HelpCircle } from 'lucide-react';

const DesafiosPage: NextPage = () => {
  const isHydrated = useHydrated();

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <Head>
        <title>Desafíos Web3</title>
        <meta
          content="Sigue tu progreso académico, completa desafíos reales en la blockchain y desbloquea rangos estudiantiles."
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Navbar />

      <main className="flex-1 w-full p-4 sm:p-8 space-y-8 flex flex-col">
        {/* Encabezado Principal Homologado */}
        <PageHeader
          title="Desafíos y Logros Académicos Web3"
          description="Monitorea tu aprendizaje a través de tareas prácticas y contratos inteligentes interactivos. Cumple cada hito on-chain para avanzar en tu nivel de desarrollador blockchain."
          icon={Trophy}
          breadcrumbItems={[
            { label: 'Desafíos' }
          ]}
          actions={
            <Link href="/aprender">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-border/60 hover:bg-muted/80 text-xs font-semibold"
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                Aprender
              </Button>
            </Link>
          }
        />
      </main>

      <Footer />
    </div>
  );
};

export default DesafiosPage;
