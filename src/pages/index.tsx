import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  GraduationCap, 
  BookOpen, 
  ArrowRight, 
  Wallet, 
  Activity, 
  User, 
  Trophy, 
  Award, 
  ArrowRightLeft,
  Coins,
  Sparkles,
  AlertCircle,
  Shield,
  Database,
  Eye,
  Code2,
  Cpu,
  TrendingUp,
  Zap,
  Scale,
  LineChart,
  Layers,
  FileText,
  GitPullRequest,
  Users,
  ExternalLink
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { FaucetInfo } from '@/components/FaucetInfo';
import { WalletGuide } from '@/components/WalletGuide';
import { useHydrated } from '@/hooks/useHydrated';
import { StudentSearch } from '@/components/StudentSearch';
import { CreatedTokens } from '@/components/CreatedTokens';
import { RecentIdentities } from '@/components/RecentIdentities';
import { RecentPools } from '@/components/RecentPools';
import { RecentRelics } from '@/components/RecentRelics';
import { RecentChallenges } from '@/components/RecentChallenges';
import { Footer } from '@/components/Footer';
import { useAllStudents, useStudentProfile } from '@/hooks/useStudentIdentity';
import { useAllTokens } from '@/hooks/useTokenFactory';
import { useAllDEXPools } from '@/hooks/useDEXFactory';
import { useChallenges } from '@/hooks/useChallenges';
import { UserAvatar } from '@/components/UserAvatar';
import challengesData from '../../public/desafios.json';
import { useMemo } from 'react';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const Home: NextPage = () => {
  const isHydrated = useHydrated();
  const { isConnected, address } = useAccount();
  const router = useRouter();

  // Hooks para estadísticas globales
  const { count: studentCount } = useAllStudents();
  const { count: tokenCount } = useAllTokens();
  const { poolsCount } = useAllDEXPools();

  // Hooks para progreso de estudiante
  const { profile } = useStudentProfile(address);
  const { isCompleted, activeChallengeIndex } = useChallenges();

  const totalChallenges = challengesData.length;
  const completedCount = useMemo(() => {
    if (!isConnected) return 0;
    let count = 0;
    for (let i = 0; i < totalChallenges; i++) {
      if (isCompleted(i)) count++;
    }
    return count;
  }, [isConnected, isCompleted, totalChallenges]);

  const progressPercent = useMemo(() => {
    return totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0;
  }, [completedCount, totalChallenges]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10 relative overflow-hidden">
      <Head>
        <title>USACH dApp de Entrenamiento</title>
        <meta
          content="Aplicación descentralizada de entrenamiento para el Diplomado de la USACH"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      {/* Luces de fondo ambientales */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* Barra de navegación responsiva */}
      <Navbar />

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col p-6 sm:p-8 md:p-12 space-y-12 w-full">
        {/* Hero de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Columna Izquierda: Información Académica y DeFi */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary transition-all duration-300 hover:border-primary/45">
              <GraduationCap className="h-4 w-4" />
              <span>Diplomado en Tecnologías Blockchain &bull; USACH</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
              Laboratorio de Aprendizaje DeFi y Web3
            </h1>
            
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
              Esta plataforma es un entorno práctico interactivo diseñado para el estudio y experimentación de los protocolos que componen las Finanzas Descentralizadas (DeFi). Interactúa de forma segura con Smart Contracts y pon en práctica tus conocimientos en nuestra blockchain local.
            </p>

            {/* Notificación de red Ethereum Sepolia */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-800 dark:text-amber-200 transition-all duration-300 hover:bg-amber-500/10 hover:border-amber-500/30">
              <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">¡Conexión recomendada para interactuar!</h4>
                <p className="text-xs leading-relaxed text-amber-700/90 dark:text-amber-300/80">
                  Para interactuar con éxito con los contratos inteligentes y registrar tus logros, asegúrate de conectar tu billetera a la red de prueba <strong>Ethereum Sepolia</strong>. Mantener activa esta red te garantizará una experiencia fluida y segura.
                </p>
              </div>
            </div>

            {/* Panel de Métricas Rápidas */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-muted/30 border border-border/30 rounded-xl text-center hover:bg-muted/50 transition-all duration-200">
                <div className="text-2xl font-extrabold text-foreground font-mono">
                  {isHydrated ? studentCount : '...'}
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">Estudiantes</div>
              </div>
              <div className="p-3 bg-muted/30 border border-border/30 rounded-xl text-center hover:bg-muted/50 transition-all duration-200">
                <div className="text-2xl font-extrabold text-foreground font-mono">
                  {isHydrated ? tokenCount : '...'}
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">Tokens ERC20</div>
              </div>
              <div className="p-3 bg-muted/30 border border-border/30 rounded-xl text-center hover:bg-muted/50 transition-all duration-200">
                <div className="text-2xl font-extrabold text-foreground font-mono">
                  {isHydrated ? poolsCount : '...'}
                </div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">Piscinas DEX</div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Widget de Billetera y Accesos Rápidos */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center">
            {isHydrated && (
              <div className="w-full p-6 rounded-2xl border border-border/80 bg-card/65 text-card-foreground shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-cyan-500 to-indigo-500"></div>
                {isConnected ? (
                  <div className="space-y-5 text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                      <div className="flex items-center gap-3">
                        <UserAvatar address={address} className="h-10 w-10 border border-primary/20 shadow-inner shrink-0" />
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-foreground truncate max-w-[160px]">
                            {profile?.isRegistered ? profile.name : 'Estudiante Web3'}
                          </h3>
                          <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[160px] mt-0.5">
                            {address}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        Conectado
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-semibold">Progreso Académico</span>
                        <span className="font-mono font-bold text-primary">{completedCount} / {totalChallenges} Desafíos</span>
                      </div>
                      <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden border border-border/30">
                        <div 
                          className="bg-gradient-to-r from-primary via-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-muted/40 border border-border/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded border border-primary/20 uppercase tracking-wider">
                          {activeChallengeIndex < totalChallenges ? 'Siguiente Desafío' : 'Estatus'}
                        </span>
                        {activeChallengeIndex < totalChallenges && (
                          <span className="text-[9px] text-muted-foreground font-mono font-bold">
                            {challengesData[activeChallengeIndex]?.difficulty}
                          </span>
                        )}
                      </div>
                      
                      {activeChallengeIndex < totalChallenges ? (
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-foreground flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
                            {challengesData[activeChallengeIndex]?.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {challengesData[activeChallengeIndex]?.description.replace(/[#*`$\\]/g, '').substring(0, 120)}...
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-2 space-y-1">
                          <Trophy className="h-7 w-7 text-amber-400 mx-auto animate-bounce" />
                          <h4 className="font-bold text-sm text-foreground">¡Todo Completado!</h4>
                          <p className="text-[11px] text-muted-foreground">
                            Has completado todos los desafíos académicos de este laboratorio DeFi.
                          </p>
                        </div>
                      )}

                      {activeChallengeIndex < totalChallenges ? (
                        <Button 
                          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold transition-all duration-200 shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 text-xs py-2 h-9"
                          onClick={() => router.push('/desafios')}
                        >
                          <span>Continuar Aprendizaje</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-200 flex items-center justify-center gap-1.5 text-xs py-2 h-9"
                          onClick={() => router.push(`/estudiante?address=${address?.toLowerCase()}`)}
                        >
                          <span>Ver mi Galería de Reliquias</span>
                          <Award className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <Button 
                        variant="outline" 
                        className="w-full border-border/80 hover:bg-muted/40 hover:text-foreground text-[11px] h-8 px-2" 
                        onClick={() => router.push('/erc20')}
                      >
                        <Coins className="mr-1 h-3.5 w-3.5 text-primary" />
                        Simulador ERC20
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-border/80 hover:bg-muted/40 hover:text-foreground text-[11px] h-8 px-2" 
                        onClick={() => router.push('/identity')}
                      >
                        <User className="mr-1 h-3.5 w-3.5 text-primary" />
                        Mi Perfil Digital
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center py-2">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="rounded-2xl bg-primary/10 p-3.5 text-primary shadow-inner">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <h3 className="font-extrabold text-lg">Billetera Desconectada</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Para iniciar las prácticas interactivas, ver tu progreso y registrar tu identidad en la blockchain, por favor conecta tu billetera de estudio.
                      </p>
                    </div>

                    <div className="pt-1 flex justify-center">
                      <ConnectButton label="Conectar Billetera de Estudio" />
                    </div>

                    <div className="text-[10px] text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/40">
                      💡 Asegúrate de estar conectado a la red de prueba Sepolia o tu nodo local configurado.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resumen de Actividad: Identidades, Tokens y Pools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full items-stretch pt-8 border-t border-border/30">
          <RecentIdentities />
          <CreatedTokens />
          <RecentPools />
        </div>

        {/* Buscador de Estudiantes, Últimas Reliquias y Desafíos Completados en cuadrícula */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full pt-8 border-t border-border/30 items-stretch">
          <StudentSearch />
          <RecentRelics />
          <RecentChallenges />
        </div>
        {/* Cabecera de Secciones Informativas */}
        <div className="space-y-3 pt-12 border-t border-border/30 text-center w-full">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-primary via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            Cómo Funciona el Ecosistema Web3
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Descubre los módulos prácticos diseñados para familiarizarte con las tecnologías blockchain, protocolos DeFi y desarrollo de Smart Contracts de manera directa.
          </p>
        </div>

        {/* Sección 1: Identidad Onchain (Imagen izquierda, Contenido derecho) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full items-center pt-8 border-t border-border/20">
          <div className="order-1 md:order-1 relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/30 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-cyan-500"></div>
            <img 
              src="/images/identidad_onchain.png" 
              alt="Identidad Onchain" 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="order-2 md:order-2 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <User className="h-3.5 w-3.5" />
              <span>Identidad Soberana</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Tu Identidad Estudiantil Onchain</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Registra tu perfil en la blockchain de manera permanente. Esta identidad digital de estudiante asocia tu dirección criptográfica a tu nombre, permitiendo que todos tus avances académicos, calificaciones y participación en los módulos queden registrados públicamente y de forma inmutable. Es tu pasaporte al ecosistema Web3 de la universidad.
            </p>
            
            {/* Tarjetas de Datos Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-primary/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-primary transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">ID Digital Único</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Vincula tu perfil y nombre a tu dirección de billetera pública.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-primary/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-primary transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Registro Inmutable</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Historial y logros académicos grabados de forma permanente onchain.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-primary/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-primary transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Soberanía Digital</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Control completo de tu información mediante tu firma criptográfica.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-primary/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-primary transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Perfil Público</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Comparte tu portafolio de habilidades de forma transparente.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="outline" 
                className="border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-200" 
                onClick={() => router.push('/identity')}
              >
                <span>Gestionar Mi Perfil</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sección 2: Desafíos Onchain (Imagen derecha, Contenido izquierdo) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full items-center pt-12 border-t border-border/20">
          <div className="order-2 md:order-1 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs font-semibold text-cyan-400">
              <Trophy className="h-3.5 w-3.5" />
              <span>Aprendizaje Práctico</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Resuelve Desafíos de Smart Contracts</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              La teoría se consolida con la práctica. Enfréntate a una serie de desafíos interactivos diseñados para interactuar directamente con Smart Contracts desplegados en la red local. Desde la configuración de tu billetera hasta la interacción con protocolos DeFi complejos, cada desafío aprobado valida tus conocimientos técnicos de forma automática onchain.
            </p>

            {/* Tarjetas de Datos Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-cyan-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="h-4 w-4 text-cyan-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Desafíos Reales</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Interactúa directamente con Smart Contracts desplegados en la red.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-cyan-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="h-4 w-4 text-cyan-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Verificación Onchain</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Tu progreso es verificado y grabado en vivo mediante lógica de contratos.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-cyan-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-cyan-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Ruta Progresiva</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Avanza desde lo básico hasta integraciones DeFi complejas a tu ritmo.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-cyan-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-cyan-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Cero Costos</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Prácticas interactivas en redes de prueba locales sin arriesgar fondos reales.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="outline" 
                className="border-cyan-500/20 hover:bg-cyan-500/5 hover:text-cyan-400 transition-all duration-200" 
                onClick={() => router.push('/desafios')}
              >
                <span>Ver Desafíos Académicos</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-md transition-all duration-300 hover:shadow-lg hover:border-cyan-500/30 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
            <img 
              src="/images/desafios_onchain.png" 
              alt="Desafíos Onchain" 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Sección 3: DEX de la Plataforma (Imagen izquierda, Contenido derecho) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full items-center pt-12 border-t border-border/20">
          <div className="order-1 md:order-1 relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-md transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <img 
              src="/images/dex_plataforma.png" 
              alt="Intercambio Descentralizado (DEX)" 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="order-2 md:order-2 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-400">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Finanzas Descentralizadas</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Intercambio Descentralizado y Liquidez</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Experimenta con la creación de mercados automatizados (AMM). La plataforma incluye un DEX propio donde puedes intercambiar tokens creados por otros estudiantes o por la fábrica, proveer liquidez a piscinas personalizadas (pools) de tokens con par WETH y obtener comisiones por los intercambios. Comprende de forma empírica el deslizamiento de precios (slippage) y la fórmula del producto constante.
            </p>

            {/* Tarjetas de Datos Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-emerald-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Algoritmo AMM</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Comprende el funcionamiento práctico de la fórmula de producto constante (x · y = k).
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-emerald-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Provisión de Pools</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Aporta liquidez a piscinas de intercambio y simula el cobro de comisiones.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-emerald-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <LineChart className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Simulación de Slippage</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Experimenta el impacto del deslizamiento de precios en transacciones grandes.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-emerald-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Fusión con WETH</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Usa Wrapped Ether como el activo base para emparejar y cotizar tus tokens.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="outline" 
                className="border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-400 transition-all duration-200" 
                onClick={() => router.push('/dex')}
              >
                <span>Acceder al DEX</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sección 4: Reliquias (Imagen derecha, Contenido izquierdo) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full items-center pt-12 border-t border-border/20">
          <div className="order-2 md:order-1 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold text-amber-400">
              <Award className="h-3.5 w-3.5" />
              <span>Logros y Medallas</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Portal de Reliquias ERC-1155</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Tus logros se transforman en activos digitales. Al completar los desafíos técnicos onchain, obtendrás el derecho de acuñar &quot;Reliquias Académicas&quot;, las cuales son tokens no fungibles multifracción bajo el estándar ERC-1155. Cada reliquia es una medalla digital verificable en la red que atestigua tus destrezas adquiridas durante el diplomado.
            </p>

            {/* Tarjetas de Datos Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-amber-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Estándar Semifungible</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Aprende a interactuar con colecciones usando el estándar ERC-1155.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-amber-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Medallas de Logro</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Obtén insignias digitales exclusivas al resolver cada desafío académico.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-amber-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Propiedad Onchain</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Tus reliquias se almacenan y custodian directamente en tu dirección.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-amber-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Metadatos Descentralizados</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Descripciones y atributos de tus logros guardados en formato estructurado.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="outline" 
                className="border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-400 transition-all duration-200" 
                onClick={() => router.push('/relics')}
              >
                <span>Explorar Mis Reliquias</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-md transition-all duration-300 hover:shadow-lg hover:border-amber-500/30 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <img 
              src="/images/reliquias_academicas.png" 
              alt="Reliquias Académicas" 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Sección 5: Portal de Aprendizaje (Imagen izquierda, Contenido derecho) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full items-center pt-12 border-t border-border/20">
          <div className="order-1 md:order-1 relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-md transition-all duration-300 hover:shadow-lg hover:border-indigo-500/30 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-primary"></div>
            <img 
              src="/images/aprender_web3.png" 
              alt="Portal de Aprendizaje" 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="order-2 md:order-2 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs font-semibold text-indigo-400">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Portal de Aprendizaje</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Aprende la Teoría del Ecosistema Web3</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              La base de un buen desarrollador comienza con una teoría sólida. Accede a nuestra sección de aprendizaje para explorar documentación complementaria sobre redes de bloques, desarrollo de Smart Contracts, criptografía y firma digital. Diseñado para resolver tus dudas y profundizar tus conocimientos técnicos.
            </p>

            {/* Tarjetas de Datos Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-indigo-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-indigo-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Documentación Completa</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Consulta material didáctico estructurado que cubre desde lo básico hasta temas avanzados.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-indigo-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-indigo-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Firmas Criptográficas</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Domina el uso de firmas ECDSA y la verificación de mensajes firmados onchain.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-indigo-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-indigo-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Estándares Web3</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Explora en profundidad las especificaciones de tokens ERC-20, ERC-721 y ERC-1155.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-indigo-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="h-4 w-4 text-indigo-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Ruta Pedagógica</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Material diseñado para complementar directamente tus prácticas y laboratorios.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="outline" 
                className="border-indigo-500/20 hover:bg-indigo-500/5 hover:text-indigo-400 transition-all duration-200" 
                onClick={() => router.push('/aprender')}
              >
                <span>Explorar Portal de Aprendizaje</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sección 6: Código Open Source (Imagen derecha, Contenido izquierdo) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full items-center pt-12 border-t border-border/20">
          <div className="order-2 md:order-1 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-semibold text-purple-400">
              <GithubIcon className="h-3.5 w-3.5" />
              <span>Código Abierto</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">Proyecto y Contratos Open Source</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Creemos firmemente en el poder del código abierto y la transparencia de la tecnología blockchain. Tanto la interfaz de usuario de esta dApp como la lógica de sus Smart Contracts están disponibles públicamente en GitHub. Explora el código, audita el comportamiento de los contratos, o contribuye a la mejora del repositorio académico.
            </p>

            {/* Tarjetas de Datos Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-purple-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="h-4 w-4 text-purple-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Contratos Públicos</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Revisa la lógica y los métodos expuestos de todos los contratos inteligentes del ecosistema.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-purple-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="h-4 w-4 text-purple-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Front-end Moderno</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Explora la interfaz de usuario desarrollada con Next.js, TypeScript y Tailwind CSS v4.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-purple-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-purple-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Licencia Educativa</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Todo el software está licenciado para libre uso, estudio académico y desarrollo colectivo.
                </p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 dark:border-border/10 bg-card/40 backdrop-blur-[2px] hover:bg-card/65 hover:border-purple-500/30 transition-all duration-300 group/card">
                <div className="flex items-center gap-2 mb-1">
                  <GitPullRequest className="h-4 w-4 text-purple-400 transition-transform duration-300 group-hover/card:scale-110" />
                  <h4 className="font-bold text-xs text-foreground">Colaboración Activa</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Crea forks, abre pull requests y contribuye activamente al crecimiento del proyecto.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a 
                href="https://github.com/cjbaezilla/diplomado-usach-training-dapp-contracts" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 px-4 py-2 text-xs font-semibold text-purple-400 hover:bg-purple-500/10 transition-all duration-200"
              >
                <span>Repositorio Contratos</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a 
                href="https://github.com/cjbaezilla/diplomado-usach-training-dapp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 px-4 py-2 text-xs font-semibold text-purple-400 hover:bg-purple-500/10 transition-all duration-200"
              >
                <span>Repositorio Frontend</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-md transition-all duration-300 hover:shadow-lg hover:border-purple-500/30 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <img 
              src="/images/codigo_open_source.png" 
              alt="Código Abierto" 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Sección 7: Competencia de Liquidez y Ranking (Gran CTA de Ancho Completo) */}
        <div className="w-full pt-12 border-t border-border/30">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-card/85 to-primary/5 p-8 md:p-12 text-center space-y-8 shadow-2xl backdrop-blur-md">
            {/* Luces decorativas en las esquinas */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-bold text-amber-400 uppercase tracking-widest">
                <Trophy className="h-4 w-4" />
                <span>Competencia Activa de Estudiantes</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-primary to-cyan-400 bg-clip-text text-transparent">
                Compite en el Ranking de Liquidez DEX
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                ¡Lleva tus destrezas DeFi al límite! Crea y gestiona tu propio pool de liquidez con el par de tokens que elijas frente a <strong>WETH</strong>. Compite directamente con otros estudiantes de la USACH para lograr posicionarse en la cima del podio acumulando la mayor cantidad de liquidez bloqueada (TVL) en tu pool. El mercado es dinámico, ¿tienes lo necesario para dominar el DEX?
              </p>
            </div>

            {/* Imagen del Ranking Centrada y Premium */}
            <div className="max-w-xl mx-auto relative overflow-hidden rounded-2xl border border-border/80 bg-muted/40 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-amber-500/40 group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-cyan-500"></div>
              <img 
                src="/images/ranking_competencia.png" 
                alt="Ranking de Liquidez Web3" 
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-102"
              />
            </div>

            <div className="pt-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 via-primary to-cyan-500 hover:opacity-90 hover:scale-[1.03] text-white font-extrabold px-8 py-6 rounded-xl text-base tracking-wider uppercase transition-all duration-200 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mx-auto"
                onClick={() => router.push('/ranking')}
              >
                <Trophy className="h-5 w-5 animate-bounce" />
                <span>Ver Tabla de Clasificación</span>
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Secciones informativas lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start pt-12 border-t border-border/30">
          <WalletGuide />
          <FaucetInfo />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;

