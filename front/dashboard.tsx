"use client"

import { useState } from "react"
import {
  Calendar,
  BarChart3,
  TrendingUp,
  Settings,
  Play,
  Info,
  Check,
  ChevronsUpDown,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

// Importar hooks e tipos
import { useDashboardData, useAnalysis, useHistory } from "./hooks/useDashboard"
import type { AnalysisConfig } from "./types/dashboard"

// Adicionar após os imports, antes do componente Dashboard
const IAELegend = ({
  visible,
  position,
  data,
}: {
  visible: boolean
  position: { x: number; y: number }
  data: any
}) => {
  if (!visible || !data) return null

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: "translateY(-100%)",
      }}
    >
      <div className="font-semibold text-gray-800 mb-2 border-b pb-1">{data.period || data.ponto}</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="font-medium text-amber-700">GAP:</span>
          <span className="font-bold">{data.GAP}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="font-medium text-emerald-700">IAE:</span>
          <span className="font-bold">{data.IAE}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <span className="font-medium text-indigo-700">RPP:</span>
          <span className="font-bold">{data.RPP}%</span>
        </div>
      </div>
      <div className="mt-2 pt-1 border-t text-xs text-gray-500">Clique para mais detalhes</div>
    </div>
  )
}

interface WeightSliderProps {
  label1: string
  label2: string
  value1: number
  value2: number
  onChange: (value1: number, value2: number) => void
  tooltip1?: string
  tooltip2?: string
}

function WeightSlider({ label1, label2, value1, value2, onChange, tooltip1, tooltip2 }: WeightSliderProps) {
  const handleValue1Change = (newValue: number[]) => {
    const val1 = newValue[0] / 100
    const val2 = 1 - val1
    onChange(val1, val2)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">{label1}</Label>
            {tooltip1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip1}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Badge variant="secondary">{(value1 * 100).toFixed(0)}%</Badge>
        </div>
        <Slider value={[value1 * 100]} onValueChange={handleValue1Change} max={100} step={1} className="w-full" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">{label2}</Label>
            {tooltip2 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip2}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Badge variant="secondary">{(value2 * 100).toFixed(0)}%</Badge>
        </div>
        <Slider
          value={[value2 * 100]}
          onValueChange={(newValue) => {
            const val2 = newValue[0] / 100
            const val1 = 1 - val2
            onChange(val1, val2)
          }}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
      <div className="text-xs text-muted-foreground text-center">Total: {((value1 + value2) * 100).toFixed(0)}%</div>
    </div>
  )
}

