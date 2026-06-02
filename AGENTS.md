# Guía para Agentes de Desarrollo de IA (`AGENTS.md`)

¡Bienvenido, Agente de IA! Este documento sirve como una guía completa del sistema, descripción general de la arquitectura y reglas de participación para el desarrollo dentro de este repositorio. Lee este archivo detenidamente antes de proponer cualquier cambio o ejecutar comandos.

---

## REGLA FUNDAMENTAL MANDATORIA
- **Idioma Oficial del Agente**: Toda comunicación con el usuario y escritura/modificación de archivos (código, comentarios, documentación, etc.) debe realizarse estrictamente en **español**. Esta es una regla fundamental y mandatoria.

---

## 1. Descripción General del Proyecto y Contexto

- **Nombre del Repositorio**: `diplomado-usach-training-dapp`
- **Propósito**: Una Aplicación Descentralizada (dApp) de entrenamiento desarrollada como parte del programa de Postgrado/Diplomado de la USACH (Universidad de Santiago de Chile). Proporciona una base para que los estudiantes y desarrolladores construyan aplicaciones Web3, interactúen con blockchains compatibles con EVM y construyan interfaces usando herramientas de frontend modernas.
- **Arquitecturas Clave**:
  - Integraciones Web3 mediante **Wagmi** y **RainbowKit**.
  - Frontend estilizado con **Tailwind CSS v4** y **shadcn/ui**.
  - El framework principal es **Next.js** utilizando el **Pages Router**.

---

## 2. Stack Tecnológico y Dependencias Clave

Por favor, respeta estas versiones específicas de librerías e integraciones. No actualices ni rebajes estas versiones principales a menos que el usuario lo solicite explícitamente.

| Tecnología / Librería | Versión | Rol / Descripción |
| :--- | :--- | :--- |
| **Next.js** | `^16.2.4` | Framework principal de React (usando Pages Router) |
| **React** & **React DOM** | `^19.2.5` | Entorno de ejecución de UI (Nota: se aplican reglas de compatibilidad de React 19) |
| **TypeScript** | `5.9.3` | Lenguaje de programación / tipado estático |
| **Tailwind CSS** | `^4.3.0` | Framework de CSS enfocado en utilidades (configurado con PostCSS) |
| **shadcn/ui** | `^4.8.0` | Primitivas de componentes accesibles y personalizables (Radix) |
| **Wagmi** | `^2.19.3` | Hooks de React para interacciones con Ethereum / EVM |
| **RainbowKit** | `^2.2.11` | Librería de UI para conexión de billeteras |
| **Viem** | `2.38.0` | Interfaz ligera de TypeScript para Ethereum |
| **TanStack React Query** | `^5.55.3` | Motor de consultas y gestión de estado asíncrono (usado por Wagmi) |

---

## 3. Mapa de Estructura de Directorios

A continuación se muestra el mapa de directorios actual de la aplicación. Familiarízate con la distribución antes de proponer cambios o crear archivos.

