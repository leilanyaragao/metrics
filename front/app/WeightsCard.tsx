import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WeightsCardProps {
  dynamicWeights: boolean;
  weightX: number;
  weightY: number;
  className?: string;
  // Configurações dinâmicas dos pesos
  weightXName: string;
  weightXDescription: string;
  weightXAbbreviation: string;
  weightYName: string;
  weightYDescription: string;
  weightYAbbreviation: string;
}

export const WeightsCard: React.FC<WeightsCardProps> = ({
  dynamicWeights,
  weightX,
  weightY,
  className,
  weightXName,
  weightXDescription,
  weightXAbbreviation,
  weightYName,
  weightYDescription,
  weightYAbbreviation,
}) => {
  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200",
        className,
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3-1l-3-1"
              />
            </svg>
          </div>
          Configuração de Pesos
        </CardTitle>
        <p className="text-sm text-slate-600">
          {dynamicWeights
            ? "Pesos calculados dinamicamente"
            : "Pesos configurados manualmente"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {dynamicWeights ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-slate-800 mb-2">
              Pesos Dinâmicos
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Os pesos foram dinamicamente selecionados pelo sistema baseado nos
              dados da turma
            </p>
            <div className="mt-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-700 font-medium">
                ⚡ Cálculo automático ativo
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </div>
              <p className="text-base font-medium text-slate-800">
                Pesos Configurados
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Weight X */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {weightXAbbreviation}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{weightXName}</p>
                    <p className="text-xs text-slate-500">
                      {weightXDescription}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                  >
                    {weightX.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              {/* Weight Y */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">
                      {weightYAbbreviation}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{weightYName}</p>
                    <p className="text-xs text-slate-500">
                      {weightYDescription}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 font-semibold"
                  >
                    {weightY.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Validation */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-amber-700">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">
                  Total: {(weightX + weightY).toFixed(1)}%
                </span>            
                
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
