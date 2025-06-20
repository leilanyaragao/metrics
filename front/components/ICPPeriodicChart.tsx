"use client";

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

interface Student {
  id: string;
  name: string;
  averageRPP: number;
  averageGAP: number;
  averageICP: number;
}

interface ICPPeriodicChartProps {
  selectedStudents: Student[];
  turmaAverage: number;
  getTimeLabels: () => string[];
  periodicidade: string;
}

// Cores para os estudantes
const studentColors = [
  "#10b981", // green-500
  "#ef4444", // red-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#84cc16", // lime-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
];

export function ICPPeriodicChart({
  selectedStudents,
  turmaAverage,
  getTimeLabels,
  periodicidade,
}: ICPPeriodicChartProps) {
  const timeLabels = getTimeLabels();

  // Criar dados do gráfico simulando variação temporal baseada no ICP base dos alunos
  const chartData = timeLabels.map((label, index) => {
    const dataPoint: any = {
      time: label,
      index: index,
      turma: turmaAverage,
    };

    // Para cada aluno selecionado, simular uma pequena variação ao longo do tempo
    selectedStudents.forEach((student) => {
      // Simular uma pequena variação natural (-2% a +2% do valor base)
      const variation = (Math.random() - 0.5) * 4;
      let value = parseFloat(student.averageICP.toString()) + variation;

      // Garantir que o valor não saia do range 0-100
      value = Math.max(0, Math.min(100, value));

      dataPoint[student.id] = value;
    });

    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
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
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        {payload.map((entry: any, index: number) => {
          const isClassAverage = entry.dataKey === "turma";
          const student = selectedStudents.find((s) => s.id === entry.dataKey);

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
                className={
                  isClassAverage
                    ? "text-gray-600"
                    : student &&
                        parseFloat(student.averageICP.toString()) > turmaAverage
                      ? "text-green-600"
                      : "text-red-600"
                }
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
        <div className="relative h-64 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm">
              Selecione alunos para visualizar o gráfico
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="relative h-80 bg-gray-50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              angle={timeLabels.length > 4 ? -45 : 0}
              textAnchor={timeLabels.length > 4 ? "end" : "middle"}
              height={timeLabels.length > 4 ? 60 : 30}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />

            {/* Linha da média da turma - sempre visível, tracejada */}
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

            {/* Linhas dos estudantes selecionados */}
            {selectedStudents.map((student, index) => {
              const color =
                parseFloat(student.averageICP.toString()) > turmaAverage
                  ? "#10b981"
                  : "#ef4444";

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
