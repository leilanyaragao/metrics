// components/HistoricalCollectionsPanel.tsx
import React, { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  History,
  Clock,
  X,
  Eye,
  CheckCircle,
  StopCircle,
  AlertCircle,
  Calendar,
  HistoryIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ICPChart } from "./ICPChart";
import { ProcessedHistoricalCollection, ChartDataPoint, User } from "../types/chart-data"; 
import { ICPLegend } from "@/app/ICPLegend";
import { WeightsCard } from "@/app/WeightsCard";
import { SelectionPointsCard } from "@/app/SelectPointsCard";
import { cn } from "@/lib/utils";
interface HistoricalCollectionsPanelProps {
  historicalCollectionsData: { [key: string]: ChartDataPoint[] };
}

export const HistoricalCollectionsPanel: React.FC<HistoricalCollectionsPanelProps> = ({
  historicalCollectionsData,
}) => {
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<ProcessedHistoricalCollection | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  // Function to process historical collections from backend format
  const processHistoricalCollections = useMemo(() => {
    const processed: ProcessedHistoricalCollection[] = [];

    Object.entries(historicalCollectionsData).forEach(
      ([periodicIcpId, dataPoints]) => {
        if (dataPoints.length === 0) return;

        // Sort data points by date
        const sortedData = [...dataPoints].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

        const firstPoint = sortedData[0];
        const lastPoint = sortedData[sortedData.length - 1];

        // Calculate metrics
        const startDate = firstPoint.created_at;
        const endDate = lastPoint.updated_at || lastPoint.created_at; // Use created_at if updated_at is null
        const durationMs =
          new Date(endDate).getTime() - new Date(startDate).getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));

        // Get all unique students
        const allStudents = new Map<string, User>();
        dataPoints.forEach((point) => {
          point.participation_consistency_per_users.forEach((user) => {
            allStudents.set(user.user_id, user);
          });
        });

        // Calculate average ICP across all data points
        const allIcpValues = dataPoints.map((point) => point.class_average_icp);
        const averageIcp =
          allIcpValues.reduce((sum, icp) => sum + icp, 0) /
          (allIcpValues.length || 1); // Avoid division by zero

        // Determine status (simplified logic, adjust as needed based on your backend logic)
        let status: "completed" | "stopped" | "error" = "completed";
        // Example: if the last point's 'active' flag is false, consider it stopped
        if (lastPoint && lastPoint.active === false) {
          status = "stopped";
        } else if (averageIcp < 40) { // Example: consider an error if average ICP is too low
          status = "error";
        }


        processed.push({
          periodic_icpid: periodicIcpId,
          journey_name: firstPoint.journey_name,
          class_name: firstPoint.map_name,
          start_date: startDate,
          end_date: endDate,
          duration_minutes: durationMinutes,
          total_data_points: dataPoints.length,
          student_count: allStudents.size,
          average_icp: averageIcp,
          data: sortedData,
          status,
        });
      },
    );

    // Sort by start date (most recent first)
    return processed.sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
    );
  }, [historicalCollectionsData]);

  // Handlers for history panel
  const handleOpenHistoryItem = useCallback(
    (item: ProcessedHistoricalCollection) => {
      setSelectedHistoryItem(item);
      setIsHistoryPanelOpen(true);
    },
    [],
  );

  const handleCloseHistoryPanel = useCallback(() => {
    setIsHistoryPanelOpen(false);
    setSelectedHistoryItem(null);
  }, []);

  const firstDataPointOfSelectedItem = selectedHistoryItem?.data[0];


  return (
    <>
      {/* Historical Collections Section */}
      <Card
        className={cn(
          "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 dark:from-purple-950 dark:to-blue-950 dark:border-purple-800 mb-8",
        )}
      >
        <CardHeader className="text-center pb-6">
          <CardTitle className="flex items-center justify-center gap-2 text-base text-slate-900 dark:text-white">
            <History className="w-4 h-4 text-violet-600 dark:text-violet-400" /> {/* Using History icon */}
            Histórico
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Clique em qualquer avaliação para visualizar o gráfico
          </CardDescription>
          <div className="space-y-2">
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
              {processHistoricalCollections.length === 0
                ? "Nenhum histórico encontrado"
                : `${processHistoricalCollections.length} ${processHistoricalCollections.length === 1 ? "histórico encontrado" : "históricos encontrados"}`}
            </p>
            {/* Pagination logic can be added here if needed, but not strictly necessary for just the count */}
            {/* For example, if you want to show "Showing 1-X of Y" you'd need itemsPerPage, startIndex, endIndex, currentPage, totalPages logic */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processHistoricalCollections.map((collection) => {
              const statusConfig = {
                completed: {
                  icon: CheckCircle,
                  color: "text-green-600 dark:text-green-400",
                  bgColor: "bg-green-50 dark:bg-green-900/20",
                  borderColor: "border-green-200 dark:border-green-800",
                  label: "Concluída",
                },
                stopped: {
                  icon: StopCircle,
                  color: "text-red-600 dark:text-red-400",
                  bgColor: "bg-red-50 dark:bg-red-900/20",
                  borderColor: "border-red-200 dark:border-red-800",
                  label: "Interrompida",
                },
                error: {
                  icon: AlertCircle,
                  color: "text-amber-600 dark:text-amber-400",
                  bgColor: "bg-amber-50 dark:bg-amber-900/20",
                  borderColor: "border-amber-200 dark:border-amber-800",
                  label: "Erro",
                },
              };

              const config = statusConfig[collection.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={collection.periodic_icpid}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${config.bgColor} ${config.borderColor}`}
                  onClick={() => handleOpenHistoryItem(collection)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      <span className={`text-sm font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 ${config.color} hover:bg-white/50`}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(
                          new Date(collection.start_date),
                          "dd/MM/yyyy",
                          { locale: ptBR },
                        )}
                      </span>
                      a
                      <span>
                        {format(
                          new Date(collection.end_date),
                          "dd/MM/yyyy",
                          { locale: ptBR },
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Clock className="h-3 w-3" />
                      <span>{collection.duration_minutes} min</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="text-center p-1 bg-white/50 dark:bg-slate-800/50 rounded">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {collection.student_count}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Alunos
                        </div>
                      </div>
                      <div className="text-center p-1 bg-white/50 dark:bg-slate-800/50 rounded">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {collection.average_icp.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          ICP Médio
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Historical Collection Side Panel */}
      {isHistoryPanelOpen && selectedHistoryItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Jornada: {selectedHistoryItem.journey_name}
                    </h2>
                     <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Mapa: {selectedHistoryItem.class_name}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {format(
                        new Date(selectedHistoryItem.start_date),
                        "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                        { locale: ptBR },
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseHistoryPanel}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Collection Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedHistoryItem.total_data_points}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Pontos de Dados
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedHistoryItem.student_count}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Alunos
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {selectedHistoryItem.average_icp.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    ICP Médio
                  </div>
                </div>
              </div>

              {/* Historical Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                    Gráfico Histórico ICP
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Dados de participação da coleta selecionada
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {(() => {
                    // Process historical data for chart
                    const processedHistoricalData = selectedHistoryItem.data
                      .map((dataPoint) => {
                        const baseData: any = {
                          date: dataPoint.created_at,
                          timestamp: new Date(dataPoint.created_at).getTime(),
                          class_average_icp: dataPoint.class_average_icp,
                        };

                        dataPoint.participation_consistency_per_users.forEach(
                          (user) => {
                            baseData[user.user_id] = user.user_average_icp;
                          },
                        );

                        return baseData;
                      })
                      .sort((a, b) => a.timestamp - b.timestamp);

                    // Get all students from historical data
                    const historicalStudents = Array.from(
                      new Map(
                        selectedHistoryItem.data.flatMap((d) =>
                          d.participation_consistency_per_users.map((u) => [
                            u.user_id,
                            u,
                          ]),
                        ),
                      ).values(),
                    ).map((user, index) => ({
                      id: user.user_id,
                      name: user.user_name,
                      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                    }));

                    return (
                      <ICPChart
                        data={processedHistoricalData}
                        selectedStudents={historicalStudents}
                        totalStudents={selectedHistoryItem.student_count} // Use student_count from historical item
                      />
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Pontos Selecionados */}
              <div>
                <SelectionPointsCard
                  debate={firstDataPointOfSelectedItem!!.divergence_point}
                  avaliacao={firstDataPointOfSelectedItem!!.essay_point}
                  decisao={firstDataPointOfSelectedItem!!.convergence_point}
                />
              </div>

              {/* Pesos */}
              <WeightsCard
                dynamicWeights={false}
                weightX={firstDataPointOfSelectedItem!!.weight_gap}
                weightY={firstDataPointOfSelectedItem!!.weight_rpp}
                weightXName="Peso do GAP"
                weightXDescription="Mede a regularidade das participações, penalizando alunos que interagem de forma intercalada."
                weightXAbbreviation="GAP"
                weightYName="Peso do RPP"
                weightYDescription="Mede a continuidade das participações, penalizando ausências prolongadas ao longo do tempo."
                weightYAbbreviation="RPP"
              />


              {/* ICP Classification Information Card */}
              <ICPLegend />

              {/* Historical Students List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                    Participantes da Coleta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from(
                      new Map(
                        selectedHistoryItem.data.flatMap((d) =>
                          d.participation_consistency_per_users.map((u) => [
                            u.user_id,
                            u,
                          ]),
                        ),
                      ).values(),
                    ).map((user, index) => (
                      <div
                        key={user.user_id}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {user.user_name}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            ICP: {user.user_average_icp.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
};