import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentSelector } from "./StudentSelector";
import { ICPChart } from "./ICPChart";
import { ICPLegend } from "@/app/ICPLegend";
import { SelectionPointsCard } from "@/app/SelectPointsCard";
import { WeightsCard } from "@/app/WeightsCard";
import { HistoryItem, Student } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { ChartDataPoint } from "@/types/chart-data"
import { useChartDataStats } from "./useChartDataStats";


interface DetailSidebarProps {
  item: HistoryItem | null;
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
              <h3 className="font-medium text-purple-100">Nome da Turma</h3>
              <p className="text-lg">{item.class_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-purple-200">ICP Médio</p>
                <p className="text-lg font-semibold">
                  {(item.class_average_icp * 100).toFixed(1)}%
                </p>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-2">Criação</h4>
              <p className="text-sm text-slate-600">
                {formatDate(item.created_at)}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-2">
                Última Atualização
              </h4>
              <p className="text-sm text-slate-600">
                {formatDate(item.updated_at)}
              </p>
            </div>
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

          {/* Chart */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Comparação de ICP
            </h4>
            <ICPChart
              data={chartData}
              selectedStudents={selectedStudents}
              totalStudents={allStudents.length}
            />
          </div>

          {/* Legend */}
          <div>
            <ICPLegend />
          </div>

          {/* Technical Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-700 mb-3">
              Informações Técnicas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
              <div>
                <span className="font-medium">Map ID:</span> {item.map_id}
              </div>
              <div>
                <span className="font-medium">Versão:</span> {item.version}
              </div>
              <div>
                <span className="font-medium">ID:</span> {item.id}
              </div>
              <div>
                <span className="font-medium">GAP Médio:</span>{" "}
                {(item.class_average_gap * 100).toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">RPP Médio:</span>{" "}
                {(item.class_average_rpp * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
