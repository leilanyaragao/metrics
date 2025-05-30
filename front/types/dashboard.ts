// Interfaces para tipagem dos dados da API
export interface Student {
  id: number
  name: string
  email?: string
}

export interface Map {
  id: number
  name: string
  description?: string
  createdAt?: string
}

export interface ICPData {
  name: string
  icp: number
  color: string
  pattern?: string
}

export interface ICPTimeData {
  period: string
  date: string
  turma: number
  [studentName: string]: string | number
}

export interface IAEData {
  ponto: string
  GAP: number
  IAE: number
  RPP: number
}

export interface IAETimeData {
  period: string
  date: string
  GAP: number
  IAE: number
  RPP: number
}

export interface HistoryItem {
  id: number
  metric: "icp" | "iae"
  mapName: string
  analysisDate: string
  dateRange: {
    start: string
    end: string
  }
  pointTypes: string[]
  weights: {
    tap?: number
    taprog?: number
    gap?: number
    rpp?: number
    dynamic?: boolean
  }
  selectedStudent?: string
  results: any
}

export interface AnalysisConfig {
  metric: "icp" | "iae"
  collectionType: "range" | "periodic"
  startDate?: Date
  endDate?: Date
  mapId: string
  period?: string
  pointTypes: string[]
  weights: {
    tap?: number
    taprog?: number
    gap?: number
    rpp?: number
    dynamic?: boolean
  }
  selectedStudents?: string[]
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
