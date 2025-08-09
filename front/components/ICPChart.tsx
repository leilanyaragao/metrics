import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProcessedChartData } from "../types/chart-data";
import { Student } from "@/types/dashboard";

interface ICPChartProps {
  data: ProcessedChartData[];
  selectedStudents: Student[];
  totalStudents: number
}

// Gerador de cores infinito usando HSL para garantir cores distintas
const generateColors = (count: number): string[] => {
  const colors: string[] = [];
  const goldenRatio = 0.618033988749895;
  let hue = Math.random(); // Começar com hue aleatório

  for (let i = 0; i < count; i++) {
    hue += goldenRatio;
    hue %= 1;
    // Usar saturação e luminosidade fixas para cores vibrantes e legíveis
    colors.push(`hsl(${Math.floor(hue * 360)}, 70%, 50%)`);
  }
  return colors;
};

export function ICPChart({ data, selectedStudents, totalStudents }: ICPChartProps) {
  // Detectar periodicidade baseado nos dados
  const periodicity = useMemo(() => {
    if (data.length < 2) return "minute";

    const firstDate = new Date(data[0].date);
    const secondDate = new Date(data[1].date);
    const diffMinutes =
      Math.abs(secondDate.getTime() - firstDate.getTime()) / (1000 * 60);

    if (diffMinutes <= 60) return "minute";
    if (diffMinutes <= 1440) return "hour";
    if (diffMinutes <= 10080) return "day";
    if (diffMinutes <= 43200) return "week";
    if (diffMinutes <= 525600) return "month";
    return "year";
  }, [data]);

  // Otimização: Amostragem de dados quando há muitos pontos (>100)
  const optimizedData = useMemo(() => {
    if (data.length <= 100) return data;

    // Para datasets grandes, mostrar apenas uma amostra representativa
    const sampleSize = 100;
    const step = Math.floor(data.length / sampleSize);
    const sampled = [];

    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i]);
    }

    // Sempre incluir o primeiro e último ponto
    if (sampled[0] !== data[0]) sampled.unshift(data[0]);
    if (sampled[sampled.length - 1] !== data[data.length - 1]) {
      sampled.push(data[data.length - 1]);
    }

    return sampled;
  }, [data]);

  // Cores dinâmicas para estudantes
  const studentColors = useMemo(() => {
    return generateColors(selectedStudents.length);
  }, [selectedStudents.length]);

  const getDateFormat = (detectedPeriod: string, dataLength: number) => {
    // Ajustar formato baseado na quantidade de pontos também
    const isLargeDataset = dataLength > 50;

    switch (detectedPeriod) {
      case "minute":
        return isLargeDataset ? "HH:mm" : "HH:mm:ss";
      case "hour":
        return isLargeDataset ? "HH'h'" : "dd/MM HH'h'";
      case "day":
        return isLargeDataset ? "dd/MM" : "dd/MM/yy";
      case "week":
        return isLargeDataset ? "dd/MM" : "'Sem' dd/MM";
      case "month":
        return isLargeDataset ? "MMM/yy" : "MMM yyyy";
      case "year":
        return "yyyy";
      default:
        return "HH:mm";
    }
  };

  const getTooltipFormat = (detectedPeriod: string) => {
    switch (detectedPeriod) {
      case "minute":
        return "dd/MM/yyyy 'às' HH:mm:ss";
      case "hour":
        return "dd/MM/yyyy 'às' HH'h'";
      case "day":
        return "dd/MM/yyyy";
      case "week":
        return "'Semana de' dd/MM/yyyy";
      case "month":
        return "MMMM 'de' yyyy";
      case "year":
        return "yyyy";
      default:
        return "dd/MM/yyyy 'às' HH:mm";
    }
  };

  const formatXAxisLabel = (tickItem: string) => {
    try {
      const date = new Date(tickItem);
      return format(date, getDateFormat(periodicity, data.length), {
        locale: ptBR,
      });
    } catch {
      return tickItem;
    }
  };

  const formatTooltipLabel = (label: string) => {
    try {
      const date = new Date(label);
      return format(date, getTooltipFormat(periodicity), { locale: ptBR });
    } catch {
      return label;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-w-sm">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
            {formatTooltipLabel(label)}
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: entry.color }}
                    title={entry.name}
                  >
                    {entry.name.length > 20
                      ? `${entry.name.substring(0, 20)}...`
                      : entry.name}
                  </span>
                </div>
                <span className="text-sm font-bold ml-2 flex-shrink-0">
                  {entry.value.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
          {payload.length > 5 && (
            <p className="text-xs text-slate-500 mt-2 border-t pt-2">
              +{payload.length - 5} outros...
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;

    // Mostrar apenas os primeiros itens se há muitos
    const displayItems = payload.slice(0, 8);
    const hasMore = payload.length > 8;

    return (
      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div className="flex flex-wrap gap-2 justify-center">
          {displayItems.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-4 h-0.5 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-24">
                {entry.value.length > 15
                  ? `${entry.value.substring(0, 15)}...`
                  : entry.value}
              </span>
            </div>
          ))}
          {hasMore && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              +{payload.length - 8} outros
            </div>
          )}
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="text-center">
          <div className="text-slate-400 mb-2">📊</div>
          <p className="text-slate-600 dark:text-slate-400">
            Nenhum dado disponível
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={optimizedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200 dark:stroke-slate-700"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisLabel}
                className="text-slate-600 dark:text-slate-400"
                tick={{ fontSize: 12 }}
                angle={data.length > 20 ? -45 : 0}
                textAnchor={data.length > 20 ? "end" : "middle"}
                height={data.length > 20 ? 60 : 40}
                interval={data.length > 50 ? "preserveStartEnd" : 0}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                className="text-slate-600 dark:text-slate-400"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />

              {/* Linha da média da turma - sempre visível */}
              <Line
                type="monotone"
                dataKey="class_average_icp"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={
                  data.length > 50
                    ? false
                    : { fill: "#8b5cf6", strokeWidth: 2, r: 4 }
                }
                activeDot={{
                  r: 6,
                  stroke: "#8b5cf6",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
                name="Média da Turma"
              />

              {/* Linhas dos estudantes selecionados */}
              {selectedStudents.map((student, index) => (
                <Line
                  key={student.id}
                  type="monotone"
                  dataKey={student.id}
                  stroke={studentColors[index] || student.color}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={
                    data.length > 50
                      ? false
                      : {
                          fill: studentColors[index] || student.color,
                          strokeWidth: 2,
                          r: 3,
                        }
                  }
                  activeDot={{
                    r: 5,
                    stroke: studentColors[index] || student.color,
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                  name={student.name}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Informações do gráfico */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-slate-600 dark:text-slate-400">
            <div className="font-medium">
              Periodicidade:{" "}
              {periodicity === "minute"
                ? "Por Minuto"
                : periodicity === "hour"
                  ? "Por Hora"
                  : periodicity === "day"
                    ? "Por Dia"
                    : periodicity === "week"
                      ? "Por Semana"
                      : periodicity === "month"
                        ? "Por Mês"
                        : "Por Ano"}
            </div>
            <div className="text-xs mt-1">
              {data.length} pontos de dados{" "}
              {optimizedData.length !== data.length &&
                `(${optimizedData.length} exibidos)`}
            </div>
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            <div className="font-medium">
              {selectedStudents.length} aluno
              {selectedStudents.length !== 1 ? "s" : ""} selecionado
              {selectedStudents.length !== 1 ? "s" : ""}
            </div>
            <div className="text-xs mt-1">
              de {totalStudents} disponíveis
            </div>
          </div>
        </div>

        {data.length > 100 && (
          <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-300">
            ⚡ Dataset grande detectado. Mostrando amostra otimizada para
            performance.
          </div>
        )}
      </div>
    </div>
  );
}
