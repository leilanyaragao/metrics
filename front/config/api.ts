// Configurações da API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  ENDPOINTS: {
    // Endpoints para estudantes
    STUDENTS: "/students",
    STUDENT_BY_ID: (id: number) => `/students/${id}`,

    // Endpoints para mapas
    MAPS: "/maps",
    MAP_BY_ID: (id: number) => `/maps/${id}`,

    // Endpoints para análises ICP
    ICP_ANALYSIS: "/analysis/icp",
    ICP_RANGE: "/analysis/icp/range",
    ICP_PERIODIC: "/analysis/icp/periodic",
    ICP_HISTORY: "/analysis/icp/history",

    // Endpoints para análises IAE
    IAE_ANALYSIS: "/analysis/iae",
    IAE_RANGE: "/analysis/iae/range",
    IAE_PERIODIC: "/analysis/iae/periodic",
    IAE_HISTORY: "/analysis/iae/history",

    // Endpoints para configurações
    POINT_TYPES: "/config/point-types",
    PERIODS: "/config/periods",
  },
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  TIMEOUT: 10000, // 10 segundos
}

// Função para construir URL completa
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Função para adicionar token de autenticação (quando necessário)
export const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

  return {
    ...API_CONFIG.HEADERS,
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}
