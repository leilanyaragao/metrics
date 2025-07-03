import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Calendar,
  Clock,
  History,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ICPRange } from "@/types/dashboard";

interface Props {
  collections: ICPRange[];
  onOpenHistoryItem: (collection: ICPRange) => void;
}

export const HistoricalCollections = ({ collections, onOpenHistoryItem }: Props) => {
    const [page, setPage] = useState(1);
    const perPage = 6;
  
    const paginatedCollections = collections
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice((page - 1) * perPage, page * perPage);
  
    const totalPages = Math.ceil(collections.length / perPage);
  
    return (
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            Histórico de Coletas
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Visualize e compare coletas anteriores já finalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedCollections.map((collection) => (
              <div
                key={collection.id ?? collection.created_at}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600`}
                onClick={() => onOpenHistoryItem(collection)}
              >
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-violet-600 dark:text-violet-400 hover:bg-white/40">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
  
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(collection.created_at), "dd/MM/yyyy - HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
  
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Layers className="h-3 w-3" />
                    <span>Turma: <strong>{collection.map_name}</strong></span>
                  </div>
  
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Layers className="h-3 w-3" />
                    <span>Mapa: <strong>{collection.map_id}</strong></span>
                  </div>
  
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    <div className="text-center p-1 bg-white/40 dark:bg-slate-700/40 rounded">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {collection.participation_consistency_per_users?.length ?? 0}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Alunos</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-300 self-center">
                Página {page} de {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  