import React from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdaptedICPComparisonProps {
  selectedStudents: Array<{
    id: string;
    name: string;
    averageICP: number;
  }>;
  turmaAverage: number;
  currentResult?: number;
}

export function AdaptedICPComparison({
  selectedStudents,
  turmaAverage,
  currentResult = turmaAverage,
}: AdaptedICPComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-4 h-4" />
          Comparação de ICP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Class average */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Turma</span>
            <span className="text-sm font-bold">
              {currentResult.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-purple-500"
              style={{ width: `${Math.min(100, currentResult)}%` }}
            />
          </div>
        </div>

        {/* Selected students */}
        {selectedStudents.map((student) => {
          const difference = student.averageICP - currentResult;
          const isAboveAverage = student.averageICP > currentResult;

          return (
            <div key={student.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{student.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {student.averageICP.toFixed(1)}%
                  </span>
                  <span
                    className={`text-xs ${
                      isAboveAverage
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    ({isAboveAverage ? "+" : ""}
                    {difference.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isAboveAverage ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(100, student.averageICP)}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Summary stats if multiple students */}
        {selectedStudents.length > 1 && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {
                    selectedStudents.filter((s) => s.averageICP > currentResult)
                      .length
                  }
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Acima da média
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {
                    selectedStudents.filter(
                      (s) => s.averageICP <= currentResult,
                    ).length
                  }
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Abaixo da média
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
