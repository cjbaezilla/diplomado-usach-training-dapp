import { useAllStudents } from '@/hooks/useStudentIdentity';
import { useReadContracts } from 'wagmi';
import { STUDENT_IDENTITY_CONTRACT, BASE_ERC1155_CONTRACT } from '@/contracts';
import { useHydrated } from '@/hooks/useHydrated';
import { UserAvatar } from '@/components/UserAvatar';
import { Trophy, Info, ArrowUpRight, ExternalLink, Award, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import challengesData from '../../public/desafios.json';

export function TopChallengesStudents() {
  const isHydrated = useHydrated();
  const { addresses, isLoading: isLoadingAllStudents } = useAllStudents();
  const totalChallenges = challengesData.length || 10;

  // Preparar llamadas multicall para obtener perfiles y balances de reliquias en una sola pasada
  const contracts = useMemo(() => {
    if (!addresses || addresses.length === 0) return [];
    const calls: any[] = [];
    addresses.forEach((addr) => {
      // 1. Obtener perfil del estudiante
      calls.push({
        ...STUDENT_IDENTITY_CONTRACT,
        functionName: 'getProfile',
        args: [addr],
      });
      // 2. Obtener balances de reliquias (tokens ERC-1155 del 0 al 9)
      calls.push({
        ...BASE_ERC1155_CONTRACT,
        functionName: 'balanceOfBatch',
        args: [
          Array(10).fill(addr),
          Array.from({ length: 10 }, (_, i) => BigInt(i)),
        ],
      });
    });
    return calls;
  }, [addresses]);

  const { data: results, isLoading: isLoadingDetails } = useReadContracts({
    contracts: contracts as any,
    query: {
      enabled: isHydrated && contracts.length > 0,
    },
  });

  // Procesar perfiles y contar desafíos completados por cada estudiante
  const topStudents = useMemo(() => {
    if (!addresses || !results || results.length !== addresses.length * 2) return [];

    const list = addresses.map((addr, index) => {
      const profileResult = results[index * 2];
      const balanceResult = results[index * 2 + 1];

      // Inicializar datos del estudiante
      let name = 'Estudiante Web3';
      let avatar = '';
      let isRegistered = false;

      if (profileResult && profileResult.status === 'success' && profileResult.result) {
        const pData = profileResult.result as any;
        name = pData[0] || 'Estudiante Web3';
        avatar = pData[4] || '';
        isRegistered = pData[6] || false;
      }

      let completedCount = 0;
      if (balanceResult && balanceResult.status === 'success' && balanceResult.result) {
        const balances = balanceResult.result as bigint[];
        completedCount = balances.filter((b) => b > 0n).length;
      }

      return {
        address: addr,
        name,
        avatar,
        isRegistered,
        completedCount,
      };
    });

    // Ordenar descendente por cantidad de desafíos completados, y ascendente por nombre/dirección en caso de empate
    return list
      .sort((a, b) => {
        if (b.completedCount !== a.completedCount) {
          return b.completedCount - a.completedCount;
        }
        return a.name.localeCompare(b.name) || a.address.localeCompare(b.address);
      })
      .slice(0, 10);
  }, [addresses, results]);

  const isLoadingAny = !isHydrated || isLoadingAllStudents || isLoadingDetails;

  return (
    <Card className="border border-border/80 shadow-lg bg-card/45 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300 h-full w-full">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-primary to-cyan-500"></div>
      <div>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
              <Trophy className="h-4 w-4 text-amber-500 animate-pulse" />
              Top 10 Resolutores de Desafíos
            </CardTitle>
            <CardDescription className="text-xs">
              Estudiantes con la mayor cantidad de desafíos académicos completados y validados.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoadingAny ? (
            <div className="flex flex-col gap-2.5 py-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/20 animate-pulse bg-muted/20">
                  <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-3.5 w-32 bg-muted rounded" />
                    <div className="h-2 w-24 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : topStudents.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground space-y-2 border border-dashed border-border/40 rounded-xl">
              <Info className="h-5 w-5 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">Sin estudiantes registrados</p>
              <p className="max-w-[220px] mx-auto text-[10px]">
                ¡Sé el primero en registrar tu perfil e iniciar tu camino en los desafíos!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {topStudents.map((student, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;
                const isTop3 = rank <= 3;
                
                // Estilos para medallas del Top 3 (plata y bronce)
                const rankStyles = [
                  '', // El primer lugar tiene estilos especiales nativos
                  'text-slate-300 bg-slate-500/10 border-slate-500/30', // Plata
                  'text-amber-600 bg-amber-700/10 border-amber-700/30', // Bronce
                ];

                const progressPercent = (student.completedCount / totalChallenges) * 100;

                return (
                  <div
                    key={student.address}
                    className={cn(
                      "flex flex-col gap-2 p-3 rounded-xl border transition-all duration-300",
                      isFirst
                        ? "border-amber-500/60 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent shadow-lg shadow-amber-500/5 hover:border-amber-500 hover:bg-amber-500/20"
                        : "border-border/40 bg-card/45 backdrop-blur-sm hover:border-primary/50 hover:bg-muted/10"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rango */}
                        <div className="shrink-0 flex items-center justify-center w-6">
                          {isFirst ? (
                            <div
                              className="flex items-center justify-center h-6.5 w-6.5 rounded-full border border-amber-500/50 bg-amber-500/25 font-bold text-[11px] text-amber-400 relative"
                              title="Líder de Desafíos"
                            >
                              <Trophy className="h-3 w-3 text-amber-400" />
                            </div>
                          ) : isTop3 ? (
                            <div
                              className={`flex items-center justify-center h-6 w-6 rounded-full border font-bold text-[11px] ${rankStyles[index]}`}
                              title={`Puesto #${rank}`}
                            >
                              {rank}
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground pl-1.5">{rank}</span>
                          )}
                        </div>

                        {/* Avatar */}
                        <UserAvatar 
                          address={student.address} 
                          className={cn(
                            "h-9 w-9 border shrink-0", 
                            isFirst ? "border-amber-500/70 ring-1 ring-amber-500/30" : "border-border/60"
                          )} 
                        />

                        {/* Nombre e Identidad */}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-foreground truncate flex items-center gap-1">
                            <Link
                              href={`/estudiante?address=${student.address.toLowerCase()}`}
                              className="hover:underline flex items-center gap-0.5 text-foreground hover:text-primary transition-colors"
                            >
                              {student.isRegistered ? student.name : 'Estudiante Web3'}
                              <ExternalLink className="h-2.5 w-2.5 shrink-0 text-muted-foreground hover:text-primary" />
                            </Link>
                            {isFirst && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/25 px-1.5 py-0.2 text-[8px] font-extrabold text-amber-400 border border-amber-500/30 uppercase tracking-wider animate-pulse">
                                <Sparkles className="h-2 w-2" />
                                Líder
                              </span>
                            )}
                          </h4>
                          <p className="text-[9px] text-muted-foreground truncate font-mono mt-0.5">
                            {student.address.substring(0, 6)}...{student.address.substring(student.address.length - 4)}
                          </p>
                        </div>
                      </div>

                      {/* Desafíos Completados */}
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span 
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                            isFirst 
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30" 
                              : "bg-primary/10 text-primary border-primary/20"
                          )}
                        >
                          <Award className="h-3 w-3" />
                          <span>{student.completedCount} / {totalChallenges}</span>
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso de desafíos sutil y personalizada */}
                    {student.completedCount > 0 && (
                      <div className="pl-9 pr-1">
                        <div className="relative h-1 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500 rounded-full",
                              isFirst ? "bg-gradient-to-r from-amber-500 to-amber-300" : "bg-primary"
                            )}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="bg-muted/10 border-t border-border/20 p-3 flex justify-between items-center mt-auto">
        <span className="text-[10px] text-muted-foreground">
          Total: {addresses?.length || 0} estudiantes en la red
        </span>
        <Link 
          href="/desafios" 
          className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-0.5 hover:underline"
        >
          Ir a Desafíos
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
