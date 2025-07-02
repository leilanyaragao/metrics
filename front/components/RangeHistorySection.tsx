import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { IAERange } from "@/types/dashboard";
  import { Calendar, MapPin, Route, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
  
  
  interface RangeHistorySectionProps {
    historyData: IAERange[];
    onHistoryCardClick: (item: IAERange) => void;
  }
  
  const RangeHistorySection = ({
    historyData,
    onHistoryCardClick,
  }: RangeHistorySectionProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
  
    // Calculate pagination
    const totalPages = Math.ceil(historyData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = historyData.slice(startIndex, endIndex);
  
    const handlePreviousPage = () => {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    };
  
    const handleNextPage = () => {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };
    console.log(historyData)
  
    return (
  
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Histórico de Avaliações Range
          </CardTitle>
          <CardDescription className="text-slate-600">
            Clique em qualquer avaliação para visualizar o gráfico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentItems.map((item) => (
              <Card
                key={item.id}
                className="border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all duration-300 cursor-pointer h-fit"
                onClick={() => onHistoryCardClick(item)}
              >
                <CardContent className="p-5">
                  {/* Header com Data e Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-500 flex-shrink-0" />
                      <div>
                        <div className="text-base font-semibold text-slate-900">
                          {new Date(item.created_at).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(item.created_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  </div>
  
                  {/* Informações Principais */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Route className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {item.journey_name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>Jornada</span>
                        </div>
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {item.class_name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>Mapa</span>
                        </div>
                      </div>
                    </div>
  
                    <div className="flex justify-center">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {item.points_indexes?.length || 0} pontos
                        </div>
                        <div className="text-xs text-slate-500 text-center">
                          Avaliados
                        </div>
                      </div>
                    </div>
                  </div>
  
                  {/* Período */}
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs font-medium text-slate-600 mb-1">
                      Período de Coleta
                    </div>
                    <div className="text-sm text-slate-900">
                      {new Date(item.start_date).toLocaleDateString("pt-BR")} -{" "}
                      {new Date(item.end_date).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.dynamic_weights && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                        Pesos Dinâmicos
                      </span>
                    )}
                    {item.divergence_point && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">
                        Divergência
                      </span>
                    )}
                    {item.convergence_point && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                        Convergência
                      </span>
                    )}
                    {item.essay_point && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-medium">
                        Essay
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
  
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <div className="text-sm text-slate-600">
                Mostrando {startIndex + 1} a{" "}
                {Math.min(endIndex, historyData.length)} de {historyData.length}{" "}
                avaliações
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
  
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ),
                  )}
                </div>
  
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  export default RangeHistorySection;
  