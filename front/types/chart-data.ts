export interface User {
  user_id: string;
  user_name: string;
  user_average_gap: number;
  user_average_rpp: number;
  user_average_icp: number;
}

export interface ChartDataPoint {
  map_id: string;
  class_name: string;
  periodic_collection: boolean;
  class_average_gap: number;
  class_average_rpp: number;
  class_average_icp: number;
  participation_consistency_per_users: User[];
  periodic_icpid: string;
  user_id: string;
  active: boolean;
  id: string;
  version: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  ancestors: any[];
}

export interface ProcessedChartData {
  date: string;
  timestamp: number;
  class_average_icp: number;
  [key: string]: number | string; // Para dados dinâmicos dos alunos
}

// Raw structure from backend
export interface HistoricalCollectionsResponse {
  [periodic_icpid: string]: ChartDataPoint[];
}

// Processed structure for UI display
export interface ProcessedHistoricalCollection {
  periodic_icpid: string;
  class_name: string;
  start_date: string;
  end_date: string;
  duration_minutes: number;
  total_data_points: number;
  student_count: number;
  average_icp: number;
  data: ChartDataPoint[];
  status: "completed" | "stopped" | "error";
}
