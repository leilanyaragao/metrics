import { ChartDataPoint, ProcessedChartData, User } from "@/types/chart-data";
import { Student } from "@/types/dashboard";
import { useMemo } from "react";

export function useChartDataStats(chartDataPoints:ChartDataPoint[], selectedStudents: Student[]) {
  const { chartData, allStudents, stats } = useMemo(() => {
    const studentsMap = new Map<string, User>();
    const classAverages: number[] = [];

    chartDataPoints.forEach((dataPoint) => {
      classAverages.push(dataPoint.class_average_icp);
      dataPoint.participation_consistency_per_users.forEach((user) => {
        if (!studentsMap.has(user.user_id)) {
          studentsMap.set(user.user_id, user);
        }
      });
    });

    const uniqueStudents = Array.from(studentsMap.values());

    // Processar dados para o gráfico de forma eficiente
    const processedData: ProcessedChartData[] = chartDataPoints.map(
      (dataPoint) => {
        const baseData: ProcessedChartData = {
          date: dataPoint.created_at,
          timestamp: new Date(dataPoint.created_at).getTime(),
          class_average_icp: dataPoint.class_average_icp,
        };

        // Adicionar dados de cada aluno para este ponto temporal
        dataPoint.participation_consistency_per_users.forEach((user) => {
          baseData[user.user_id] = user.user_average_icp;
        });

        return baseData;
      },
    );

    // Ordenar por timestamp uma única vez
    processedData.sort((a, b) => a.timestamp - b.timestamp);

    // Calcular estatísticas de forma eficiente
    const latestDataPoint = chartDataPoints[chartDataPoints.length - 1];
    const classAverage =
      classAverages.reduce((sum, avg) => sum + avg, 0) / classAverages.length;
    const minICP = Math.min(...classAverages);
    const maxICP = Math.max(...classAverages);

    return {
      chartData: processedData,
      allStudents: uniqueStudents,
      stats: {
        totalDataPoints: processedData.length,
        classAverage,
        minICP,
        maxICP,
        totalStudents: uniqueStudents.length,
        activeStudents:
          latestDataPoint?.participation_consistency_per_users.length ?? 0,
        latestUpdate: latestDataPoint?.created_at,
        selectedStudentsCount: selectedStudents.length,
        isLargeDataset:
          processedData.length > 100 || uniqueStudents.length > 50,
      },
    };
  }, [selectedStudents.length]);
  
  return { chartData, allStudents, stats }
}