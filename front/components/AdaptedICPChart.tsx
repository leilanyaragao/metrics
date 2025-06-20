import React from "react";
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

interface AdaptedICPChartProps {
  selectedStudents: Array<{
    id: string;
    name: string;
    averageICP: number;
    color?: string;
  }>;
  turmaAverage: number;
  getTimeLabels: () => string[];
  timeInterval: string;
}

export function AdaptedICPChart({
  selectedStudents,
  turmaAverage,
  getTimeLabels,
  timeInterval,
}: AdaptedICPChartProps) {
  // Generate sample data points based on time labels
  const timeLabels = getTimeLabels();

  // Create chart data with class average and student data
  const chartData = timeLabels.map((label, index) => {
    const dataPoint: any = {
      time: label,
      index: index,
      turma: turmaAverage,
    };

    // Add each selected student's data
    selectedStudents.forEach((student) => {
      // Simulate slight variation around their average for visualization
      const variation = (Math.random() - 0.5) * 2; // ±1% variation
      dataPoint[student.id] = Math.max(
        0,
        Math.min(100, student.averageICP + variation),
      );
    });

    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            {label}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: entry.color }}
                  >
                    {entry.dataKey === "turma"
                      ? "Média da Turma"
                      : selectedStudents.find((s) => s.id === entry.dataKey)
                          ?.name || entry.dataKey}
                  </span>
                </div>
                <span className="text-sm font-bold ml-2">
                  {entry.value.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs">
        {payload.map((entry: any, index: number) => {
          const isClassAverage = entry.dataKey === "turma";
          const student = selectedStudents.find((s) => s.id === entry.dataKey);
          const value = isClassAverage ? turmaAverage : student?.averageICP;

          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-4 h-0.5 ${isClassAverage ? "border-dashed border-2" : ""}`}
                style={{
                  backgroundColor: entry.color,
                  borderColor: isClassAverage ? entry.color : "transparent",
                }}
              />
              <span
                className={`${
                  isClassAverage
                    ? "text-gray-600"
                    : value && value > turmaAverage
                      ? "text-green-600"
                      : "text-red-600"
                }`}
              >
                {isClassAverage
                  ? `Turma (${turmaAverage}%)`
                  : `${student?.name} (${student?.averageICP}%)`}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (selectedStudents.length === 0) {
    return (
      <div className="mt-6">
        <div className="relative h-64 bg-gray-50 dark:bg-slate-800 rounded-lg p-4 flex items-center justify-center">
          <div className="text-center text-slate-500 dark:text-slate-400">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm">
              Selecione alunos para visualizar o gráfico comparativo
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="relative h-80 bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="dark:stroke-slate-600"
            />
            <XAxis
              dataKey="time"
              className="text-slate-600 dark:text-slate-400"
              tick={{ fontSize: 12 }}
              angle={timeLabels.length > 4 ? -45 : 0}
              textAnchor={timeLabels.length > 4 ? "end" : "middle"}
              height={timeLabels.length > 4 ? 60 : 30}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              className="text-slate-600 dark:text-slate-400"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />

            {/* Class average line - always visible with dashed style */}
            <Line
              type="monotone"
              dataKey="turma"
              stroke="#6b7280"
              strokeWidth={3}
              strokeDasharray="8 4"
              dot={{ fill: "#6b7280", strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: "#6b7280",
                strokeWidth: 2,
                fill: "#fff",
              }}
            />

            {/* Selected students lines */}
            {selectedStudents.map((student, index) => {
              const color =
                student.averageICP > turmaAverage ? "#10b981" : "#ef4444";

              return (
                <Line
                  key={student.id}
                  type="monotone"
                  dataKey={student.id}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 3 }}
                  activeDot={{
                    r: 5,
                    stroke: color,
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
