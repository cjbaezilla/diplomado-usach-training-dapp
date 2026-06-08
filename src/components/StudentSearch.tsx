import { useState, useEffect } from 'react';
import { useStudentProfile, useAllStudents } from '@/hooks/useStudentIdentity';
import { cn, formatSocialLink, getSocialDisplayLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Search,
  Users,
  AlertCircle,
  Loader2,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import Link from 'next/link';

interface StudentCardProps {
  studentAddress: `0x${string}`;
  onSelect: (addr: `0x${string}`) => void;
  isSelected: boolean;
}

function StudentCard({ studentAddress, onSelect, isSelected }: StudentCardProps) {
  const { profile, isLoading } = useStudentProfile(studentAddress);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 animate-pulse bg-muted/20">
        <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!profile || !profile.isRegistered) return null;

  return (
    <div
      onClick={() => onSelect(studentAddress)}
      className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-lg border border-border/40 bg-card/45 backdrop-blur-sm cursor-pointer hover:border-primary/50 hover:bg-muted/10 transition-all duration-300",
        isSelected && "border-primary/80 ring-1 ring-primary/40 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <UserAvatar address={studentAddress} className="h-10 w-10 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-xs text-foreground truncate">{profile.name}</h4>
          <p className="text-[10px] text-muted-foreground truncate font-mono">
            {studentAddress.substring(0, 6)}...{studentAddress.substring(studentAddress.length - 4)}
          </p>
        </div>
      </div>
      <Link
        href={`/estudiante?address=${studentAddress}`}
        onClick={(e) => e.stopPropagation()}
        className="text-muted-foreground hover:text-primary transition-colors shrink-0 p-1 rounded hover:bg-muted/30"
        title="Ver perfil completo del estudiante"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function StudentSearch({ className }: { className?: string } = {}) {
  const {
    count: studentCount,
    addresses: registeredAddresses,
    isLoading: isLoadingDirectory,
  } = useAllStudents();

  const [searchInput, setSearchInput] = useState('');
  const [searchAddress, setSearchAddress] = useState<`0x${string}` | undefined>(undefined);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    profile: searchedProfile,
    isLoading: isLoadingSearch,
  } = useStudentProfile(searchAddress);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const cleanAddress = searchInput.trim();
    
    if (!cleanAddress.startsWith('0x') || cleanAddress.length !== 42) {
      setLocalError('Dirección Ethereum inválida (debe empezar con 0x y tener 42 caracteres).');
      return;
    }
    
    setSearchAddress(cleanAddress as `0x${string}`);
  };

  const handleSelectStudent = (addr: `0x${string}`) => {
    setLocalError(null);
    setSearchInput(addr);
    setSearchAddress(addr);
  };

  // Limpiar errores si el input se vacía
  useEffect(() => {
    if (searchInput.trim() === '') {
      setLocalError(null);
    }
  }, [searchInput]);

  return (
    <Card className={cn("border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300", className)}>
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500"></div>
      <div>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-foreground font-bold">
              <Search className="h-5 w-5 text-purple-500" />
              Buscador de Estudiantes
            </CardTitle>
            <CardDescription>
              Consulta perfiles de otros estudiantes ingresando su dirección Ethereum.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1 rounded-full text-xs font-semibold text-purple-500 border border-purple-500/20 shrink-0">
            {studentCount} registrados
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Dirección 0x..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-background/80 border-border/80 text-xs pr-8 font-mono"
              />
              <Search className="absolute right-2.5 top-3 h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <Button type="submit" variant="secondary" className="text-xs font-bold px-3">
              Buscar
            </Button>
          </form>

          {localError && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          {searchAddress && !localError && (
            <div className="border border-border/40 rounded-xl p-4 bg-muted/20 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchAddress(undefined);
                }}
                className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground text-sm font-bold leading-none p-1 rounded-md hover:bg-muted/40 transition-colors"
                title="Limpiar búsqueda"
              >
                &times;
              </button>
              {isLoadingSearch ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                </div>
              ) : searchedProfile && searchedProfile.isRegistered ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar address={searchAddress} className="h-12 w-12 border shadow-sm" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-foreground truncate flex items-center gap-1.5">
                        <Link
                          href={`/estudiante?address=${searchAddress}`}
                          className="hover:underline flex items-center gap-0.5 text-foreground hover:text-primary transition-colors"
                        >
                          {searchedProfile.name}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-primary" />
                        </Link>
                      </h4>
                      <p className="text-[10px] text-muted-foreground truncate font-mono">{searchAddress}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border/20">
                    {searchedProfile.email && (
                      <div className="flex justify-between truncate">
                        <span className="shrink-0 font-medium">Email:</span>
                        <span className="text-foreground truncate ml-1">{searchedProfile.email}</span>
                      </div>
                    )}
                    {searchedProfile.linkedin && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">LinkedIn:</span>
                        <a
                          href={formatSocialLink(searchedProfile.linkedin, 'linkedin')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:underline flex items-center gap-0.5 truncate max-w-[200px]"
                        >
                          {getSocialDisplayLabel(searchedProfile.linkedin, 'linkedin')} <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    {searchedProfile.twitter && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Twitter:</span>
                        <a
                          href={formatSocialLink(searchedProfile.twitter, 'twitter')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:underline flex items-center gap-0.5 truncate max-w-[200px]"
                        >
                          {getSocialDisplayLabel(searchedProfile.twitter, 'twitter')} <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] pt-1.5 border-t border-border/10">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" /> Actualizado:
                      </span>
                      <span>{new Date(searchedProfile.updatedAt * 1000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground space-y-2">
                  <AlertCircle className="h-6 w-6 text-amber-500 mx-auto" />
                  <p>La dirección consultada no tiene un perfil registrado en este contrato inteligente.</p>
                </div>
              )}
            </div>
          )}

          {/* Listado de Estudiantes integrado */}
          <div className="space-y-2 pt-2 border-t border-border/20">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-purple-500" />
              Comunidad Estudiantil
            </h4>
            {isLoadingDirectory ? (
              <div className="flex flex-col gap-2 py-2">
                <div className="h-9 rounded-lg bg-muted animate-pulse" />
                <div className="h-9 rounded-lg bg-muted animate-pulse" />
              </div>
            ) : registeredAddresses.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground space-y-1 border border-dashed border-border/40 rounded-xl">
                <Info className="h-5 w-5 text-muted-foreground mx-auto" />
                <p>No se han registrado estudiantes aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
                {registeredAddresses.map((addr) => (
                  <StudentCard
                    key={addr}
                    studentAddress={addr}
                    onSelect={handleSelectStudent}
                    isSelected={searchAddress === addr}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </div>
      <CardFooter className="bg-muted/10 border-t border-border/20 p-4">
        <span className="text-[10.5px] text-muted-foreground">
          * Selecciona cualquier estudiante de la lista o busca para ver su perfil completo.
        </span>
      </CardFooter>
    </Card>
  );
}
