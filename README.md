# USACH - dApp de Entrenamiento Web3

Este repositorio contiene la **Aplicación Descentralizada (dApp) de Entrenamiento** oficial para el **Diplomado en Tecnologías Blockchain** de la **Universidad de Santiago de Chile (USACH)**. 

La plataforma proporciona una base interactiva para que estudiantes y desarrolladores exploren el desarrollo de interfaces Web3, integren billeteras EVM compatibles, interactúen con redes de prueba y simulen la creación y transferencia de tokens estándar ERC-20.

---

## 🚀 Características Clave

*   **Conexión de Billeteras Multired**: Integración fluida con [RainbowKit v2](https://rainbowkit.com) y [Wagmi v2](https://wagmi.sh) para conectar billeteras como MetaMask, Coinbase Wallet, Rainbow, y WalletConnect en múltiples redes (incluyendo soporte condicional para Sepolia Testnet).
*   **Indicador de Precio de ETH en Tiempo Real**: Componente y hook reutilizable conectado a la API de Binance (`ETHUSDT`) con actualización automática cada 15 segundos y detección visual de tendencias de precio (subida/bajada).
*   **Simulador de Portal ERC-20**:
    *   **Despliegue Ficticio**: Define el nombre, símbolo y suministro de tu propio token y despliégalo localmente.
    *   **Transferencias de Saldo**: Realiza transferencias simuladas e instantáneas de tokens a cualquier dirección hexadecimal sin costos de gas.
    *   **Historial de Transacciones**: Consulta los logs y hashes de transacciones simuladas en tiempo real.
*   **Diseño Moderno y Responsivo**: Desarrollado bajo un enfoque *mobile-first* con una estética oscura premium, utilizando **Tailwind CSS v4** y componentes altamente customizables de **shadcn/ui**.
*   **Localización**: Completamente configurado para soportar el idioma español en la interfaz y en RainbowKit.

---

## 🛠️ Stack Tecnológico

El proyecto está construido sobre un stack de última generación optimizado para dApps:

| Tecnología / Librería | Versión | Rol / Descripción |
| :--- | :--- | :--- |
| **Next.js** | `^16.2.4` | Framework web React principal (utilizando Pages Router) |
| **React** & **React DOM** | `^19.2.5` | Biblioteca principal de interfaz de usuario |
| **TypeScript** | `5.9.3` | Lenguaje de tipado estático y robusto |
| **Tailwind CSS** | `^4.3.0` | Framework de diseño basado en CSS y variables nativas |
| **shadcn/ui** | `^4.8.0` | Primitivas de componentes accesibles y elegantes |
| **Wagmi** | `^2.19.3` | Hooks de React optimizados para Ethereum / EVM |
| **RainbowKit** | `^2.2.11` | Interfaz y modal premium para la conexión de billeteras |
| **Viem** | `2.38.0` | Cliente ligero de comunicación y tipados para Ethereum |
| **TanStack React Query** | `^5.55.3` | Motor de consultas y gestión de estados asíncronos de Wagmi |

---

## 📂 Estructura de Directorios

La organización del proyecto se detalla a continuación:

```
├── .env                      # Variables de entorno locales con direcciones de contratos
├── .env.example              # Plantilla para la configuración de variables de entorno
├── .eslintrc.json            # Reglas de ESLint
├── .gitignore                # Exclusiones de control de versiones
├── AGENTS.md                 # Guía y reglas del sistema para agentes de desarrollo IA
├── README.md                 # Documentación principal del repositorio (este archivo)
├── components.json           # Configuración del CLI de shadcn/ui
├── next-env.d.ts             # Tipos de Next.js
├── next.config.js            # Configuración general de Next.js
├── postcss.config.js         # Configuración de PostCSS para Tailwind CSS v4
├── package.json              # Scripts y dependencias del proyecto
├── tsconfig.json             # Configuración de alias de rutas de TypeScript (@/*)
└── src/
    ├── components/           # Componentes comunes e interfaces
    │   ├── EthPriceTicker.tsx # Indicador visual del precio de ETH en tiempo real (Binance API)
    │   ├── Navbar.tsx        # Barra de navegación responsiva con logo de la USACH
    │   └── ui/               # Componentes atómicos de shadcn/ui (Button, Card, Input, Label)
    ├── contracts/            # Configuración e integración de contratos inteligentes
    │   ├── abis/             # ABIs de contratos extraídos como constantes 'as const'
    │   │   ├── baseERC20.ts
    │   │   ├── baseERC1155.ts
    │   │   ├── studentIdentity.ts
    │   │   └── tokenFactory.ts
    │   └── index.ts          # Configuración y exportación unificada de contratos y direcciones
    ├── hooks/                # Hooks de React personalizados y utilidades de Web3
    │   ├── useBaseERC20.ts       # Hooks unificados para tokens ERC20
    │   ├── useBaseERC1155.ts     # Hooks unificados para tokens semi-fungibles ERC1155
    │   ├── useEthPrice.ts        # Hook para obtener el precio de ETH/USDT desde la API de Binance
    │   ├── useHydrated.ts        # Hook de utilidad para mitigar errores de hidratación en SSR
    │   ├── useStudentIdentity.ts # Hooks unificados para el contrato StudentIdentity.sol
    │   └── useTokenFactory.ts    # Hooks unificados para el contrato TokenFactory.sol
    ├── lib/
    │   └── utils.ts          # Utilidad para combinar clases de Tailwind (cn)
    ├── pages/                # Enrutador basado en páginas (Pages Router)
    │   ├── _app.tsx          # Punto de entrada de la aplicación y Providers (Wagmi, RainbowKit)
    │   ├── index.tsx         # Página de inicio del portal de entrenamiento
    │   └── erc20.tsx         # Simulador interactivo de despliegue y transferencia de tokens ERC20
    ├── styles/               # Archivos CSS y variables globales del tema
    │   ├── globals.css       # Configuración del tema Tailwind v4 y variables OKLCH
    │   └── Home.module.css   # Estilos CSS específicos de la página de inicio
    └── wagmi.ts              # Configuración y definición de cadenas para Wagmi y RainbowKit
```

---

## 💻 Desarrollo Local

Sigue los siguientes pasos para configurar y ejecutar el proyecto localmente:

### 1. Requisitos Previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada) y un gestor de paquetes como npm.

### 2. Clonar e Instalar Dependencias

```bash
# Instalar los paquetes definidos
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo de configuración local `.env` a partir de la plantilla provista para configurar las direcciones de los contratos:

```bash
cp .env.example .env
```

Ajusta los valores del archivo `.env` según tu red de desarrollo o despliegue. Por defecto, incluye las direcciones pre-configuradas para la red local (localhost) de Hardhat.

### 3. Iniciar el Servidor de Desarrollo

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`. Ábrelo en tu navegador para ver la dApp de entrenamiento en funcionamiento.

> [!IMPORTANT]
> **Bandera `--webpack`**: Observarás que el comando `dev` ejecuta `next dev --webpack`. Esto es obligatorio e intencional para asegurar la correcta compatibilidad de módulos internos utilizados por las dependencias de Web3 (como Wagmi y Viem) y evitar problemas de resolución durante la compilación.

### 4. Compilar para Producción

Para compilar el proyecto y prepararlo para producción:

```bash
npm run build
```

Este comando compila el código TypeScript, valida la sintaxis y ejecuta el linting antes de exportar el bundle final. Una vez compilado, puedes iniciarlo con:

```bash
npm run start
```

---

## 💡 Buenas Prácticas del Repositorio

Si deseas colaborar o expandir este proyecto, por favor ten en cuenta las siguientes directrices:

1.  **Evitar Fallos de Hidratación (Hydration Mismatch)**:
    Dado que Next.js utiliza Server-Side Rendering (SSR) y Wagmi interactúa con el estado de la billetera del cliente, las diferencias en el HTML generado pueden causar fallos en la hidratación de React. 
    - Utiliza siempre el hook `useHydrated()` de `@/hooks/useHydrated` antes de renderizar elementos que dependan del estado de la billetera o variables del cliente:
      ```typescript
      import { useHydrated } from '@/hooks/useHydrated';

      const isHydrated = useHydrated();
      if (!isHydrated) return <LoadingSkeleton />; // o null/Skeleton
      ```
    - Utiliza los hooks reutilizables unificados (`useStudentIdentity`, `useTokenFactory`, `useBaseERC20` y `useBaseERC1155` de `@/hooks/`) para interactuar con la blockchain de forma limpia y tipada, en lugar de invocar `useReadContract` o `useWriteContract` de manera directa.
2.  **Uso de Variables de Tema (Tailwind CSS v4)**:
    No utilices archivos `tailwind.config.js`. Todo el tema y las propiedades personalizadas de CSS (como el color primario de la USACH, etc.) están configuradas bajo el bloque `@theme inline` en `src/styles/globals.css` utilizando espacios de color `oklch`.
3.  **Definiciones 'as const' para ABIs**:
    Todos los ABIs deben definirse en TypeScript con el modificador `as const` en la carpeta `src/contracts/abis/` para posibilitar el tipado estricto e inferencia de tipos automáticos de Wagmi y Viem.
4.  **Desarrollo Asistido por Inteligencia Artificial**:
    Si utilizas agentes de IA de codificación para programar, consulta las pautas obligatorias establecidas en [AGENTS.md](file:///home/carlos/DEV/diplomado-usach-training-dapp/AGENTS.md). En especial, se recuerda que toda comunicación, código y comentarios deben estar estrictamente en **español**.