// Componente para seleção múltipla de alunos
interface MultiSelectProps {
  options: { id: number; name: string }[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
}

function MultiSelect({ options, selected, onSelectionChange, placeholder = "Selecione os alunos" }: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (studentName: string) => {
    if (selected.includes(studentName)) {
      onSelectionChange(selected.filter((s) => s !== studentName))
    } else {
      onSelectionChange([...selected, studentName])
    }
  }

  const removeStudent = (studentName: string) => {
    onSelectionChange(selected.filter((s) => s !== studentName))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            {selected.length === 0 ? placeholder : `${selected.length} aluno(s) selecionado(s)`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar aluno..." />
            <CommandList>
              <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((student) => (
                  <CommandItem key={student.id} onSelect={() => handleSelect(student.name)}>
                    <Check
                      className={cn("mr-2 h-4 w-4", selected.includes(student.name) ? "opacity-100" : "opacity-0")}
                    />
                    {student.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Tags dos alunos selecionados */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((studentName) => (
            <Badge key={studentName} variant="secondary" className="text-xs">
              {studentName}
              <button onClick={() => removeStudent(studentName)} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// Tooltip customizado para o gráfico de linha ICP periódico
const ICPPeriodicTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg text-sm min-w-[200px]">
        <p className="font-semibold text-gray-800 mb-3 text-center border-b pb-2">{data?.date || label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-700 font-medium">
                  {entry.dataKey === "turma" ? "Média da Turma" : entry.dataKey}
                </span>
              </div>
              <span className="font-bold text-lg" style={{ color: entry.color }}>
                {entry.value?.toFixed(1) || 0}%
              </span>
            </div>
          ))}
        </div>
        {payload.length > 1 && (
          <div className="mt-3 pt-2 border-t">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Diferença:</span>
              <span className="font-semibold">
                {payload.length === 2
                  ? `${Math.abs(payload[1].value - payload[0].value).toFixed(1)}%`
                  : "Múltiplos valores"}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}

// Tooltip customizado para IAE
const IAETooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md text-sm">
        <p className="font-medium text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          let dotColor = "#000"
          if (entry.dataKey === "GAP") dotColor = "#f59e0b"
          if (entry.dataKey === "IAE") dotColor = "#10b981"
          if (entry.dataKey === "RPP") dotColor = "#6366f1"

          return (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dotColor }} />
              <span className="font-medium" style={{ color: dotColor }}>
                {entry.dataKey}:
              </span>
              <span className="font-bold">{entry.value}%</span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

// Adicionar esta função após as definições de tooltips e antes do componente Dashboard
const getIAEPeriodicData = (selectedPeriod: string) => {
  if (selectedPeriod === "weekly") {
    return [
      { period: "07/01", date: "07/01/2024", GAP: 0, IAE: 0, RPP: 0 },
      { period: "14/01", date: "14/01/2024", GAP: 15, IAE: 12, RPP: 8 },
      { period: "21/01", date: "21/01/2024", GAP: 20, IAE: 18, RPP: 15 },
      { period: "28/01", date: "28/01/2024", GAP: 18, IAE: 28, RPP: 25 },
      { period: "04/02", date: "04/02/2024", GAP: 30, IAE: 35, RPP: 38 },
    ]
  } else if (selectedPeriod === "monthly") {
    return [
      { period: "Jan/24", date: "31/01/2024", GAP: 0, IAE: 0, RPP: 0 },
      { period: "Fev/24", date: "29/02/2024", GAP: 15, IAE: 12, RPP: 8 },
      { period: "Mar/24", date: "31/03/2024", GAP: 20, IAE: 18, RPP: 15 },
      { period: "Abr/24", date: "30/04/2024", GAP: 18, IAE: 28, RPP: 25 },
      { period: "Mai/24", date: "31/05/2024", GAP: 30, IAE: 35, RPP: 38 },
    ]
  } else if (selectedPeriod === "yearly") {
    return [
      { period: "2020", date: "31/12/2020", GAP: 0, IAE: 0, RPP: 0 },
      { period: "2021", date: "31/12/2021", GAP: 15, IAE: 12, RPP: 8 },
      { period: "2022", date: "31/12/2022", GAP: 20, IAE: 18, RPP: 15 },
      { period: "2023", date: "31/12/2023", GAP: 18, IAE: 28, RPP: 25 },
      { period: "2024", date: "31/12/2024", GAP: 30, IAE: 35, RPP: 38 },
    ]
  }

  // Default para semanal
  return [
    { period: "07/01", date: "07/01/2024", GAP: 0, IAE: 0, RPP: 0 },
    { period: "14/01", date: "14/01/2024", GAP: 15, IAE: 12, RPP: 8 },
    { period: "21/01", date: "21/01/2024", GAP: 20, IAE: 18, RPP: 15 },
    { period: "28/01", date: "28/01/2024", GAP: 18, IAE: 28, RPP: 25 },
    { period: "04/02", date: "04/02/2024", GAP: 30, IAE: 35, RPP: 38 },
  ]
}

export default function Dashboard() {
  // Estados do dashboard
  const [activeMetric, setActiveMetric] = useState<"icp" | "iae">("icp")
  const [collectionType, setCollectionType] = useState<"range" | "periodic">("range")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedMap, setSelectedMap] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [pointTypes, setPointTypes] = useState<string[]>([])
  const [dynamicWeight, setDynamicWeight] = useState(true)
  const [gapWeight, setGapWeight] = useState(0.5)
  const [rppWeight, setRppWeight] = useState(0.5)
  const [tapWeight, setTapWeight] = useState(0.5)
  const [taprogWeight, setTaprogWeight] = useState(0.5)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedStudentRange, setSelectedStudentRange] = useState("")

  // Adicionar estes estados no componente Dashboard, após os outros estados
  const [hoveredPoint, setHoveredPoint] = useState<any>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showLegend, setShowLegend] = useState(false)

  // Hooks para dados da API
  const {
    students,
    maps,
    pointTypes: availablePointTypes,
    periods,
    loading: dataLoading,
    error: dataError,
  } = useDashboardData()
  const {
    loading: analysisLoading,
    error: analysisError,
    icpData,
    icpTimeData,
    iaeData,
    iaeTimeData,
    calculateAnalysis,
    clearResults,
  } = useAnalysis()
  const { icpHistory, iaeHistory, saveAnalysis } = useHistory()

  const handlePointTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setPointTypes([...pointTypes, type])
    } else {
      setPointTypes(pointTypes.filter((t) => t !== type))
    }
  }

  // Modificar a função handleCalculate para remover a definição duplicada
  const handleCalculate = async () => {
    const config: AnalysisConfig = {
      metric: activeMetric,
      collectionType,
      startDate,
      endDate,
      mapId: selectedMap,
      period: selectedPeriod,
      pointTypes,
      weights:
        activeMetric === "icp"
          ? { tap: tapWeight, taprog: taprogWeight }
          : { gap: gapWeight, rpp: rppWeight, dynamic: dynamicWeight },
      selectedStudents:
        collectionType === "range" ? (selectedStudentRange ? [selectedStudentRange] : []) : selectedStudents,
    }

    await calculateAnalysis(config)

    // Salvar no histórico se for range de datas
    if (collectionType === "range") {
      const historyItem = {
        id: Date.now(),
        metric: activeMetric,
        mapName: maps.find((m) => m.id.toString() === selectedMap)?.name || "Mapa não encontrado",
        analysisDate: new Date().toLocaleDateString("pt-BR"),
        dateRange: {
          start: startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "",
          end: endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "",
        },
        pointTypes: [...pointTypes],
        weights: config.weights,
        selectedStudent: selectedStudentRange,
        results: null, // Será preenchido com os dados reais
      }

      try {
        await saveAnalysis(historyItem)
      } catch (error) {
        console.error("Erro ao salvar análise:", error)
      }
    }
  }

  const loadHistoryItem = (item: any) => {
    setActiveMetric(item.metric)
    setCollectionType("range")
    setSelectedMap(maps.find((m) => m.name === item.mapName)?.id.toString() || "")
    setPointTypes(item.pointTypes)
    setSelectedStudentRange(item.selectedStudent || "")

    if (item.metric === "icp") {
      setTapWeight(item.weights.tap || 0.5)
      setTaprogWeight(item.weights.taprog || 0.5)
    } else {
      setGapWeight(item.weights.gap || 0.5)
      setRppWeight(item.weights.rpp || 0.5)
      setDynamicWeight(item.weights.dynamic || true)
    }

    // Recarregar análise
    handleCalculate()
  }

  const isConfigValid = () => {
    if (collectionType === "range") {
      return startDate && endDate && selectedMap && pointTypes.length > 0
    } else {
      return selectedPeriod && selectedMap && pointTypes.length > 0
    }
  }

  const hasResults = icpData || icpTimeData || iaeData || iaeTimeData

  // Loading inicial
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <div>
              <h3 className="text-lg font-semibold">Carregando Dashboard</h3>
              <p className="text-muted-foreground">Aguarde enquanto carregamos os dados...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de Métricas</h1>
          <p className="text-slate-600">Análise de ICP e IAE com configurações personalizadas</p>
        </div>

        {/* Error Alert */}
        {(dataError || analysisError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{dataError || analysisError}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Configure os parâmetros para cálculo das métricas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Metric Selection */}
                <Tabs
                  value={activeMetric}
                  onValueChange={(value) => {
                    setActiveMetric(value as "icp" | "iae")
                    clearResults()
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="icp">ICP</TabsTrigger>
                    <TabsTrigger value="iae">IAE</TabsTrigger>
                  </TabsList>

                  <TabsContent value="icp" className="space-y-6 mt-6">
                    {/* ICP Description */}
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-blue-800">
                        <strong>Dashboard descrição ICP:</strong> Análise do Índice de Continuidade de Participação dos
                        alunos.
                      </p>
                    </div>

                    {/* Collection Type */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Tipo de Coleta</Label>
                      <RadioGroup
                        value={collectionType}
                        onValueChange={(value) => {
                          setCollectionType(value as "range" | "periodic")
                          clearResults()
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="range" id="range" />
                          <Label htmlFor="range">Range de Datas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="periodic" id="periodic" />
                          <Label htmlFor="periodic">Coleta Periódica</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Date Range or Periodicity */}
                    {collectionType === "range" ? (
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Período</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm">Data Início</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground",
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={startDate}
                                  onSelect={setStartDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Data Final</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground",
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={endDate}
                                  onSelect={setEndDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Periodicidade</Label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a periodicidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {periods.map((period) => (
                              <SelectItem key={period.value} value={period.value}>
                                {period.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedPeriod && (
                          <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500 mt-2">
                            <p className="text-sm text-green-800">
                              ➡️ A coleta será iniciada imediatamente após a configuração e continuará com a
                              periodicidade selecionada.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Map Selection */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Mapa</Label>
                      <Select value={selectedMap} onValueChange={setSelectedMap}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o mapa" />
                        </SelectTrigger>
                        <SelectContent>
                          {maps.map((map) => (
                            <SelectItem key={map.id} value={map.id.toString()}>
                              {map.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Point Types */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Tipo de Ponto</Label>
                      <div className="space-y-2">
                        {availablePointTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={type}
                              checked={pointTypes.includes(type)}
                              onCheckedChange={(checked) => handlePointTypeChange(type, checked as boolean)}
                            />
                            <Label htmlFor={type}>{type}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* ICP Weight Configuration */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Configuração de Pesos</Label>
                      <WeightSlider
                        label1="Peso TAP"
                        label2="Peso TAprog"
                        value1={tapWeight}
                        value2={taprogWeight}
                        onChange={(val1, val2) => {
                          setTapWeight(val1)
                          setTaprogWeight(val2)
                        }}
                        tooltip1="Mede a regularidade das participações, penalizando alunos que interagem de forma intercalada."
                        tooltip2="Mede a continuidade das participações, penalizando ausências prolongadas ao longo do tempo."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="iae" className="space-y-6 mt-6">
                    {/* IAE Description */}
                    <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm text-purple-800">
                        ➡️ <strong>Análise e visualização de taxas de abandono por pontos da jornada.</strong>
                      </p>
                    </div>

                    {/* Collection Type */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Tipo de Coleta</Label>
                      <RadioGroup
                        value={collectionType}
                        onValueChange={(value) => {
                          setCollectionType(value as "range" | "periodic")
                          clearResults()
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="range" id="range-iae" />
                          <Label htmlFor="range-iae">Range de Datas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="periodic" id="periodic-iae" />
                          <Label htmlFor="periodic-iae">Coleta Periódica</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Date Range or Periodicity */}
                    {collectionType === "range" ? (
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Período</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm">Data Início</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground",
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={startDate}
                                  onSelect={setStartDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Data Final</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground",
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={endDate}
                                  onSelect={setEndDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Periodicidade</Label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a periodicidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {periods.map((period) => (
                              <SelectItem key={period.value} value={period.value}>
                                {period.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedPeriod && (
                          <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500 mt-2">
                            <p className="text-sm text-green-800">
                              ➡️ A coleta será iniciada imediatamente após a configuração e continuará com a
                              periodicidade selecionada.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Map Selection */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Mapa</Label>
                      <Select value={selectedMap} onValueChange={setSelectedMap}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o mapa" />
                        </SelectTrigger>
                        <SelectContent>
                          {maps.map((map) => (
                            <SelectItem key={map.id} value={map.id.toString()}>
                              {map.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Point Types */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Tipo de Ponto</Label>
                      <div className="space-y-2">
                        {availablePointTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${type}-iae`}
                              checked={pointTypes.includes(type)}
                              onCheckedChange={(checked) => handlePointTypeChange(type, checked as boolean)}
                            />
                            <Label htmlFor={`${type}-iae`}>{type}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* IAE Weight Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-semibold">Peso Dinâmico</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  O sistema analisa o padrão de engajamento da turma e ajusta os pesos entre TAP e
                                  TAprog dinamicamente. O indicador mais representativo recebe maior peso (60%).
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Switch checked={dynamicWeight} onCheckedChange={setDynamicWeight} />
                      </div>

                      {!dynamicWeight && (
                        <WeightSlider
                          label1="Peso GAP"
                          label2="Peso RPP"
                          value1={gapWeight}
                          value2={rppWeight}
                          onChange={(val1, val2) => {
                            setGapWeight(val1)
                            setRppWeight(val2)
                          }}
                          tooltip1="Avalia o abandono entre dois pontos consecutivos da jornada, com base nos alunos que participaram anteriormente."
                          tooltip2="Indica o percentual de alunos que deixaram de participar em cada ponto, com base no total de participantes ao longo da jornada."
                        />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Histórico - apenas para Range de Datas */}
                {collectionType === "range" &&
                  ((activeMetric === "icp" && icpHistory.length > 0) ||
                    (activeMetric === "iae" && iaeHistory.length > 0)) && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">
                          Histórico de Análises {activeMetric.toUpperCase()}
                        </Label>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {(activeMetric === "icp" ? icpHistory : iaeHistory).map((item) => (
                            <Card
                              key={item.id}
                              className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => loadHistoryItem(item)}
                            >
                              <div className="space-y-1">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium text-sm">{item.mapName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {item.metric.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">Análise: {item.analysisDate}</div>
                                <div className="text-xs text-muted-foreground">
                                  Período: {item.dateRange.start} - {item.dateRange.end}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Pontos: {item.pointTypes.join(", ")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {item.metric === "icp"
                                    ? `TAP: ${((item.weights.tap || 0) * 100).toFixed(0)}%, TAprog: ${((item.weights.taprog || 0) * 100).toFixed(0)}%`
                                    : item.weights.dynamic
                                      ? "Peso Dinâmico: Ativo"
                                      : `GAP: ${((item.weights.gap || 0) * 100).toFixed(0)}%, RPP: ${((item.weights.rpp || 0) * 100).toFixed(0)}%`}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                {/* Calculate Button */}
                <Button
                  onClick={handleCalculate}
                  disabled={!isConfigValid() || analysisLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {analysisLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Calcular
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {hasResults ? (
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Resultados - {activeMetric.toUpperCase()}
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    {collectionType === "range" ? "Análise por Range de Datas" : "Análise Periódica"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {activeMetric === "icp" ? (
                    collectionType === "range" ? (
                      <div className="space-y-6">
                        {/* Student Selection for ICP Range */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Selecionar Aluno (opcional)</Label>
                          <Select value={selectedStudentRange} onValueChange={setSelectedStudentRange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione um aluno para comparar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Apenas turma</SelectItem>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.name}>
                                  {student.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Legenda de Acessibilidade */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <h4 className="font-medium mb-2">Legenda de Acessibilidade:</h4>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-900 opacity-20 relative">
                                <div
                                  className="absolute inset-0 bg-blue-900"
                                  style={{
                                    backgroundImage:
                                      "repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)",
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm">▒ Turma (listras, azul escuro)</span>
                            </div>
                            {selectedStudentRange && selectedStudentRange !== "default" && (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-600 opacity-20 relative">
                                  <div className="absolute inset-0">
                                    <div className="w-1 h-1 bg-orange-600 rounded-full absolute top-0.5 left-0.5"></div>
                                    <div className="w-1 h-1 bg-orange-600 rounded-full absolute top-2.5 left-2.5"></div>
                                    <div className="w-1 h-1 bg-orange-600 rounded-full absolute top-0.5 left-2.5"></div>
                                    <div className="w-1 h-1 bg-orange-600 rounded-full absolute top-2.5 left-0.5"></div>
                                  </div>
                                </div>
                                <span className="text-sm">● Aluno (pontos, laranja)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ICP Bar Chart */}
                        {icpData && (
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={icpData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                barCategoryGap="30%"
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <RechartsTooltip formatter={(value: any) => [value?.toFixed(1) + "%" || "0%", "ICP"]} />
                                <Bar dataKey="icp" name="ICP" radius={[4, 4, 0, 0]}>
                                  {icpData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || "#1e3a8a"} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {/* ICP Statistics */}
                        {icpData && icpData.length > 1 && (
                          <div className="grid grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color: icpData[1]?.color || "#ea580c" }}>
                                  {icpData[1]?.icp.toFixed(1) || "0"}%
                                </div>
                                <div className="text-sm text-muted-foreground">ICP do Aluno</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color: icpData[0]?.color || "#1e3a8a" }}>
                                  {icpData[0]?.icp.toFixed(1) || "0"}%
                                </div>
                                <div className="text-sm text-muted-foreground">ICP Médio da Turma</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {icpData.length > 1
                                    ? ((icpData[1]?.icp || 0) - (icpData[0]?.icp || 0)).toFixed(1)
                                    : "0"}
                                  %
                                </div>
                                <div className="text-sm text-muted-foreground">Diferença</div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Student Selection for ICP Periodic */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Selecionar Alunos</Label>
                          <MultiSelect
                            options={students}
                            selected={selectedStudents}
                            onSelectionChange={setSelectedStudents}
                            placeholder="Selecione os alunos para análise"
                          />
                        </div>

                        {/* ICP Line Chart */}
                        {icpTimeData && (
                          <div className="h-80 bg-white rounded-lg border p-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={icpTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="2 2" stroke="#e0e0e0" />
                                <XAxis
                                  dataKey="period"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 12, fill: "#666" }}
                                />
                                <YAxis
                                  domain={[0, 100]}
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 12, fill: "#666" }}
                                  tickFormatter={(value) => `${value}%`}
                                />
                                <RechartsTooltip content={<ICPPeriodicTooltip />} />

                                {/* Linha da Turma */}
                                <Line
                                  type="monotone"
                                  dataKey="turma"
                                  stroke="#6b7280"
                                  strokeWidth={2}
                                  name="turma"
                                  dot={{ fill: "#6b7280", strokeWidth: 2, r: 5 }}
                                  activeDot={{ r: 7, stroke: "#6b7280", strokeWidth: 2, fill: "#6b7280" }}
                                />

                                {/* Linhas dos alunos selecionados */}
                                {selectedStudents.map((studentName, index) => {
                                  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]
                                  return (
                                    <Line
                                      key={studentName}
                                      type="monotone"
                                      dataKey={studentName}
                                      stroke={colors[index % colors.length]}
                                      strokeWidth={2}
                                      name={studentName}
                                      dot={{
                                        fill: colors[index % colors.length],
                                        strokeWidth: 2,
                                        r: 4,
                                        shape: "square",
                                      }}
                                      activeDot={{
                                        r: 6,
                                        stroke: colors[index % colors.length],
                                        strokeWidth: 2,
                                        fill: colors[index % colors.length],
                                        shape: "square",
                                      }}
                                    />
                                  )
                                })}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    // IAE Results
                    <div className="space-y-6">
                      {(iaeData || iaeTimeData) && (
                        <div
                          className="h-80 bg-white rounded-lg border p-4 relative"
                          onMouseMove={(e) => {
                            setMousePosition({ x: e.clientX, y: e.clientY })
                          }}
                          onMouseLeave={() => {
                            setShowLegend(false)
                            setHoveredPoint(null)
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={
                                collectionType === "range"
                                  ? iaeData
                                  : selectedPeriod
                                    ? getIAEPeriodicData(selectedPeriod)
                                    : iaeTimeData
                              }
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="2 2" stroke="#e0e0e0" />
                              <XAxis
                                dataKey={collectionType === "range" ? "ponto" : "period"}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#666" }}
                              />
                              <YAxis
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#666" }}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <RechartsTooltip content={<IAETooltip />} />

                              <Line
                                type="monotone"
                                dataKey="GAP"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                name="GAP"
                                dot={{
                                  fill: "#f59e0b",
                                  strokeWidth: 2,
                                  r: 4,
                                  onMouseEnter: (data: any) => {
                                    setHoveredPoint(data.payload)
                                    setShowLegend(true)
                                  },
                                }}
                                activeDot={{
                                  r: 6,
                                  stroke: "#f59e0b",
                                  strokeWidth: 2,
                                  fill: "#f59e0b",
                                  onMouseEnter: (data: any) => {
                                    setHoveredPoint(data.payload)
                                    setShowLegend(true)
                                  },
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="IAE"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="IAE"
                                dot={{
                                  fill: "#10b981",
                                  strokeWidth: 2,
                                  r: 4,
                                  onMouseEnter: (data: any) => {
                                    setHoveredPoint(data.payload)
                                    setShowLegend(true)
                                  },
                                }}
                                activeDot={{
                                  r: 6,
                                  stroke: "#10b981",
                                  strokeWidth: 2,
                                  fill: "#10b981",
                                  onMouseEnter: (data: any) => {
                                    setHoveredPoint(data.payload)
                                    setShowLegend(true)
                                  },
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="RPP"
                                stroke="#6366f1"
                                strokeWidth={2}
                                name="RPP"
                                dot={{
                                  fill: "#6366f1",
                                  strokeWidth: 2,
                                  r: 4,
                                  onMouseEnter: (data: any) => {
                                    setHoveredPoint(data.payload)
                                    setShowLegend(true)
                                  },
                                }}
                                activeDot={{
                                  r: 6,
                                  stroke: "#6366f1",
                                  strokeWidth: 2,
                                  fill: "#6366f1",
                                  onMouseEnter: (data: any) => {
                                    setHoveredPoint(data.payload)
                                    setShowLegend(true)
                                  },
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>

                          {/* Legenda flutuante */}
                          <IAELegend visible={showLegend} position={mousePosition} data={hoveredPoint} />
                        </div>
                      )}

                      {/* IAE Legend */}
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="border-l-4" style={{ borderLeftColor: "#f59e0b" }}>
                          <CardContent className="p-4">
                            <div className="text-lg font-semibold" style={{ color: "#f59e0b" }}>
                              GAP
                            </div>
                            <div className="text-sm text-muted-foreground">Grau de Adequação do Ponto</div>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4" style={{ borderLeftColor: "#10b981" }}>
                          <CardContent className="p-4">
                            <div className="text-lg font-semibold" style={{ color: "#10b981" }}>
                              IAE
                            </div>
                            <div className="text-sm text-muted-foreground">Índice de Adequação Estrutural</div>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4" style={{ borderLeftColor: "#6366f1" }}>
                          <CardContent className="p-4">
                            <div className="text-lg font-semibold" style={{ color: "#6366f1" }}>
                              RPP
                            </div>
                            <div className="text-sm text-muted-foreground">Relevância Proposicional do Ponto</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-0 border-dashed border-2 border-slate-300">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">Configure e Execute</h3>
                  <p className="text-slate-500">
                    Configure os parâmetros no painel lateral e clique em "Calcular" para visualizar os resultados.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
