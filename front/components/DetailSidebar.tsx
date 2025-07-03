import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentSelector } from "./StudentSelector";
import { ICPChart } from "./ICPChart";
import { ICPLegend } from "@/app/ICPLegend";
import { SelectionPointsCard } from "@/app/SelectPointsCard";
import { WeightsCard } from "@/app/WeightsCard";
import { ICPRange, Student } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { ChartDataPoint } from "@/types/chart-data"
import { useChartDataStats } from "./useChartDataStats";
import { CardContent } from "./ui/card";
import { ICPRangeChart } from "./ICPRangeChart";


interface DetailSidebarProps {
  item: ICPRange | null;
  isOpen: boolean;
  onClose: () => void;
  chartDataPoints: ChartDataPoint[]
}

export const DetailSidebar: React.FC<DetailSidebarProps> = ({
  item,
  isOpen,
  onClose,
  chartDataPoints
}) => {
  const [selectedStudents, setSelectedStudents] = useState<Student[]>(
    [],
  );

  const handleSelectionChange = (students: Student[]) => {
    setSelectedStudents(students);
  };

  const { chartData, allStudents, stats } = useChartDataStats(chartDataPoints, selectedStudents)
  console.log(chartDataPoints)

  if (!item) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="bg-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Detalhes da Turma</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-purple-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          <div className="space-y-3">
          <div>
              <h3 className="font-medium text-purple-100">Jornada:</h3>
              <p className="text-lg">{item.journey_name}</p>
            </div>
            <div>
              <h3 className="font-medium text-purple-100">Mapa:</h3>
              <p className="text-lg">{item.map_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-purple-200">Total de Alunos</p>
                <p className="text-lg font-semibold">
                  {item.participation_consistency_per_users.length}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-purple-200">Período de Coleta</p>
              <p className="text-base font-medium">
                {new Date(item.start_date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}{" "}
                até{" "}
                {new Date(item.end_date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Cards */}
          <div className="bg-slate-50 p-2 rounded-lg">
            <h4 className="font-medium text-slate-700 mb-2">Criação</h4>
            <p className="text-sm text-slate-600">
              {formatDate(item.created_at)}
            </p>
          </div>

          {/* Student Selection */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Seleção de Alunos
            </h4>
            <StudentSelector
              students={item.participation_consistency_per_users}
              selectedStudents={selectedStudents}
              onStudentsChange={handleSelectionChange}
            />
          </div>

          {/* Chart */}
          <ICPRangeChart
            selectedStudents={selectedStudents}
            currentHistoryItem={item}
          />

          {/* Selection Points */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Pontos Selecionados
            </h4>
            <SelectionPointsCard
              debate={item.divergence_point}
              avaliacao={item.essay_point}
              decisao={item.convergence_point}
            />
          </div>

          {/* Weights Configuration */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Configuração de Pesos
            </h4>
            <WeightsCard
              dynamicWeights={false}
              weightX={item.weight_gap}
              weightY={item.weight_rpp}
              weightXName="Peso do GAP"
              weightXDescription="Participação geral"
              weightXAbbreviation="GAP"
              weightYName="Peso do RPP"
              weightYDescription="Regularidade de participação"
              weightYAbbreviation="RPP"
            />
          </div>

          {/* Legend */}
          <div>
            <ICPLegend />
          </div>
          
        </div>
      </div>
    </>
  );
};
