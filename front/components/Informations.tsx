import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Class } from "@/types/dashboard"

interface InformationsStatsProps {
  informations: Class;
}

export const Informations: React.FC<InformationsStatsProps> = ({
  informations: informations
}) => {
  return (
    <div className={`grid grid-cols-1`}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-3.5l-.5-.5 3-3.5-3-3.5.5-.5"
                />
              </svg>
            </div>
            Informações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Jornada:
            </span>
            <Badge variant="outline" className="font-medium">
              {informations.journey_name}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Mapa:
            </span>
            <Badge variant="outline" className="font-medium">
              {informations.map_Name}
            </Badge>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};
