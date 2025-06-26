import React, { useState, useEffect } from "react";
import { HistoryCard } from "./HistoryCard";
import { HistoryItem } from "@/types/dashboard";
import axios from "axios"

interface HistoryProps {
  onSelectItem: (item: HistoryItem) => void;
}

const acessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsZWlsYW55LnVsaXNzZXNAdGRzLmNvbXBhbnkiLCJ1aWQiOiI2NjdiMWJlZjIzYzY5ZTY2ZjM0MzYyYjciLCJyb2xlcyI6W10sIm5hbWUiOiJMZWlsYW55IFVsaXNzZXMiLCJleHAiOjE3NTA2NTg2ODMsImlhdCI6MTc1MDY0NDI4M30.z4Pc-7bney3rXNnKd21zPOeHSJx5JDFznyiB6Wq9hkDvroY9iwy4KvBMp_FotGPNhWiNKn1e9SOlAlQxNT6E-g"


export const History: React.FC<HistoryProps> = ({ onSelectItem }) => {
  // Estados para o histórico
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Função para buscar dados do histórico
  const fetchHistoryData = async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await axios.get("http://localhost:8095/v1/metrics/icp/periodic/in-progress",
        { headers: { Authorization: `Bearer ${acessToken}` } })


      const apiData = await response.data();

      // Transform API data to dashboard format
      const transformedData: HistoryItem[] = apiData.map((item: any) => {
        // Calculate averages from points_indexes
        const totalPoints = item.points_indexes?.length || 0;
        const avgIae =
          totalPoints > 0
            ? item.points_indexes.reduce(
                (sum: number, point: any) => sum + point.iae,
                0,
              ) / totalPoints
            : 0;
        const avgTaProg =
          totalPoints > 0
            ? item.points_indexes.reduce(
                (sum: number, point: any) => sum + point.ta_prog,
                0,
              ) / totalPoints
            : 0;
        const avgTap =
          totalPoints > 0
            ? item.points_indexes.reduce(
                (sum: number, point: any) => sum + point.tap,
                0,
              ) / totalPoints
            : 0;

        return {
          map_id: item.map_id,
          class_name: `${item.journey_name} - ${item.class_name}`,
          class_average_gap: avgTap,
          class_average_rpp: avgTaProg,
          class_average_icp: avgIae * 100, // Convert to 0-100 scale
          participation_consistency_per_users: [
            {
              user_id: item.user_id,
              user_name: "Usuário",
              user_average_gap: avgTap,
              user_average_rpp: avgTaProg,
              user_average_icp: avgIae * 100,
            },
          ],
          periodic_icpid: item.periodic_iaeid,
          user_id: item.user_id,
          id: item.id,
          version: item.version,
          created_at: item.created_at,
          created_by: item.created_by,
          updated_at: item.updated_at,
          updated_by: item.updated_by,
          ancestors: item.ancestors || [],
          startDate: item.start_date,
          endDate: item.end_date_time,
          debate: item.divergence_point,
          avaliacao: item.essay_point,
          decisao: item.convergence_point,
          dynamic_weights: item.dynamic_weights,
          weight_gap: item.weight_tap || 0.5,
          weight_rpp: item.weight_taprog || 0.5,
        };
      });

      setHistoryData(transformedData);
    } catch (error) {
      console.error("Failed to fetch history data:", error);
      setHistoryError(
        error instanceof Error ? error.message : "Erro ao carregar histórico",
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    fetchHistoryData();
  }, []);

  return (
    <div className="mt-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Histórico de Turmas
        </h2>
        <p className="text-slate-600">
          Visualize e compare dados históricos de diferentes turmas
        </p>
      </div>

      <HistoryCard
        historyItems={historyData}
        onSelectItem={onSelectItem}
        className="w-full"
        isLoading={isHistoryLoading}
      />

      {/* Show error message if history failed to load */}
      {historyError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">Erro ao carregar histórico</span>
          </div>
          <p className="mt-1 text-sm text-red-600">{historyError}</p>
          <button
            onClick={fetchHistoryData}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded border border-red-300 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
};
