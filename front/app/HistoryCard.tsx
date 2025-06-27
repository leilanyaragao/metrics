import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { HistoryItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { HistoryIcon, TrendingUp } from "lucide-react";

interface HistoryCardProps {
  historyItems: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  className?: string;
  isLoading?: boolean;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({
  historyItems,
  onSelectItem,
  className,
  isLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 items per page (2 rows of 3 columns)

  // Reset to first page when items change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [historyItems.length]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    const end = new Date(endDate).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return `${start} até ${end}`;
  };

  const getICPBadgeColor = (icp: number) => {
    // ICP now comes as 0-100 instead of 0-1
    if (icp >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (icp >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (icp >= 40) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  // Pagination calculations
  const totalPages = Math.ceil(historyItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = historyItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target &&
        (e.target as HTMLElement).closest("input, textarea, select")
      ) {
        return; // Don't interfere with form inputs
      }

      switch (e.key) {
        case "ArrowLeft":
          if (currentPage > 1) {
            e.preventDefault();
            handlePrevious();
          }
          break;
        case "ArrowRight":
          if (currentPage < totalPages) {
            e.preventDefault();
            handleNext();
          }
          break;
      }
    };

    if (totalPages > 1) {
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [currentPage, totalPages]);

  // Smart pagination display - show max 5 page numbers
  const getVisiblePages = () => {
    const maxVisible = 5;
    const pages = [];

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination for many pages
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Adjust if we're at the end
      if (end === totalPages && pages.length < maxVisible) {
        const diff = maxVisible - pages.length;
        for (let i = Math.max(1, start - diff); i < start; i++) {
          pages.unshift(i);
        }
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200",
        className,
      )}
    >
      
      <CardHeader className="text-center pb-6">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <HistoryIcon className="w-4 h-4" />
                        Comparação de ICP
                      </CardTitle>
        <div className="space-y-2">
          <p className="text-slate-600 text-lg font-medium">
            {historyItems.length === 0
              ? "Nenhum histórico encontrado"
              : `${historyItems.length} ${historyItems.length === 1 ? "histórico encontrado" : "históricos encontrados"}`}
          </p>
          {historyItems.length > itemsPerPage && (
            <p className="text-sm text-slate-500">
              Mostrando {startIndex + 1}-
              {Math.min(endIndex, historyItems.length)} de {historyItems.length}
              {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-slate-600 mb-2">
              Carregando histórico...
            </p>
            <p className="text-slate-400">
              Buscando dados de turmas anteriores
            </p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-600 mb-2">
              Nenhuma turma encontrada
            </p>
            <p className="text-slate-400">
              O histórico aparecerá aqui quando houver dados disponíveis
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-purple-300 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-100 hover:-translate-y-1",
                  )}
                  onClick={() => onSelectItem(item)}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-slate-800 text-lg leading-tight mb-2">
                        {item.class_name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-1">
                        Criado em: {formatDate(item.created_at)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Período: {formatDateRange(item.start_date, item.end_date)}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          ICP Médio
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-sm font-medium",
                            getICPBadgeColor(item.class_average_icp),
                          )}
                        >
                          {item.class_average_icp.toFixed(1)}%
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Alunos</span>
                        <span className="text-sm font-medium text-slate-800">
                          {item.participation_consistency_per_users.length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Pontos</span>
                        <div className="flex gap-1">
                          {item.divergence_point && (
                            <div
                              className="w-2 h-2 rounded-full bg-green-500"
                              title="Debate"
                            />
                          )}
                          {item.essay_point && (
                            <div
                              className="w-2 h-2 rounded-full bg-blue-500"
                              title="Avaliação"
                            />
                          )}
                          {item.convergence_point && (
                            <div
                              className="w-2 h-2 rounded-full bg-purple-500"
                              title="Decisão"
                            />
                          )}
                          {!item.divergence_point && !item.essay_point && !item.convergence_point && (
                            <span className="text-xs text-slate-400">
                              Nenhum
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-xs text-slate-500">
                        ID: {item.map_id.substring(0, 8)}...
                      </div>
                      <div className="flex items-center gap-1 text-purple-600 group-hover:text-purple-700 transition-colors">
                        <span className="text-sm font-medium">
                          Ver detalhes
                        </span>
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePrevious}
                        className={cn(
                          "cursor-pointer",
                          currentPage === 1 && "pointer-events-none opacity-50",
                        )}
                      />
                    </PaginationItem>

                    {/* Show first page if not visible */}
                    {visiblePages.length > 0 && visiblePages[0] > 1 && (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(1)}
                            isActive={false}
                            className="cursor-pointer"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {visiblePages[0] > 2 && (
                          <PaginationItem>
                            <span className="flex h-9 w-9 items-center justify-center text-slate-400">
                              ...
                            </span>
                          </PaginationItem>
                        )}
                      </>
                    )}

                    {/* Visible page numbers */}
                    {visiblePages.map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {/* Show last page if not visible */}
                    {visiblePages.length > 0 &&
                      visiblePages[visiblePages.length - 1] < totalPages && (
                        <>
                          {visiblePages[visiblePages.length - 1] <
                            totalPages - 1 && (
                            <PaginationItem>
                              <span className="flex h-9 w-9 items-center justify-center text-slate-400">
                                ...
                              </span>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(totalPages)}
                              isActive={false}
                              className="cursor-pointer"
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNext}
                        className={cn(
                          "cursor-pointer",
                          currentPage === totalPages &&
                            "pointer-events-none opacity-50",
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
