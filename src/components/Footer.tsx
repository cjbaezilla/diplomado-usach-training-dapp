import React from 'react';
import { Globe, Mail, GraduationCap } from 'lucide-react';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-muted/30 py-8 px-4 sm:px-8 mt-auto text-xs text-muted-foreground">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
        {/* Sección izquierda: USACH y propósito */}
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-foreground font-bold">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>Universidad de Santiago de Chile</span>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Plataforma interactiva diseñada para la enseñanza y experimentación práctica de los fundamentos de Web3, contratos inteligentes y DeFi en el Diplomado de Tecnologías Blockchain de la USACH.
          </p>
        </div>

        {/* Sección derecha: Créditos y enlaces */}
        <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
          <div className="text-center md:text-right">
            <span className="text-muted-foreground block">Laboratorio creado por</span>
            <span className="font-bold text-foreground text-sm">Carlos Baeza Negroni</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://cbaeza.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-muted/50"
              title="Sitio Web de Carlos Baeza"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">cbaeza.com</span>
            </a>

            <a
              href="https://www.linkedin.com/in/carlos-baeza-negroni/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-muted/50"
              title="LinkedIn de Carlos Baeza"
            >
              <LinkedinIcon className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">LinkedIn</span>
            </a>

            <a
              href="mailto:hola@cbaeza.com"
              className="flex items-center gap-1 hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-muted/50"
              title="Enviar Correo a Carlos Baeza"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline font-semibold">Contacto</span>
            </a>
          </div>
        </div>
      </div>

      {/* Línea inferior de copyright */}
      <div className="border-t border-border/10 mt-6 pt-4 text-center text-[10px] text-muted-foreground/60 w-full">
        &copy; {new Date().getFullYear()} USACH &bull; Laboratorio de Entrenamiento Web3. Todos los derechos reservados.
      </div>
    </footer>
  );
}
