import { useAllStudents, useStudentProfile } from '@/hooks/useStudentIdentity';
import { UserAvatar } from '@/components/UserAvatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Users, Clock, Info, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

interface RecentStudentItemProps {
  address: `0x${string}`;
}

function RecentStudentItem({ address }: RecentStudentItemProps) {
  const { profile, isLoading } = useStudentProfile(address);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 animate-pulse bg-muted/20">
        <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="h-3.5 w-24 bg-muted rounded" />
          <div className="h-2.5 w-16 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!profile || !profile.isRegistered) return null;

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/40 bg-card/45 backdrop-blur-sm hover:border-purple-500/50 hover:bg-muted/10 transition-all duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar address={address} className="h-9 w-9 border border-border/60 shrink-0" />
        <div className="min-w-0">
          <h4 className="font-bold text-xs text-foreground truncate">{profile.name}</h4>
          <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </p>
        </div>
      </div>
      
      <div className="text-right shrink-0 flex flex-col items-end">
        <span className="text-[9px] text-muted-foreground flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {new Date(profile.updatedAt * 1000).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}

export function RecentIdentities() {
  const { addresses, isLoading } = useAllStudents();

  // Tomar los últimos 4 estudiantes registrados (reversar el arreglo para ver los más nuevos primero)
  const recentAddresses = useMemo(() => {
    if (!addresses || addresses.length === 0) return [];
    return [...addresses].reverse().slice(0, 4);
  }, [addresses]);

  return (
    <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300 h-full">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500"></div>
      <div>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
              <Users className="h-4 w-4 text-purple-500" />
              Últimas Identidades
            </CardTitle>
            <CardDescription className="text-xs">
              Estudiantes recientemente registrados en la identidad digital.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex flex-col gap-2.5 py-1">
              <div className="h-[58px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[58px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[58px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
              <div className="h-[58px] rounded-xl bg-muted/20 border border-border/20 animate-pulse" />
            </div>
          ) : recentAddresses.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground space-y-2 border border-dashed border-border/40 rounded-xl">
              <Info className="h-5 w-5 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">Sin registros recientes</p>
              <p className="max-w-[200px] mx-auto text-[10px]">
                Registra tu perfil en la pestaña de Identidad para aparecer aquí.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentAddresses.map((addr) => (
                <RecentStudentItem key={addr} address={addr} />
              ))}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="bg-muted/10 border-t border-border/20 p-3 flex justify-between items-center mt-auto">
        <span className="text-[10px] text-muted-foreground">
          Total: {addresses.length} estudiantes
        </span>
        <Link 
          href="/identity" 
          className="text-[10px] font-bold text-purple-500 hover:text-purple-400 flex items-center gap-0.5 hover:underline"
        >
          Ir a Identidad
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
