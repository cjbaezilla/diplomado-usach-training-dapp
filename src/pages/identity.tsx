import { trackChallengeCompletion } from '@/hooks/useChallenges';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SEO } from '@/components/SEO';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { PageHeader } from '@/components/PageHeader';
import { cn, formatSocialLink, getSocialDisplayLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Wallet,
  Info,
  ExternalLink,
  UserPlus,
  UserCheck,
  Copy,
  Check,
  Code,
  BookOpen,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useStudentProfile, useAllStudents, useStudentIdentityActions } from '@/hooks/useStudentIdentity';
import { useHydrated } from '@/hooks/useHydrated';
import { UserAvatar } from '@/components/UserAvatar';
import { StudentSearch } from '@/components/StudentSearch';
import { Footer } from '@/components/Footer';

// StudentCard se movió al componente StudentSearch reutilizable

const solidityCode = `/*
888     888  .d8888b.        d8888  .d8888b.  888    888 
888     888 d88P  Y88b      d88888 d88P  Y88b 888    888 
888     888 Y88b.          d88P888 888    888 888    888 
888     888  "Y888b.      d88P 888 888        8888888888 
888     888     "Y88b.   d88P  888 888        888    888 
888     888       "888  d88P   888 888    888 888    888 
Y88b. .d88P Y88b  d88P d8888888888 Y88b  d88P 888    888 
 "Y88888P"   "Y8888P" d88P     888  "Y8888P"  888    888 
*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

/**
 * @title StudentIdentity
 * @dev Contrato para almacenar la identidad on-chain de los estudiantes del Diplomado USACH.
 * Permite a cualquier dirección registrar y actualizar sus datos de contacto y redes sociales.
 */
contract StudentIdentity {
    
    // Estructura que define el perfil de identidad de un estudiante
    struct Profile {
        string name;
        string email;
        string linkedin;
        string twitter;
        string avatar;
        uint256 updatedAt;
        bool isRegistered;
    }

    // Mapeo de dirección de wallet a perfil del estudiante
    mapping(address => Profile) private _profiles;

    // Arreglo de todas las direcciones de estudiantes registrados
    address[] private _registeredStudents;

    // Mapeo para verificar rápidamente la posición/existencia del estudiante en el array
    mapping(address => uint256) private _studentIndex; // 1-based index (0 significa no registrado en el array general)

    // Evento emitido cuando un perfil es registrado por primera vez
    event ProfileRegistered(
        address indexed studentAddress,
        string name,
        string email
    );

    // Evento emitido cuando un perfil existente es actualizado
    event ProfileUpdated(
        address indexed studentAddress,
        string name,
        string email,
        string linkedin,
        string twitter,
        string avatar,
        uint256 updatedAt
    );

    // Error personalizado para cuando se intenta registrar un nombre vacío
    error NameRequired();

    /**
     * @dev Permite a un estudiante registrar o actualizar su identidad on-chain.
     * @param name Nombre completo del estudiante. No puede estar vacío.
     * @param email Correo electrónico de contacto.
     * @param linkedin Enlace o nombre de usuario del perfil de LinkedIn.
     * @param twitter Enlace o nombre de usuario del perfil de Twitter.
     * @param avatar Enlace (URL) o hash IPFS de la imagen de avatar.
     */
    function setProfile(
        string calldata name,
        string calldata email,
        string calldata linkedin,
        string calldata twitter,
        string calldata avatar
    ) external {
        if (bytes(name).length == 0) {
            revert NameRequired();
        }

        Profile storage profile = _profiles[msg.sender];
        bool previouslyRegistered = profile.isRegistered;

        profile.name = name;
        profile.email = email;
        profile.linkedin = linkedin;
        profile.twitter = twitter;
        profile.avatar = avatar;
        profile.updatedAt = block.timestamp;

        if (!previouslyRegistered) {
            profile.isRegistered = true;
            _registeredStudents.push(msg.sender);
            _studentIndex[msg.sender] = _registeredStudents.length;
            emit ProfileRegistered(msg.sender, name, email);
        }

        emit ProfileUpdated(
            msg.sender,
            name,
            email,
            linkedin,
            twitter,
            avatar,
            block.timestamp
        );
    }

    /**
     * @dev Obtiene el perfil completo de un estudiante a partir de su dirección.
     * @param studentAddress Dirección Ethereum del estudiante.
     * @return name Nombre completo del estudiante.
     * @return email Correo electrónico.
     * @return linkedin Enlace a LinkedIn.
     * @return twitter Enlace a Twitter.
     * @return avatar Enlace al avatar.
     * @return updatedAt Timestamp de la última actualización.
     * @return isRegistered Indica si el estudiante está registrado.
     */
    function getProfile(address studentAddress)
        external
        view
        returns (
            string memory name,
            string memory email,
            string memory linkedin,
            string memory twitter,
            string memory avatar,
            uint256 updatedAt,
            bool isRegistered
        )
    {
        Profile memory profile = _profiles[studentAddress];
        return (
            profile.name,
            profile.email,
            profile.linkedin,
            profile.twitter,
            profile.avatar,
            profile.updatedAt,
            profile.isRegistered
        );
    }

    /**
     * @dev Retorna todas las direcciones de los estudiantes registrados.
     * @return Array de direcciones Ethereum.
     */
    function getAllRegisteredStudents() external view returns (address[] memory) {
        return _registeredStudents;
    }

    /**
     * @dev Retorna la cantidad total de estudiantes registrados.
     * @return Cantidad de registros.
     */
    function getStudentsCount() external view returns (uint256) {
        return _registeredStudents.length;
    }
}`;

