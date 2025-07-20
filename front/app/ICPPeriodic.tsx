// components/Index.tsx
import React, { useState, useMemo, useCallback, SetStateAction, Dispatch } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
// import { mockChartData, mockHistoricalCollections } from "../data/mock-data"; // Remove mockHistoricalCollections
import { ICPLegend } from "./ICPLegend";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Zap,
  Square,
  AlertTriangle,
  History, // Keep if you want to reuse the icon, but actual section is moved
  Clock, // Keep if you want to reuse the icon
  X, // Keep if you want to reuse the icon
  Eye, // Keep if you want to reuse the icon
  CheckCircle, // Keep if you want to reuse the icon
  StopCircle, // Keep if you want to reuse the icon
  AlertCircle, // Keep if you want to reuse the icon
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ICPChart } from "../components/ICPChart";
import { StudentSelector } from "../components/StudentSelector";
import axios from "axios"
import {
  ChartDataPoint,
  ProcessedChartData,
  User,
  ProcessedHistoricalCollection,
} from "../types/chart-data";
import { Student } from "@/types/dashboard";
import { useChartDataStats } from "@/components/useChartDataStats";
import { SelectionPointsCard } from "./SelectPointsCard";
import { WeightsCard } from "./WeightsCard";
import { Informations } from "@/components/Informations";

interface Props {
  chartDataPoints: ChartDataPoint[]
  setShowResults: Dispatch<SetStateAction<boolean>>
}

const acessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsZWlsYW55LnVsaXNzZXNAdGRzLmNvbXBhbnkiLCJ1aWQiOiI2NjdiMWJlZjIzYzY5ZTY2ZjM0MzYyYjciLCJlbWFpbF92YWxpZGF0ZWQiOnRydWUsInJvbGVzIjpbXSwibmFtZSI6IkxlaWxhbnkgVWxpc3NlcyIsImV4cCI6MTc1Mjk4MzA2NywiaWF0IjoxNzUyOTY4NjY3fQ.6L3_mRpgK_nmn-wBHZ81L5X-SWq-artjjEPNje97NhkXrWgOtLF7oTZtDTvejMrOlS-XANydZX-KRi3-vK1ldw"

