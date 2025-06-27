export interface UserParticipation {
    user_id: string;
    user_name: string;
    user_average_gap: number;
    user_average_rpp: number;
    user_average_icp: number;
  }
  
  export interface DashboardData {
    map_id: string;
    class_name: string;
    periodic_collection: boolean;
    class_average_gap: number;
    class_average_rpp: number;
    class_average_icp: number;
    participation_consistency_per_users: UserParticipation[];
    periodic_icpid: string | null;
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
  
  export interface ICPLevel {
    min: number;
    max: number;
    label: string;
    description: string;
    color: string;
  }

  export interface HistoryItem {
    map_id: string;
    journey_name: string;
    class_name: string;
    periodic_collection: boolean;
    class_average_gap: number;
    class_average_rpp: number;
    class_average_icp: number;
    participation_consistency_per_users: UserParticipation[];
    periodic_icpid: string | null;
    user_id: string;
    id: string;
    version: number;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
    ancestors: any[];
    start_date: string;
    end_date: string;
    weight_gap: number;
    weight_rpp: number;
    divergence_point: boolean;
    essay_point: boolean;
    convergence_point: boolean;
  }

  export interface Class {
    journey_name: string,
    class_name: string,
  }

  export interface Student {
    id: string
    name: string
    averageRPP?: number
    averageGAP?: number
    averageICP?: number
    color?: string
  }

  export interface AnalysisHistory {
    id: string
    journey: any
    map: any
    date: string
    period: string
    result: number
    type: "ICP" | "IAE"
    collectionType: "range" | "periodica"
    periodicidade?: string
    students: Student[]
  }