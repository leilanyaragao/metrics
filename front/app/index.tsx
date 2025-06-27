import React, { useState, useMemo, useCallback, SetStateAction, Dispatch } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { mockChartData, mockHistoricalCollections } from "../data/mock-data";
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
  History,
  Clock,
  X,
  Eye,
  CheckCircle,
  StopCircle,
  AlertCircle,
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
interface Props {
  chartDataPoints: ChartDataPoint[]
  setShowResults:  Dispatch<SetStateAction<boolean>>
}

const acessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsZWlsYW55LnVsaXNzZXNAdGRzLmNvbXBhbnkiLCJ1aWQiOiI2NjdiMWJlZjIzYzY5ZTY2ZjM0MzYyYjciLCJyb2xlcyI6W10sIm5hbWUiOiJMZWlsYW55IFVsaXNzZXMiLCJleHAiOjE3NTEwMzczMjMsImlhdCI6MTc1MTAyMjkyM30.MYzbe85DjnXsd245XKphb6EXjmjYCYdnaPOQfO7S245VYdc2VSD6VXRXnRmYoxcBWHLZGcWy8yJNSmL0uQ-QMA"
export default function Index({ chartDataPoints, setShowResults }: Props) {
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

        setShowResults(false)

        
      // Se a chamada foi bem-sucedida, atualizar o estado
      setIsCollectionActive(false);
    } catch (error) {
      console.error("Erro ao parar a coleta:", error);
      // Aqui você pode adicionar notificação de erro se necessário
      alert("Erro ao parar a coleta. Tente novamente.");
    } finally {
      setIsStoppingCollection(false);
    }
  }, []);

  // Handlers para histórico
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


  const [isCollectionActive, setIsCollectionActive] = useState(true);
  const [isStoppingCollection, setIsStoppingCollection] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
  useState<ProcessedHistoricalCollection | null>(null);
const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

 // Function to process historical collections from backend format
 const processHistoricalCollections = useMemo(() => {
  const processed: ProcessedHistoricalCollection[] = [];

  Object.entries(mockHistoricalCollections).forEach(
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
      const endDate = lastPoint.updated_at;
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
        allIcpValues.reduce((sum, icp) => sum + icp, 0) / allIcpValues.length;

      // Determine status (simplified logic)
      let status: "completed" | "stopped" | "error" = "completed";
      if (durationMinutes < 30) {
        status = "stopped";
      } else if (averageIcp < 40) {
        status = "error";
      }

      processed.push({
        periodic_icpid: periodicIcpId,
        class_name: firstPoint.class_name,
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
}, []);

  const { chartData, allStudents, stats } = useChartDataStats(chartDataPoints, selectedStudents)

  // Estatísticas dos estudantes selecionados
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
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Dashboard ICP Escalável
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Análise de Performance para N Estudantes e M Pontos Temporais
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
              >
                {chartDataPoints[0]?.class_name}
              </Badge>

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
                  className="bozrder-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-900/20"
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
        </div>
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
                {stats.latestUpdate? format(new Date(stats.latestUpdate), "HH:mm", {
                  locale: ptBR,
                }): ""}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {stats.latestUpdate? format(new Date(stats.latestUpdate), "dd/MM/yyyy", {
                  locale: ptBR,
                }): ""}
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

        {/* ICP Classification Information Card */}
        <ICPLegend />
        {/* Historical Collections Section */}
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

                      <div className="grid grid-cols-1 gap-2 mt-3">
                        <div className="text-center p-1 bg-white/50 dark:bg-slate-800/50 rounded">
                          <div className="text-lg font-bold text-slate-900 dark:text-white">
                            {collection.student_count}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Alunos
                          </div>
                        </div>
                        <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded">
      
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
                      Coleta Histórica - {selectedHistoryItem.class_name}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {selectedHistoryItem.duration_minutes}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Minutos
                  </div>
                </div>
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
                        totalStudents={stats.totalStudents}
                      />
                    );
                  })()}
                </CardContent>
              </Card>

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
    </div>
  );
}
