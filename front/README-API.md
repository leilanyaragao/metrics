# Configuração da API para o Dashboard de Métricas

Este documento explica como configurar e integrar o dashboard com sua API backend.

## 📁 Estrutura de Arquivos

\`\`\`
dashboard/
├── types/dashboard.ts          # Interfaces TypeScript
├── config/api.ts              # Configurações da API
├── hooks/useApi.ts            # Hooks para requisições
├── hooks/useDashboard.ts      # Hooks específicos do dashboard
├── services/dashboardService.ts # Serviços da API
└── dashboard.tsx              # Componente principal
\`\`\`

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

\`\`\`bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
\`\`\`

### 2. Endpoints da API

Os endpoints estão configurados em `config/api.ts`:

\`\`\`typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  ENDPOINTS: {
    // Estudantes
    STUDENTS: '/students',
    STUDENT_BY_ID: (id: number) => `/students/${id}`,
    
    // Mapas
    MAPS: '/maps',
    MAP_BY_ID: (id: number) => `/maps/${id}`,
    
    // Análises ICP
    ICP_ANALYSIS: '/analysis/icp',
    ICP_RANGE: '/analysis/icp/range',
    ICP_PERIODIC: '/analysis/icp/periodic',
    ICP_HISTORY: '/analysis/icp/history',
    
    // Análises IAE
    IAE_ANALYSIS: '/analysis/iae',
    IAE_RANGE: '/analysis/iae/range',
    IAE_PERIODIC: '/analysis/iae/periodic',
    IAE_HISTORY: '/analysis/iae/history',
    
    // Configurações
    POINT_TYPES: '/config/point-types',
    PERIODS: '/config/periods',
  }
}
\`\`\`

## 🚀 Implementação da API

### 1. Ativar Chamadas Reais

No arquivo `services/dashboardService.ts`, descomente as implementações reais e comente as mockadas:

\`\`\`typescript
async getStudents(): Promise<Student[]> {
  // Comentar implementação mockada:
  // return [...]
  
  // Descomentar implementação real:
  const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STUDENTS), {
    headers: getAuthHeaders(),
  })
  const result: ApiResponse<Student[]> = await response.json()
  return result.data
}
\`\`\`

### 2. Estrutura de Resposta da API

Todas as respostas devem seguir o padrão:

\`\`\`typescript
interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}
\`\`\`

### 3. Endpoints Necessários

#### GET `/students`
\`\`\`json
{
  "data": [
    {
      "id": 1,
      "name": "Ana Silva",
      "email": "ana@email.com"
    }
  ],
  "success": true
}
\`\`\`

#### GET `/maps`
\`\`\`json
{
  "data": [
    {
      "id": 1,
      "name": "Mapa Conceitual 1",
      "description": "Primeiro mapa conceitual"
    }
  ],
  "success": true
}
\`\`\`

#### POST `/analysis/icp/range`
\`\`\`json
// Request body:
{
  "metric": "icp",
  "collectionType": "range",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "mapId": "1",
  "pointTypes": ["Avaliação", "Debate"],
  "weights": {
    "tap": 0.5,
    "taprog": 0.5
  },
  "selectedStudents": ["Ana Silva"]
}

// Response:
{
  "data": [
    {
      "name": "Turma",
      "icp": 75.4,
      "color": "#1e3a8a",
      "pattern": "diagonal"
    },
    {
      "name": "Ana Silva",
      "icp": 82.7,
      "color": "#ea580c",
      "pattern": "dots"
    }
  ],
  "success": true
}
\`\`\`

#### POST `/analysis/icp/periodic`
\`\`\`json
// Response:
{
  "data": [
    {
      "period": "01/01 - 07/01",
      "date": "07/01/2024",
      "turma": 70.2,
      "Ana Silva": 75.4,
      "Bruno Santos": 68.1
    }
  ],
  "success": true
}
\`\`\`

#### POST `/analysis/iae/range`
\`\`\`json
// Response:
{
  "data": [
    {
      "ponto": "Point 1",
      "GAP": 0,
      "IAE": 0,
      "RPP": 0
    },
    {
      "ponto": "Point 2",
      "GAP": 15,
      "IAE": 12,
      "RPP": 8
    }
  ],
  "success": true
}
\`\`\`

#### GET `/config/point-types`
\`\`\`json
{
  "data": ["Avaliação", "Debate", "Decisão"],
  "success": true
}
\`\`\`

#### GET `/config/periods`
\`\`\`json
{
  "data": [
    { "value": "weekly", "label": "Semanal" },
    { "value": "monthly", "label": "Mensal" },
    { "value": "yearly", "label": "Anual" }
  ],
  "success": true
}
\`\`\`

## 🔐 Autenticação

Se sua API requer autenticação, configure o token em `config/api.ts`:

\`\`\`typescript
export const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  
  return {
    ...API_CONFIG.HEADERS,
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}
\`\`\`

## 🎯 Estados de Loading e Error

O dashboard já possui tratamento completo de:

- ✅ Loading states
- ✅ Error handling
- ✅ Retry mechanisms
- ✅ Timeout handling

## 📝 Próximos Passos

1. **Configure suas variáveis de ambiente**
2. **Implemente os endpoints no seu backend**
3. **Descomente as implementações reais no `dashboardService.ts`**
4. **Teste as integrações**
5. **Configure autenticação se necessário**

## 🔄 Migração Gradual

Você pode migrar gradualmente:

1. Comece com um endpoint (ex: `/students`)
2. Teste e valide
3. Migre o próximo endpoint
4. Repita até completar todos

O sistema foi projetado para funcionar com dados mockados enquanto você implementa a API real.