```
├── .env                      # Variables de entorno locales (direcciones de contratos)
├── .env.example              # Plantilla de configuración de variables de entorno
├── .eslintrc.json            # Reglas de ESLint (Next.js core-web-vitals)
├── .gitignore                # Exclusiones de Git
├── AGENTS.md                 # Guía y reglas del sistema para agentes de desarrollo IA (este archivo)
├── README.md                 # Documentación principal de la dApp
├── components.json           # Configuración del CLI de shadcn/ui
├── next-env.d.ts             # Declaraciones de TypeScript para Next.js
├── next.config.js            # Archivo de configuración de Next.js
├── postcss.config.js         # Plugins de PostCSS (carga @tailwindcss/postcss)
├── package.json              # Definiciones de scripts y lista de dependencias
├── tsconfig.json             # Configuración del compilador de TypeScript (alias de rutas)
└── src/
    ├── components/
    │   ├── CreatedTokens.tsx     # Panel de tokens creados desde la fábrica
    │   ├── EthPriceTicker.tsx    # Componente para mostrar precio de ETH en tiempo real (Binance API)
    │   ├── FaucetInfo.tsx        # Panel con información y grifo de tokens de prueba
    │   ├── Footer.tsx            # Pie de página académico unificado con créditos profesionales
    │   ├── Navbar.tsx            # Barra de navegación con soporte responsive e integración de RainbowKit
    │   ├── PageHeader.tsx        # Cabecera académica común con breadcrumbs y acciones contextuales
    │   ├── RecentIdentities.tsx  # Actividad reciente: últimas identidades de estudiantes registradas
    │   ├── RecentPools.tsx       # Actividad reciente: últimos pools de liquidez del DEX creados
    │   ├── StudentSearch.tsx     # Buscador de perfiles de estudiantes por dirección o nombre
    │   ├── TokenIcon.tsx         # Icono representativo para los tokens de la plataforma
    │   ├── UserAvatar.tsx        # Avatar visual identificatorio para estudiantes
    │   ├── WalletGuide.tsx       # Guía instructiva para conectar y configurar billeteras Web3
    │   └── ui/                   # Primitivas reutilizables de shadcn/ui
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dialog.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── progress.tsx
    │       └── tabs.tsx
    ├── contracts/
    │   ├── abis/                 # ABIs de contratos inteligentes como constantes 'as const'
    │   │   ├── baseERC1155.ts
    │   │   ├── baseERC20.ts
    │   │   ├── dexFactory.ts
    │   │   ├── dexPool.ts
    │   │   ├── studentIdentity.ts
    │   │   ├── tokenFactory.ts
    │   │   └── weth.ts
    │   └── index.ts              # Configuración y exportación centralizada de contratos y direcciones
    ├── hooks/
    │   ├── useBaseERC1155.ts     # Hooks para interactuar con tokens ERC1155 (Reliquias)
    │   ├── useBaseERC20.ts       # Hooks para interactuar con tokens ERC20 estándar
    │   ├── useDEXFactory.ts      # Hooks para interactuar con la fábrica del DEX (creación y listado de pools)
    │   ├── useDEXPool.ts         # Hooks para interactuar con piscinas individuales del DEX (swap, liquidez)
    │   ├── useEthPrice.ts        # Hook para obtener el precio de ETH/USDT desde la API de Binance
    │   ├── useHydrated.ts        # Hook para mitigar problemas de hidratación en SSR
    │   ├── useStudentIdentity.ts # Hooks de lectura y escritura para StudentIdentity.sol
    │   ├── useTokenFactory.ts    # Hooks de lectura y escritura para TokenFactory.sol
    │   └── useWETH.ts            # Hooks para interactuar con WETH (depósitos, retiros)
    ├── lib/
    │   └── utils.ts              # Utilidad cn para fusión limpia de Tailwind classes
    ├── pages/
    │   ├── _app.tsx              # Envoltura de Providers (Wagmi, RainbowKit, React Query) e importaciones globales
    │   ├── index.tsx             # Página principal / panel de inicio
    │   ├── aprender.tsx          # Portal de aprendizaje con menú interactivo tipo árbol de categorías
    │   ├── dex.tsx               # Intercambio Descentralizado (DEX): swap de tokens y provisión de liquidez
    │   ├── erc20.tsx             # Simulador y fábrica de tokens ERC-20
    │   ├── identity.tsx          # Gestión y registro del Perfil Estudiantil
    │   ├── relics.tsx            # Portal de Reliquias ERC-1155
    │   └── estudiante/
    │       └── [address].tsx     # Perfil público de estudiante (balances, pools, reliquias)
    ├── styles/
    │   ├── globals.css           # Estilos globales, Tailwind v4 y variables OKLCH del tema
    │   └── Home.module.css       # Estilos específicos opcionales para la página de inicio
    └── wagmi.ts                  # Configuración de Wagmi y RainbowKit (hardhat, localhost)
```


---

## 4. Convenciones de Estilo de Código y Arquitectura

### Z. Compromisos
- Los mensajes de commit deben estar en español con UTF-8. Sé descriptivo. Usa el formato estándar con líneas de asunto y cuerpo.
- Todos los mensajes de commit DEBEN usar la sintaxis de Git para que todos los caracteres UTF-8 se manejen correctamente. Nunca uses secuencias de escape. Las comillas dobles son obligatorias.
- Ejemplo: `git commit -m "feat: implementar ..." -m "Descripción detallada..."`

### A. Patrón de Enrutamiento de Next.js
- **Solo Pages Router**: Este proyecto utiliza el Pages Router ubicado en `src/pages`. **No** crees una carpeta `app/` ni intentes usar características del App Router (como Server Components) a menos que se te indique explícitamente.
- Todo el enrutamiento a nivel de página se maneja en `src/pages/`. Los elementos de diseño (layouts) reutilizables y los subcomponentes deben colocarse dentro de `src/components/`.

