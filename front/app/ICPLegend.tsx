import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ICPLevel } from "@/types/dashboard";

const icpLevels: ICPLevel[] = [
  {
    min: 1.0,
    max: 1.0,
    label: "Excelente",
    description: " Participação excelente e sem lacunas.",
    color: "bg-green-600",
  },
  {
    min: 0.81,
    max: 0.99,
    label: "Boa",
    description: "Participação boa, com pequenas variações.",
    color: "bg-yellow-500",
  },
  {
    min: 0.51,
    max: 0.79,
    label: "Irregular",
    description: "Participação irregular, com lacunas significativas.",
    color: "bg-orange-500",
  },
  {
    min: 0.0,
    max: 0.5,
    label: "Baixa",
    description: "Participação baixa ou esporádica, requer atenção.",
    color: "bg-red-500",
  },
];

interface ICPLegendProps {
  className?: string;
}

export const ICPLegend: React.FC<ICPLegendProps> = ({ className }) => {
  const formatRange = (level: ICPLevel) => {
    if (level.min === level.max) {
      return `${level.min.toFixed(1)}`;
    }
    return `${level.min.toFixed(1)} - ${level.max.toFixed(1)}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          Entendendo o Índice de Consistência de Participação (ICP)
        </CardTitle>
        <p className="text-sm text-slate-600">
        Avalia o engajamento dos alunos em jornadas educacionais, considerando tanto a regularidade quanto a abrangência das participações ao longo do tempo.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {icpLevels.map((level, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={`w-3 h-3 rounded-full ${level.color}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-800">
                    {level.label}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {formatRange(level)}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {level.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Comparação no Gráfico
          </h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Verde: ICP do aluno acima da média da turma</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Vermelho: ICP do aluno abaixo da média da turma</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span>Roxo: Média da turma</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
