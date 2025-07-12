import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import IAERangeHistorySection from "@/components/IAERangeHistorySection";
import {
  CircleDot,
  TriangleDot,
  SquareDot,
  CustomLegendContent,
} from "@/components/ChartShapes";
import { WeightsCard } from "@/app/WeightsCard";
import RangeMetricsCards from "./RangeMetricsCard";
import { SelectionPointsCard } from "@/app/SelectPointsCard";
import { Class, IAERange, IAERangeHistory, points_indexes } from "@/types/dashboard";
import { Informations } from "./Informations";

interface IAERangeSectionProps {
  iaeRangeResponse: IAERange,
}

// Transform data for chart (convert 0-1 range to 0-100)
const transformDataForChart = (data: IAERange) => {
  return data?.points_indexes?.map((point: points_indexes) => ({
    label: point.label,
    IAE: Math.round(point.iae * 100),
    TAP: Math.round(point.tap * 100),
    "TA-PROG": Math.round(point.ta_prog * 100),
  }));
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey}: ${entry.value}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};



const IAERangeSection = ({ iaeRangeResponse }: IAERangeSectionProps) => {
  console.log(iaeRangeResponse)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentChartData = transformDataForChart(iaeRangeResponse);

  const handleHistoryCardClick = (historyItem: any) => {
    setSelectedHistoryItem(historyItem);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedHistoryItem(null);
  };

  const selectedChartData = selectedHistoryItem
    ? transformDataForChart(selectedHistoryItem)
    : currentChartData;

  const myClass: Class = {
      journey_name: iaeRangeResponse?.journey_name,
      map_Name: iaeRangeResponse?.map_name,
    };

  return (
    <>
    <Informations informations={myClass} />
      {/* Current Chart Section */}
      <Card className="mb-8 shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900">
            Evolução das Métricas Range - Atual
          </CardTitle>
          <CardDescription className="text-slate-600">
            Visualização das três principais métricas ao longo dos pontos de
            avaliação atuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={currentChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  stroke="#64748B"
                  fontSize={12}
                  tick={{ fill: "#64748B" }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#64748B"
                  fontSize={12}
                  tick={{ fill: "#64748B" }}
                  label={{
                    value: "Percentual (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  content={<CustomLegendContent />}
                  wrapperStyle={{ paddingTop: "20px" }}
                />
                <Line
                  type="monotone"
                  dataKey="IAE"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={
                    <CircleDot
                      fill="#3B82F6"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      r={5}
                    />
                  }
                  activeDot={
                    <CircleDot
                      fill="#3B82F6"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      r={7}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="TAP"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={
                    <TriangleDot
                      fill="#10B981"
                      stroke="#10B981"
                      strokeWidth={2}
                      r={5}
                    />
                  }
                  activeDot={
                    <TriangleDot
                      fill="#10B981"
                      stroke="#10B981"
                      strokeWidth={2}
                      r={7}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="TA-PROG"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={
                    <SquareDot
                      fill="#F59E0B"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      r={5}
                    />
                  }
                  activeDot={
                    <SquareDot
                      fill="#F59E0B"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      r={7}
                    />
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>


      {/* Summary Stats */}
      <Card className="mb-8 shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">
            Resumo da Avaliação Range
          </CardTitle>
          <CardDescription className="text-slate-600">
            Informações sobre os dados coletados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600 mb-1">
                {iaeRangeResponse?.points_indexes?.length}
              </div>
              <div className="text-sm text-slate-600">Pontos Avaliados</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-brand-600 mb-1">
                {new Date(iaeRangeResponse?.start_date).toLocaleDateString("pt-BR")} -{" "}
                {new Date(iaeRangeResponse?.end_date).toLocaleDateString("pt-BR")}
              </div>
              <div className="text-sm text-slate-600">Período de Coleta</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CardContent className="space-y-4">
        <div>
          <SelectionPointsCard
            debate={iaeRangeResponse?.divergence_point}
            avaliacao={iaeRangeResponse?.essay_point}
            decisao={iaeRangeResponse?.convergence_point}
          />
        </div>


        <WeightsCard
          dynamicWeights={iaeRangeResponse?.dynamic_weights}
          weightX={iaeRangeResponse?.weight_tap}
          weightY={iaeRangeResponse?.weight_taprog}
          weightXName="Peso do TAP"
          weightXDescription="Avalia o abandono entre dois pontos consecutivos da jornada, com base nos alunos que participaram anteriormente."
          weightXAbbreviation="TAP"
          weightYName="Peso do TAprog"
          weightYDescription="Indica o percentual de alunos que deixaram de participar em cada ponto, com base no total de participantes ao longo da jornada."
          weightYAbbreviation="TAprog"
        />

        {/* Range Metrics Information Cards */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Entendendo as Métricas
            </h2>
            <p className="text-slate-600">
              Explicações detalhadas sobre cada métrica e suas interpretações
            </p>
          </div>
          <RangeMetricsCards data={iaeRangeResponse?.points_indexes} />
        </div>

      </CardContent>

      {/* Range Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-4xl h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Análise Histórica Range
                </h2>
                <p className="text-slate-600">
                  {selectedHistoryItem?.journey_name}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={closeSidebar}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Fechar
              </Button>
            </div>

            <div className="p-6">
              {/* Chart in Sidebar */}
              <Card className="mb-6 shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Evolução das Métricas
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {selectedHistoryItem?.journey_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={selectedChartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="label"
                          stroke="#64748B"
                          fontSize={12}
                          tick={{ fill: "#64748B" }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          stroke="#64748B"
                          fontSize={12}
                          tick={{ fill: "#64748B" }}
                          label={{
                            value: "Percentual (%)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          content={<CustomLegendContent />}
                          wrapperStyle={{ paddingTop: "20px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="IAE"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={
                            <CircleDot
                              fill="#3B82F6"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              r={5}
                            />
                          }
                          activeDot={
                            <CircleDot
                              fill="#3B82F6"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              r={7}
                            />
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="TAP"
                          stroke="#10B981"
                          strokeWidth={3}
                          dot={
                            <TriangleDot
                              fill="#10B981"
                              stroke="#10B981"
                              strokeWidth={2}
                              r={5}
                            />
                          }
                          activeDot={
                            <TriangleDot
                              fill="#10B981"
                              stroke="#10B981"
                              strokeWidth={2}
                              r={7}
                            />
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="TA-PROG"
                          stroke="#F59E0B"
                          strokeWidth={3}
                          dot={
                            <SquareDot
                              fill="#F59E0B"
                              stroke="#F59E0B"
                              strokeWidth={2}
                              r={5}
                            />
                          }
                          activeDot={
                            <SquareDot
                              fill="#F59E0B"
                              stroke="#F59E0B"
                              strokeWidth={2}
                              r={7}
                            />
                          }
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Summary */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Resumo da Avaliação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-600 mb-1">
                        {selectedHistoryItem?.points_indexes?.length || 0}
                      </div>
                      <div className="text-sm text-slate-600">
                        Pontos Avaliados
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-brand-600 mb-1">
                        {selectedHistoryItem?.start_date &&
                          selectedHistoryItem?.end_date
                          ? `${new Date(selectedHistoryItem.start_date).toLocaleDateString("pt-BR")} - ${new Date(selectedHistoryItem.end_date).toLocaleDateString("pt-BR")}`
                          : "Não definido"}
                      </div>
                      <div className="text-sm text-slate-600">
                        Período de Coleta
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IAERangeSection;