### B. Reglas de Estilo de Tailwind CSS v4
- **Sin `tailwind.config.js` para Clases de Utilidad**: Tailwind CSS v4 depende de PostCSS (`@tailwindcss/postcss`) y utiliza configuraciones basadas en CSS. Todos los temas personalizados, animaciones, utilidades y colores se definen directamente dentro de `src/styles/globals.css` usando el bloque `@theme inline`.
- **Variables**: Las variables del tema personalizado se declaran como propiedades personalizadas de CSS en los bloques `:root` y `.dark` en `src/styles/globals.css` (usando espacios de color OKLCH).
- **Fusión de Clases (Class Merging)**: Al escribir componentes, siempre usa el ayudante `cn` importado desde `@/lib/utils` para fusionar clases de Tailwind limpiamente:
  ```typescript
  import { cn } from "@/lib/utils";

  export function CustomComponent({ className, ...props }) {
    return <div className={cn("bg-background text-foreground px-4 py-2", className)} {...props} />;
  }
  ```

### C. Pautas para Componentes de Interfaz de Usuario (UI)
- **shadcn/ui**: Los componentes se gestionan usando shadcn. Residen en `src/components/ui/` (por ejemplo, `button.tsx`).
- Antes de agregar nuevos componentes de shadcn/ui, verifica la configuración en `components.json`.
- Prefiere usar primitivas estándar de shadcn/ui siempre que sea posible en lugar de escribir elementos personalizados desde cero.

### D. Configuración de TypeScript y Alias de Rutas
- Usa los alias de ruta configurados en `tsconfig.json`:
  - `@/*` apunta a `./src/*`
  - `@/components/*` apunta a `./src/components/*`
  - `@/lib/*` apunta a `./src/lib/*`
  - `@/styles/*` apunta a `./src/styles/*`
- Evita estrictamente el uso de importaciones con rutas relativas como `../../components/ui/button` cuando los alias de ruta estén disponibles.

### E. Interacciones con Web3 y Contratos Inteligentes
- **Configuración**: La configuración de wagmi se encuentra en `src/wagmi.ts`.
- **SSR (Server-Side Rendering)**: Wagmi está configurado con `ssr: true` dentro de `src/wagmi.ts`.
  - > [!IMPORTANT]
    > **Mitigación de Incompatibilidad de Hidratación (Hydration Mismatch)**: Dado que la aplicación utiliza SSR, llamar a los hooks de Wagmi directamente durante el renderizado de React puede provocar fallos de hidratación entre el HTML generado por el servidor y el estado de Web3 del cliente.
  - **Mejor Práctica (Filtro de Hidratación)**: Utiliza siempre el hook `useHydrated()` importado desde `@/hooks/useHydrated` para prevenir fallos de hidratación. Este hook asegura que los componentes que interactúan con la blockchain o con el estado de la billetera sólo realicen consultas una vez que se hayan montado en el cliente:
    ```typescript
    import { useAccount } from "wagmi";
    import { useHydrated } from "@/hooks/useHydrated";

    export function WalletInfo() {
      const isHydrated = useHydrated();
      const { address } = useAccount();

      if (!isHydrated) return <div>Cargando...</div>; // O esqueleto/skeleton fallback

      return <div>Connected to {address}</div>;
    }
    ```
- **Integración y Configuración de Contratos**:
  - Las direcciones de los contratos se configuran en el archivo `.env` mediante variables con el prefijo `NEXT_PUBLIC_` (ej. `NEXT_PUBLIC_STUDENT_IDENTITY_ADDRESS`).
  - Todas las referencias a los contratos (dirección y ABI) están centralizadas en `@/contracts/index.ts`. No codifiques de manera rígida (hardcode) las direcciones ni los ABIs en los componentes.
- **Definiciones 'as const' de ABIs**:
  - Los ABIs se exportan en `@/contracts/abis/` usando el modificador de TypeScript `as const`. Esto permite que Wagmi y Viem infieran de manera exacta los tipos de los argumentos y retornos de las funciones, proporcionando autocompletado nativo y previniendo errores de desarrollo.
