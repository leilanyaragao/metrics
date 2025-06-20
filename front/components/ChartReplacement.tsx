import React from "react";
import { AdaptedICPChart } from "./AdaptedICPChart";
import { AdaptedICPComparison } from "./AdaptedICPComparison";

// Exemplo de como usar os componentes para substituir o código SVG manual

interface ChartReplacementProps {
  selectedStudents: Array<{
    id: string;
    name: string;
    averageICP: number;
  }>;
  turmaAverage: number;
  getTimeLabels: () => string[];
  timeInterval: string;
  activeMetric: string;
  collectionType: string;
  currentHistoryItem?: { result: number };
}

export function ChartReplacement({
  selectedStudents,
  turmaAverage,
  getTimeLabels,
  timeInterval,
  activeMetric,
  collectionType,
  currentHistoryItem,
}: ChartReplacementProps) {
  return (
    <>
      {/* Substitui o gráfico SVG manual */}
      {activeMetric === "ICP" && collectionType === "periodic" && (
        <AdaptedICPChart
          selectedStudents={selectedStudents}
          turmaAverage={turmaAverage}
          getTimeLabels={getTimeLabels}
          timeInterval={timeInterval}
        />
      )}

      {/* Substitui a comparação de barras */}
      {activeMetric === "ICP" && collectionType === "range" && (
        <AdaptedICPComparison
          selectedStudents={selectedStudents}
          turmaAverage={turmaAverage}
          currentResult={currentHistoryItem?.result || turmaAverage}
        />
      )}
    </>
  );
}

// INSTRUÇÕES PARA USAR:
// 1. Importe: import { AdaptedICPChart } from "./components/AdaptedICPChart";
// 2. Substitua o SVG manual pelo componente AdaptedICPChart
// 3. Substitua as barras pelo componente AdaptedICPComparison