export default function ICPPEriodic({ chartDataPoints, setShowResults }: Props) {
  const [selectedStudents, setSelectedStudents] = useState<Student[]>(
    [],
  );

  // Callback otimizado para mudanças de estudantes
  const handleStudentsChange = useCallback((students: Student[]) => {
    setSelectedStudents(students);
  }, []);

  const handleStopCollection = useCallback(async () => {
    try {
      setIsStoppingCollection(true);

      const response = await axios.patch("http://localhost:8095/v1/metrics/icp/periodic/stop", {},
        { headers: { Authorization: `Bearer ${acessToken}` } })

      // Assuming a successful stop, you might want to hide the current results
      // and let the parent page handle the overall state or redirect
      setShowResults(false);


      // If the call was successful, update the state
      setIsCollectionActive(false);
    } catch (error) {
      console.error("Erro ao parar a coleta:", error);
      // Here you can add error notification if necessary
      alert("Erro ao parar a coleta. Tente novamente.");
    } finally {
      setIsStoppingCollection(false);
    }
  }, [setShowResults]); // Add setShowResults to dependency array

  const [isCollectionActive, setIsCollectionActive] = useState(true);
  const [isStoppingCollection, setIsStoppingCollection] = useState(false);

  const { chartData, allStudents, stats } = useChartDataStats(chartDataPoints, selectedStudents)

  // Estatísticas dos estudantes selecionados (kept for this component's relevance)
  const selectedStudentsStats = useMemo(() => {
    if (selectedStudents.length === 0) return null;

    const selectedData = selectedStudents.map((student) => {
      const userData = allStudents.find((s) => s.user_id === student.id);
      return userData ? userData.user_average_icp : 0;
    });

    return {
      avg:
        selectedData.reduce((sum, icp) => sum + icp, 0) / selectedData.length,
      min: Math.min(...selectedData),
      max: Math.max(...selectedData),
      aboveClassAvg: selectedData.filter((icp) => icp > stats.classAverage)
        .length,
    };
  }, [selectedStudents, allStudents, stats.classAverage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-violet-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700  z-10 p-4">
        {/* Nova div para a linha superior (onde ficarão os badges à direita) */}
        <div className="flex justify-end mb-2"> {/* `justify-end` empurra para a direita, `mb-2` adiciona margem inferior */}
          <div className="flex items-center gap-2"> {/* Agrupa os badges */}
            {/* Collection Status Indicator */}
            {isCollectionActive ? (
              <Badge
                variant="outline"
                className="border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-900/20 animate-pulse"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Coleta Ativa
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-900/20"
              >
                <Square className="h-3 w-3 mr-1" />
                Coleta Finalizada
              </Badge>
            )}

            {stats.isLargeDataset && (
              <Badge
                variant="outline"
                className="border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-900/20"
              >
                <Zap className="h-3 w-3 mr-1" />
                Otimizado
              </Badge>
            )}
          </div>
        </div>

        {/* Informations na linha de baixo (fica por padrão à esquerda) */}
        <Informations
          informations={{
            journey_name: chartDataPoints[0].journey_name,
            map_name: chartDataPoints[0].map_name,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total de Alunos
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalStudents}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {stats.activeStudents} ativos no último período
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Selecionados
              </CardTitle>
              <Target className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.selectedStudentsCount}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Pontos Temporais
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalDataPoints}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Última Atualização
              </CardTitle>
              <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {stats.latestUpdate ? format(new Date(stats.latestUpdate), "HH:mm", {
                  locale: ptBR,
                }) : ""}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {stats.latestUpdate ? format(new Date(stats.latestUpdate), "dd/MM/yyyy", {
                  locale: ptBR,
                }) : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Alert */}
        {stats.isLargeDataset && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-amber-900 dark:text-amber-200">
                Dataset Grande Detectado
              </h3>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Este dashboard foi otimizado para lidar com {stats.totalStudents}{" "}
              alunos e {stats.totalDataPoints} pontos temporais. Algumas
              visualizações podem ser amostrais para melhor performance.
            </p>
          </div>
        )}

        {/* Main Chart Section */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Student Selector Panel */}
          <div className="lg:col-span-3">
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  Seleção de Alunos
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Escolha alunos para comparar com a média da turma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudentSelector
                  students={allStudents}
                  selectedStudents={selectedStudents}
                  onStudentsChange={handleStudentsChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <div className="lg:col-span-3">
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                      Evolução ICP ao Longo do Tempo
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Gráfico adapta-se automaticamente à periodicidade e volume
                      dos dados
                      {selectedStudents.length > 0 && (
                        <span className="ml-2 text-cyan-600 dark:text-cyan-400 font-medium">
                          ({selectedStudents.length} aluno
                          {selectedStudents.length !== 1 ? "s" : ""} selecionado
                          {selectedStudents.length !== 1 ? "s" : ""})
                        </span>
                      )}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCollectionActive && (
                      <Badge
                        variant="outline"
                        className="border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-900/20"
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Coleta Parada
                      </Badge>
                    )}

                    {isCollectionActive && (
                      <TooltipProvider>
                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <Square className="h-4 w-4 mr-2" />
                                  Parar Coleta
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Interromper coleta de dados de participação</p>
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Confirmar Parada da Coleta
                              </AlertDialogTitle>
                              <AlertDialogDescription asChild>
                                <div className="space-y-2">
                                  <div>
                                    Você está prestes a{" "}
                                    <strong>parar permanentemente</strong> a
                                    coleta de dados de participação ICP.
                                  </div>
                                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                      <div className="text-sm">
                                        <div className="font-medium text-red-800 dark:text-red-200 mb-1">
                                          ⚠️ ATENÇÃO: Esta ação é irreversível!
                                        </div>
                                        <div className="text-red-700 dark:text-red-300">
                                          Não será possível retomar a coleta
                                          automática após confirmar. Os dados já
                                          coletados serão preservados, mas
                                          nenhum novo dado será registrado.
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-400">
                                    Tem certeza que deseja continuar?
                                  </div>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleStopCollection}
                                disabled={isStoppingCollection}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                              >
                                {isStoppingCollection
                                  ? "Parando..."
                                  : "Sim, Parar Coleta"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ICPChart
                  data={chartData}
                  selectedStudents={selectedStudents}
                  totalStudents={stats.totalStudents}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pontos Selecionados */}
        <div>
          <SelectionPointsCard
            debate={chartDataPoints[0]?.divergence_point}
            avaliacao={chartDataPoints[0]?.essay_point}
            decisao={chartDataPoints[0]?.convergence_point}
          />
        </div>

        {/* Pesos */}
        <WeightsCard
          dynamicWeights={false}
          weightX={chartDataPoints[0]?.weight_gap}
          weightY={chartDataPoints[0]?.weight_rpp}
          weightXName="Peso do GAP"
          weightXDescription="Mede a regularidade das participações, penalizando alunos que interagem de forma intercalada."
          weightXAbbreviation="GAP"
          weightYName="Peso do RPP"
          weightYDescription="Mede a continuidade das participações, penalizando ausências prolongadas ao longo do tempo."
          weightYAbbreviation="RPP"
        />

        {/* ICP Classification Information Card */}
        <ICPLegend />
      </div>

      {/* Detailed Analysis Table - Only show if manageable number of students */}
      {selectedStudents.length > 0 &&
        selectedStudents.length <= 20 &&
        chartData.length > 0 && (
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Análise Detalhada (Últimos 10 Períodos)
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Histórico temporal dos alunos selecionados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                        Data/Hora
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                        Média da Turma
                      </th>
                      {selectedStudents.slice(0, 10).map((student) => (
                        <th
                          key={student.id}
                          className="text-left py-3 px-4 font-medium"
                          style={{ color: student.color }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: student.color }}
                            />
                            <span className="truncate max-w-20">
                              {student.name.split(" ")[0]}
                            </span>
                          </div>
                        </th>
                      ))}
                      {selectedStudents.length > 10 && (
                        <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-400">
                          +{selectedStudents.length - 10} outros
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {chartData
                      .slice(-10)
                      .reverse()
                      .map((point, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                            {format(
                              new Date(point.date),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )}
                          </td>
                          <td className="py-3 px-4 text-violet-600 dark:text-violet-400 font-semibold">
                            {point.class_average_icp.toFixed(1)}%
                          </td>
                          {selectedStudents.slice(0, 10).map((student) => {
                            const studentIcp = point[student.id] as number;
                            const classIcp = point.class_average_icp;
                            const difference = studentIcp
                              ? studentIcp - classIcp
                              : null;

                            return (
                              <td key={student.id} className="py-3 px-4">
                                {studentIcp ? (
                                  <div className="flex flex-col">
                                    <span
                                      className="font-semibold"
                                      style={{ color: student.color }}
                                    >
                                      {studentIcp.toFixed(1)}%
                                    </span>
                                    {difference !== null && (
                                      <span
                                        className={`text-xs ${difference > 0
                                          ? "text-green-600 dark:text-green-400"
                                          : difference < 0
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-gray-500 dark:text-gray-400"
                                          }`}
                                      >
                                        {difference > 0 ? "+" : ""}
                                        {difference.toFixed(1)}%
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500">
                                    -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          {selectedStudents.length > 10 && (
                            <td className="py-3 px-4 text-slate-400 dark:text-slate-500 text-center">
                              ...
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {selectedStudents.length > 20 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                  💡 Tabela limitada a 10 alunos para melhor visualização.
                  Selecione menos alunos para ver todos os detalhes.
                </p>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