- **Hooks Reutilizables**:
  - Prefiere siempre utilizar los hooks de alto nivel predefinidos en la dApp para realizar consultas y mutaciones (escrituras) en lugar de instanciar `useReadContract` or `useWriteContract` directamente:
    - Para `StudentIdentity.sol`: Usa `useStudentProfile`, `useAllStudents` y `useStudentIdentityActions` desde `@/hooks/useStudentIdentity`.
    - Para `TokenFactory.sol`: Usa `useAllTokens`, `useTokensByOwner` y `useTokenFactoryActions` desde `@/hooks/useTokenFactory`.
    - Para `BaseERC20.sol`: Usa `useBaseERC20` (metadatos y acciones de transferencia, aprobación, acuñación y quema) y `useERC20Balance` (lectura de balances) desde `@/hooks/useBaseERC20`.
    - Para `BaseERC1155.sol`: Usa `useBaseERC1155` (acciones de transferencia, aprobación, acuñación y quema), `useERC1155Balance` (lectura de balances de tokens específicos) y `useERC1155Uri` (lectura de URIs de metadatos) desde `@/hooks/useBaseERC1155`.
    - Para `DEXFactory.sol` y `DEXPool.sol`: Usa `useAllDEXPools` y `useDEXFactoryActions` desde `@/hooks/useDEXFactory` para gestión de piscinas, y `useDEXPool` (swap, agregar/remover liquidez, balances y estimaciones) desde `@/hooks/useDEXPool`.
    - Para `WETH.sol`: Usa `useWETH` (acciones de depósito, retiro y aprobación de WETH) desde `@/hooks/useWETH`.
- **Cadenas Soportadas**: Redes locales de desarrollo (`Hardhat` y `Localhost`) configuradas directamente en `src/wagmi.ts`.
- **Red Local (Hardhat / Localhost)**: Soporte principal habilitado para facilitar el desarrollo, pruebas y despliegue rápido.

### F. Restricción de Ancho Máximo (max-w) en Diseños (Layouts)
- **Diseño Completamente Fluido**: Está estrictamente prohibido utilizar clases de limitación de ancho máximo (como `max-w-` de Tailwind CSS o la propiedad `max-width` de CSS) en los contenedores principales, secciones de contenido general o layouts de página.
- **Propósito**: Asegurar que la interfaz fluya y ocupe de manera adaptativa todo el ancho de la pantalla disponible.
- **Excepciones**:
  - Las reglas responsivas basadas en media queries (`max-width` en reglas `@media`) están permitidas para definir puntos de quiebre y adaptabilidad responsiva.
  - Componentes muy específicos como diálogos (modales) o tooltips que por su propia naturaleza requieran un tamaño máximo definido para legibilidad.

---

## 5. Flujo de Trabajo de Desarrollo y Verificación

Siempre verifica que tus cambios compilen y se construyan correctamente antes de finalizar las tareas.

### Referencia de Comandos

| Acción | Comando | Propósito |
| :--- | :--- | :--- |
| **Iniciar Servidor de Desarrollo** | `npm run dev` | Ejecuta Next.js en modo de desarrollo (adjunta la bandera `--webpack`) |
| **Construir Proyecto** | `npm run build` | Compila y construye el paquete de producción |
| **Iniciar Producción** | `npm run start` | Ejecuta el servidor de producción compilado |

- **Bandera de Compilación Webpack**: Los comandos de desarrollo y construcción de Next.js en `package.json` llevan adjunta la bandera `--webpack`. Asegúrate de mantener esta bandera intacta al ejecutar scripts, ya que resuelve problemas específicos de resolución de módulos con wagmi y viem.

---

## 6. Reglas de Protección y Restricciones Críticas

- > [!WARNING]
  > **Compatibilidad con React 19**: Al agregar paquetes npm de terceros, asegúrate de que sean compatibles con React 19. Ten cuidado con los conflictos de dependencias de pares (peer dependencies) y resuélvelos de forma segura.
- > [!IMPORTANT]
  > **Variable de Entorno para el Project ID**: La configuración del proyecto en `src/wagmi.ts` contiene `projectId: 'YOUR_PROJECT_ID'`. No reemplaces esto con credenciales explícitas ni escribas claves API privadas directamente en esta configuración. Si se requiere un Project ID personalizado para pruebas, indica al usuario que lo configure mediante variables de entorno o proporcione una entrada segura.
- **No omitas el compilador de TypeScript o ESLint**: Asegúrate siempre de que el código esté libre de errores de compilación y cumpla con las reglas de linting (`next lint` se ejecuta implícitamente durante `next build`).