const IdentityPage: NextPage = () => {
  const router = useRouter();
  const isHydrated = useHydrated();
  const { isConnected, address, chain } = useAccount();
  const explorerUrl = chain?.blockExplorers?.default?.url || 'https://sepolia.etherscan.io';

  // Hooks para consultar el perfil del usuario conectado
  const {
    profile: myProfile,
    isLoading: isLoadingMyProfile,
    refetch: refetchMyProfile,
  } = useStudentProfile(address);

  // Hooks para realizar acciones de escritura
  const {
    setProfile,
    hash: actionTxHash,
    error: actionError,
    isPending: isActionPending,
    isSuccess: isActionSuccess,
  } = useStudentIdentityActions();

  // Hooks para el directorio global (solo para refrescar la lista)
  const {
    refetch: refetchDirectory,
  } = useAllStudents();

  // Estados de formularios
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [twitterInput, setTwitterInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');

  // Estados de retroalimentación
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    txHash?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Pre-rellenar formulario cuando se carga el perfil del usuario conectado
  useEffect(() => {
    if (myProfile) {
      setNameInput(myProfile.name || '');
      setEmailInput(myProfile.email || '');
      setLinkedinInput(myProfile.linkedin || '');
      setTwitterInput(myProfile.twitter || '');
      setAvatarInput(myProfile.avatar || '');
    }
  }, [
    myProfile?.name,
    myProfile?.email,
    myProfile?.linkedin,
    myProfile?.twitter,
    myProfile?.avatar,
    address
  ]);

  // Autodescartar notificaciones
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Escuchar éxito de la transacción de escritura
  useEffect(() => {
    if (isActionSuccess && actionTxHash) {
      setNotification({
        type: 'success',
        message: '¡Perfil actualizado en la blockchain exitosamente!',
        txHash: actionTxHash,
      });
      // Registrar el logro del desafío 2 en localStorage
      trackChallengeCompletion(2);
      refetchMyProfile();
      refetchDirectory();
    }
  }, [isActionSuccess, actionTxHash]);

  // Escuchar errores de la transacción de escritura
  useEffect(() => {
    if (actionError) {
      setNotification({
        type: 'error',
        message: `Error al guardar perfil: ${actionError.message || 'Error desconocido'}`,
      });
    }
  }, [actionError]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setNotification({
        type: 'error',
        message: 'Por favor, conecta tu billetera primero.',
      });
      return;
    }
    if (!nameInput.trim()) {
      setNotification({
        type: 'error',
        message: 'El nombre es obligatorio para registrar tu perfil.',
      });
      return;
    }
    setProfile(
      nameInput.trim(),
      emailInput.trim(),
      linkedinInput.trim(),
      twitterInput.trim(),
      avatarInput.trim()
    );
  };

  // Lógica de búsqueda encapsulada en StudentSearch

  const handleCopyCode = () => {
    navigator.clipboard.writeText(solidityCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se eliminan las iniciales y la lógica de detección manual porque ahora usamos UserAvatar

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <SEO
        title="Identidad Estudiantil Digital"
        description="Registra y administra tu perfil profesional on-chain en el Diplomado de la USACH. Asocia tu nombre, correo, LinkedIn y Twitter a tu billetera."
        urlPath="/identity"
      />

      <Navbar />

      {/* Notificaciones flotantes */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-2xl animate-in slide-in-from-bottom duration-300 bg-card/95 backdrop-blur-md text-card-foreground border-border/80">
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            )}
            <div>
              <h4 className="font-semibold text-sm">
                {notification.type === 'success' ? 'Operación Exitosa' : 'Ocurrió un error'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px] break-all">
                {notification.message}
              </p>
              {notification.txHash && (
                <a
                  href={`${explorerUrl}/tx/${notification.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary hover:underline font-semibold"
                >
                  Ver transacción
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal - Ocupa ancho completo sin max-w */}
      {/* Contenido Principal - Ocupa ancho completo sin max-w */}
      <main className="flex-1 w-full p-4 sm:p-8 space-y-8">
        
        {/* Encabezado Principal Homologado */}
        <PageHeader
          title="Identidad Estudiantil Digital"
          description="Crea tu perfil profesional en la blockchain de entrenamiento de la Universidad de Santiago de Chile. Asocia tu nombre, correo, LinkedIn y Twitter de forma descentralizada."
          icon={User}
          breadcrumbItems={[
            { label: 'Identidad Digital' }
          ]}
          actions={
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-border/60 hover:bg-muted/80 text-xs font-semibold"
              onClick={() => router.push('/aprender')}
            >
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              Aprender
            </Button>
          }
        />

        {/* Sección Superior: Grid de Identidad Personal y Buscador */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          
          {/* Columna 1 y 2: Perfil y Formulario del Usuario Conectado */}
          <Card className="xl:col-span-3 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                  <UserPlus className="h-5 w-5 text-indigo-500" />
                  Tu Identidad en la Blockchain
                </CardTitle>
                <CardDescription>
                  Administra la información de tu perfil público registrada en el contrato inteligente.
                </CardDescription>
              </CardHeader>
              
              {!isConnected || !address ? (
                /* Estado Desconectado */
                <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
                  <div className="rounded-full bg-indigo-500/10 p-3 text-indigo-500 border border-indigo-500/20 shadow-inner">
                    <Wallet className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">Conecta tu Billetera Web3</h4>
                    <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                      Necesitas tener una billetera Web3 activa para registrar o modificar tu perfil estudiantil público.
                    </p>
                  </div>
                  <div className="pt-2">
                    <ConnectButton />
                  </div>
                </CardContent>
              ) : (
                /* Estado Conectado: Perfil y Formulario */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 pt-0">
                  
                  {/* Visualización del estado actual (Col 12 u 8) */}
                  <div className="lg:col-span-5 space-y-4 border-r border-border/20 pr-0 lg:pr-6">
                    <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/20 border border-border/30">
                      <UserAvatar address={address} className="h-20 w-20 mb-3 shadow-md border" />
                      
                      <div className="space-y-1 w-full">
                        <h4 className="font-bold text-base truncate text-foreground">
                          {myProfile?.isRegistered ? myProfile.name : 'Usuario no registrado'}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate font-mono">
                          {address.substring(0, 6)}...{address.substring(address.length - 4)}
                        </p>
                        {myProfile?.isRegistered ? (
                          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-500 border border-indigo-500/20 mt-1">
                            Perfil Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500 border border-amber-500/20 mt-1">
                            Sin registrar
                          </span>
                        )}
                      </div>
                    </div>

                    {myProfile?.isRegistered && (
                      <div className="space-y-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/20">
                        <div className="flex items-center justify-between text-[11px] border-b border-border/20 pb-1.5">
                          <span className="font-semibold text-foreground">Datos del contrato:</span>
                        </div>
                        {myProfile.email && (
                          <div className="flex justify-between truncate">
                            <span className="shrink-0 font-medium">Email:</span>
                            <span className="text-foreground truncate ml-1">{myProfile.email}</span>
                          </div>
                        )}
                        {myProfile.linkedin && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">LinkedIn:</span>
                            <a
                              href={formatSocialLink(myProfile.linkedin, 'linkedin')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-500 hover:underline flex items-center gap-0.5 truncate max-w-[200px]"
                            >
                              {getSocialDisplayLabel(myProfile.linkedin, 'linkedin')} <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                        )}
                        {myProfile.twitter && (
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Twitter:</span>
                            <a
                              href={formatSocialLink(myProfile.twitter, 'twitter')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-500 hover:underline flex items-center gap-0.5 truncate max-w-[200px]"
                            >
                              {getSocialDisplayLabel(myProfile.twitter, 'twitter')} <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                        )}
                        <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/10">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" /> Act:
                          </span>
                          <span>{new Date(myProfile.updatedAt * 1000).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Formulario de actualización (Col 7) */}
                  <form onSubmit={handleSaveProfile} className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="std-name" className="text-xs font-semibold text-foreground">Nombre Completo *</Label>
                        <Input
                          id="std-name"
                          type="text"
                          placeholder="Ej. Juan Pérez"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          disabled={isActionPending}
                          className="bg-background/80 border-border/80 text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="std-email" className="text-xs font-semibold text-foreground">Email Estudiantil</Label>
                        <Input
                          id="std-email"
                          type="email"
                          placeholder="Ej. juan.perez@usach.cl"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          disabled={isActionPending}
                          className="bg-background/80 border-border/80 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="std-linkedin" className="text-xs font-semibold text-foreground">LinkedIn (URL)</Label>
                          <Input
                            id="std-linkedin"
                            type="url"
                            placeholder="Ej. https://linkedin.com/in/juanperez"
                            value={linkedinInput}
                            onChange={(e) => setLinkedinInput(e.target.value)}
                            disabled={isActionPending}
                            className="bg-background/80 border-border/80 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="std-twitter" className="text-xs font-semibold text-foreground">Twitter/X (URL)</Label>
                          <Input
                            id="std-twitter"
                            type="url"
                            placeholder="Ej. https://x.com/juan_perez"
                            value={twitterInput}
                            onChange={(e) => setTwitterInput(e.target.value)}
                            disabled={isActionPending}
                            className="bg-background/80 border-border/80 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="std-avatar" className="text-xs font-semibold text-foreground">URL de Imagen de Avatar</Label>
                        <Input
                          id="std-avatar"
                          type="url"
                          placeholder="Ej. https://images.unsplash.com/... o api.dicebear..."
                          value={avatarInput}
                          onChange={(e) => setAvatarInput(e.target.value)}
                          disabled={isActionPending}
                          className="bg-background/80 border-border/80 text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2 items-center border-t border-border/20 mt-4">
                      <Button
                        type="submit"
                        disabled={isActionPending}
                        size="lg"
                        className="shadow-md font-bold px-6 py-2.5 hover:scale-[1.02] transition-transform text-sm"
                      >
                        {isActionPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Guardando en Blockchain...
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            {myProfile?.isRegistered ? 'Actualizar Perfil' : 'Registrar Perfil'}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                  
                </div>
              )}
            </div>
            
            {isConnected && address ? (
              <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-indigo-500" /> Los cambios en tu perfil requieren enviar y firmar una transacción Web3.
                </span>
              </CardFooter>
            ) : null}
          </Card>

          {/* Columna 3 y 4: Buscador de Perfiles */}
          <StudentSearch className="xl:col-span-2" />

        </div>

        {/* Sección Inferior: Directorio Global y Código de Contrato */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Estructura y Propiedades del Contrato */}
          <Card className="lg:col-span-3 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 to-indigo-500"></div>
            <div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                  <BookOpen className="h-5 w-5 text-pink-500" />
                  1. Estructura y Propiedades
                </CardTitle>
                <CardDescription>
                  Concepto de la identidad digital descentralizada on-chain.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-muted-foreground">
                <p>
                  El contrato inteligente <strong className="text-foreground font-semibold">StudentIdentity</strong> actúa como un registro público y descentralizado on-chain para almacenar la identidad digital de los estudiantes. Esto permite asociar directamente una dirección Ethereum con información de contacto y enlaces de redes profesionales.
                </p>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Campos del Perfil (Profile Struct)</h4>
                  <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                    <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20 flex flex-col justify-between">
                      <div>
                        <span className="block font-bold text-foreground font-mono">name</span>
                        <span className="text-[10px] leading-tight">Nombre completo del estudiante. Es de carácter obligatorio; si se intenta registrar vacío, la transacción se revertirá.</span>
                      </div>
                    </li>
                    <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20 flex flex-col justify-between">
                      <div>
                        <span className="block font-bold text-foreground font-mono">email</span>
                        <span className="text-[10px] leading-tight">Correo electrónico de contacto estudiantil (por ejemplo, con dominio institucional <code>@usach.cl</code>).</span>
                      </div>
                    </li>
                    <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20 flex flex-col justify-between">
                      <div>
                        <span className="block font-bold text-foreground font-mono">linkedin</span>
                        <span className="text-[10px] leading-tight">Enlace (URL) completo del perfil profesional de LinkedIn para facilitar el networking entre pares.</span>
                      </div>
                    </li>
                    <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20 flex flex-col justify-between">
                      <div>
                        <span className="block font-bold text-foreground font-mono">twitter</span>
                        <span className="text-[10px] leading-tight">Enlace (URL) completo de X/Twitter para seguir la presencia social del estudiante en la Web3.</span>
                      </div>
                    </li>
                    <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20 flex flex-col justify-between">
                      <div>
                        <span className="block font-bold text-foreground font-mono">avatar</span>
                        <span className="text-[10px] leading-tight">Enlace HTTP de la imagen o URI de almacenamiento descentralizado (como un CID de IPFS) para el avatar.</span>
                      </div>
                    </li>
                    <li className="bg-muted/40 p-2.5 rounded-lg border border-border/20 flex flex-col justify-between">
                      <div>
                        <span className="block font-bold text-foreground font-mono">updatedAt</span>
                        <span className="text-[10px] leading-tight">Marca de tiempo Unix provista por la red (<code>block.timestamp</code>) con el segundo exacto de la última edición.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Variables de Estado (Almacenamiento)</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-indigo-400 font-bold shrink-0 bg-indigo-500/10 px-1 rounded">_profiles</span>
                      <span className="text-[11px] font-mono text-muted-foreground shrink-0">mapping(address =&gt; Profile)</span>
                      <span className="text-[11px]">Asocia directamente la dirección de wallet de cada estudiante con su estructura de datos <code>Profile</code>. Es privada para controlar el acceso a través del getter público.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-indigo-400 font-bold shrink-0 bg-indigo-500/10 px-1 rounded">_registeredStudents</span>
                      <span className="text-[11px] font-mono text-muted-foreground shrink-0">address[]</span>
                      <span className="text-[11px]">Arreglo dinámico que almacena las direcciones de todos los estudiantes registrados. Permite iterar y listar la comunidad en la dApp.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-indigo-400 font-bold shrink-0 bg-indigo-500/10 px-1 rounded">_studentIndex</span>
                      <span className="text-[11px] font-mono text-muted-foreground shrink-0">mapping(address =&gt; uint256)</span>
                      <span className="text-[11px]">Mapeo auxiliar que guarda el índice (basado en 1) de la dirección en <code>_registeredStudents</code> (0 indica no registrado). Evita búsquedas lineales costosas, optimizando el consumo de gas en O(1).</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Funciones del Contrato</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-pink-500 font-bold shrink-0 bg-pink-500/10 px-1 rounded">setProfile()</span>
                      <span className="text-[11px]">Escribe o actualiza los datos del emisor de la transacción (<code>msg.sender</code>). Modifica el almacenamiento permanente del contrato y emite los eventos correspondientes.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-pink-500 font-bold shrink-0 bg-pink-500/10 px-1 rounded">getProfile()</span>
                      <span className="text-[11px]">Función de tipo <code>view</code> que retorna todos los campos estructurados de un perfil para una dirección dada. Es gratuita y no consume gas.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-pink-500 font-bold shrink-0 bg-pink-500/10 px-1 rounded">getAllRegisteredStudents()</span>
                      <span className="text-[11px]">Retorna un array completo con las direcciones Ethereum de todos los alumnos que han creado un perfil en la dApp.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-pink-500 font-bold shrink-0 bg-pink-500/10 px-1 rounded">getStudentsCount()</span>
                      <span className="text-[11px]">Retorna la longitud del array de estudiantes registrados, permitiendo conocer rápidamente la cantidad total de miembros en la comunidad.</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Eventos y Errores Personalizados</h4>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-emerald-500 font-mono font-bold">ProfileRegistered(address indexed studentAddress, name, email)</span>
                      <span className="text-muted-foreground pl-2 border-l border-border/30">Se emite cuando una dirección crea su perfil por primera vez. Facilita la indexación off-chain.</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-emerald-500 font-mono font-bold">ProfileUpdated(address indexed studentAddress, name, email, linkedin, twitter, avatar, updatedAt)</span>
                      <span className="text-muted-foreground pl-2 border-l border-border/30">Se emite en cada modificación posterior para alertar a los clientes frontend de los cambios.</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-red-400 font-mono font-bold">error NameRequired()</span>
                      <span className="text-muted-foreground pl-2 border-l border-border/30">Error personalizado para ahorrar gas. Revierte la transacción de manera eficiente si el campo <code>name</code> está vacío.</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-pink-500" /> Registro público y auditable para la comunidad USACH.
              </span>
            </CardFooter>
          </Card>

          {/* Código del Smart Contract */}
          <Card className="lg:col-span-2 border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-pink-500"></div>
            <div>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
                    <Code className="h-5 w-5 text-indigo-500" />
                    Código Smart Contract (Solidity)
                  </CardTitle>
                  <CardDescription>
                    Estructura del contrato de identidad digital de estudiantes.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border/60 hover:bg-muted/80 transition-colors"
                  onClick={handleCopyCode}
                  title="Copiar código"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="relative rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-inner">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono">
                    <span>StudentIdentity.sol</span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      solc 0.8.35
                    </span>
                  </div>
                  <pre className="text-[10px] sm:text-[11px] font-mono p-4 overflow-x-auto leading-relaxed text-zinc-300 max-h-[580px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                    <code>
                      <span className="text-zinc-500">// SPDX-License-Identifier: MIT</span>{"\n"}
                      <span className="text-pink-500">pragma</span> <span className="text-amber-500">solidity</span> <span className="text-blue-400">^0.8.35</span>;{"\n\n"}
                      <span className="text-blue-500">contract</span> <span className="text-yellow-400 font-bold">StudentIdentity</span> {"{"}{"\n"}
                      {"    "}<span className="text-blue-500">struct</span> <span className="text-teal-400">Profile</span> {"{"}{"\n"}
                      {"        "}<span className="text-blue-400">string</span> name;{"\n"}
                      {"        "}<span className="text-blue-400">string</span> email;{"\n"}
                      {"        "}<span className="text-blue-400">string</span> linkedin;{"\n"}
                      {"        "}<span className="text-blue-400">string</span> twitter;{"\n"}
                      {"        "}<span className="text-blue-400">string</span> avatar;{"\n"}
                      {"        "}<span className="text-blue-400">uint256</span> updatedAt;{"\n"}
                      {"        "}<span className="text-blue-400">bool</span> isRegistered;{"\n"}
                      {"    "}{"}"}{"\n\n"}
                      {"    "}<span className="text-pink-500">mapping</span>(<span className="text-blue-400">address</span> =&gt; <span className="text-teal-400">Profile</span>) <span className="text-pink-500">private</span> _profiles;{"\n"}
                      {"    "}<span className="text-blue-400">address</span>[] <span className="text-pink-500">private</span> _registeredStudents;{"\n"}
                      {"    "}<span className="text-pink-500">mapping</span>(<span className="text-blue-400">address</span> =&gt; <span className="text-blue-400">uint256</span>) <span className="text-pink-500">private</span> _studentIndex;{"\n\n"}
                      {"    "}<span className="text-blue-500">event</span> <span className="text-yellow-400">ProfileRegistered</span>(<span className="text-blue-400">address</span> <span className="text-pink-500">indexed</span> studentAddress, ...);{"\n"}
                      {"    "}<span className="text-blue-500">event</span> <span className="text-yellow-400">ProfileUpdated</span>(<span className="text-blue-400">address</span> <span className="text-pink-500">indexed</span> studentAddress, ...);{"\n"}
                      {"    "}<span className="text-blue-500">error</span> <span className="text-red-400">NameRequired</span>();{"\n\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">setProfile</span>(<span className="text-blue-400">string</span> <span className="text-pink-500">calldata</span> name, ...) <span className="text-pink-500">external</span>;{"\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">getProfile</span>(<span className="text-blue-400">address</span> studentAddress) <span className="text-pink-500">external</span> <span className="text-pink-500">view</span> returns (...);{"\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">getAllRegisteredStudents</span>() <span className="text-pink-500">external</span> <span className="text-pink-500">view</span> returns (<span className="text-blue-400">address</span>[] <span className="text-pink-500">memory</span>);{"\n"}
                      {"    "}<span className="text-blue-500">function</span> <span className="text-teal-400">getStudentsCount</span>() <span className="text-pink-500">external</span> <span className="text-pink-500">view</span> returns (<span className="text-blue-400">uint256</span>);{"\n"}
                      {"}"}
                    </code>
                  </pre>
                </div>
              </CardContent>
            </div>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
              <span className="text-[10.5px] text-muted-foreground flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-indigo-500" /> El estándar asocia información pública transparente y auditable a una dirección.
              </span>
              <a
                href="https://github.com/cjbaezilla/diplomado-usach-training-dapp-contracts/blob/main/contracts/StudentIdentity.sol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10.5px] text-indigo-500 hover:text-indigo-600 hover:underline flex items-center gap-1 font-semibold shrink-0"
              >
                Ver en GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </CardFooter>
          </Card>

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default IdentityPage;
