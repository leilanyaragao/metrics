import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SelectionPointsCardProps {
  debate: boolean;
  avaliacao: boolean;
  decisao: boolean;
  className?: string;
}

export const SelectionPointsCard: React.FC<SelectionPointsCardProps> = ({
  debate,
  avaliacao,
  decisao,
  className,
}) => {
  const points = [
    { key: "debate", label: "Debate", selected: debate },
    { key: "avaliacao", label: "Avaliação", selected: avaliacao },
    { key: "decisao", label: "Decisão", selected: decisao },
  ];

  const selectedPoints = points.filter((point) => point.selected);
  const totalSelected = selectedPoints.length;

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
        className,
      )}
    >
      <CardHeader className="pb-4">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          Pontos Selecionados
        </CardTitle>
        <p className="text-sm text-slate-600">
          {totalSelected === 0
            ? "Nenhum ponto selecionado"
            : `${totalSelected} de 3 pontos selecionados`}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {totalSelected === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m2 0h4m4 0h4"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Nenhum ponto foi selecionado
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Os pontos aparecerão aqui quando estiverem disponíveis
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {selectedPoints.map((point, index) => (
              <div
                key={point.key}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium text-slate-800">
                    {point.label}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  Selecionado
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {totalSelected > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Total selecionado:</span>
              <Badge className="bg-blue-600 text-white">
                {totalSelected}/3 pontos
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
