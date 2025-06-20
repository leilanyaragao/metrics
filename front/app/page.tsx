"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calculator, History, TrendingUp, Info, Users, X } from "lucide-react"
import axios from "axios"
import { Value } from "@radix-ui/react-select"
import { List } from "postcss/lib/list"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarIcon, InfoIcon, ClockIcon, AlertCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Index from "."
import { ChartDataPoint } from "@/types/chart-data"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { ICPLegend } from "./ICPLegend";



const acessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsZWlsYW55LnVsaXNzZXNAdGRzLmNvbXBhbnkiLCJ1aWQiOiI2NjdiMWJlZjIzYzY5ZTY2ZjM0MzYyYjciLCJyb2xlcyI6W10sIm5hbWUiOiJMZWlsYW55IFVsaXNzZXMiLCJleHAiOjE3NTAzOTkzMDYsImlhdCI6MTc1MDM4NDkwNn0.Xg0RNmYE6EMrfMxm1kioaWKJbaY7tKCH1xAq8XoC16yYCIq1wrhof79a8oN0KOKDDTQnbZNpHR377N7zziBP3w"
interface AnalysisHistory {
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

interface RangeDatesICP {
  map_id: string
  convergence_point: boolean
  divergence_point: boolean
  essay_point: boolean
  dynamic_weights: boolean
  weight_x: number
  weight_y: number
  start_date: Date
  end_date: Date
}

interface PeriodicICP {
  map_id: string
  convergence_point: boolean
  divergence_point: boolean
  essay_point: boolean
  dynamic_weights: boolean
  weight_x: number
  weight_y: number
  start_date: Date
  end_date: Date
  periodicity: string
}

interface RangeDatesIAE {
  map_id: string
  convergence_point: boolean
  divergence_point: boolean
  essay_point: boolean
  dynamic_weights: boolean
  weight_x: number
  weight_y: number
  start_date: Date
  end_date: Date
}

interface Student {
  id: string
  name: string
  averageRPP: number
  averageGAP: number
  averageICP: number
}

interface DropoutData {
  label: string,
  iae: number
  tap: number,
  taProg: number

}


export default function MetricsDashboard() {
  const [showResults, setShowResults] = useState(false)
  const [activeMetric, setActiveMetric] = useState<"ICP" | "IAE">("ICP")
  const [selectedJourney, setSelectedJourney] = useState<any>(null)
  const [selectedMap, setSelectedMap] = useState<any>(null)
  const [startDate, setStartDate] = useState<any>(null)
  const [endDate, setEndDate] = useState("")
  const [pointTypes, setPointTypes] = useState({
    avaliacao: true,
    debate: true,
    decisao: false,
  })


  // ICP weights (GAP and RPP) - linked sliders
  const [icpWeights, setIcpWeights] = useState({
    pesoGAP: [50],
    pesoRPP: [50],
  })

  // IAE weights and dynamic toggle - linked sliders
  const [dynamicWeights, setDynamicWeights] = useState(false)
  const [iaeWeights, setIaeWeights] = useState({
    pesoTAP: [50],
    pesoTAProg: [50],
  })

  // Student selection for ICP
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([])
  const [turmaAverage, setTurmaAvarage] = useState()

  //IAE range Data
  const [chartData, setchartData] = useState<DropoutData[]>([])
  type DropoutDataPoint = {
    label: string
    iae: number // IAE
    tap: number   // TAP
    taProg: number // TAProg
  }
  const pointCount = chartData.length
  const totalWidth = 400
  const paddingLeft = 0
  const paddingRight = 0
  const chartWidth = totalWidth - paddingLeft - paddingRight
  const gap = chartWidth / (pointCount - 1)
  //teste
  const getYPos = (value: number) => {
    const min = 0
    const max = 100
    const chartHeight = 200
    const padding = 10 // margem para os pontos não fugirem
    const range = max - min

    return padding + (chartHeight - 2 * padding) * (1 - (value - min) / range)
  }
  const xPositions = Array.from({ length: pointCount }, (_, i) => paddingLeft + i * gap)
  ''
  // Mapas dos dados
  const iaeData = chartData.map((d) => d.iae)
  const tapData = chartData.map((d) => d.tap)
  const taprogData = chartData.map((d) => d.taProg)
  const xLabels = chartData.map((d) => d.label)



  // Only store history for range de datas
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([])
  const [currentHistoryItem, setCurrentHistoryItem] = useState<AnalysisHistory | null>(null)


  // 
  const [alertCalculateICP, setAlertCalculateICP] = useState(false)


  const [journeys, setJourneys] = useState<any[]>(
    []
  )
  useEffect(() => {
    axios.get("http://localhost:8095/v1/map/metrics/journeys", { headers: { Authorization: `Bearer ${acessToken}` } }).then(
      value => setJourneys(value.data))
  },
    [])

  const [maps, setMaps] = useState<any[]>([])

  useEffect(() => {
    setMaps(journeys.find(item => item.id === selectedJourney?.id)?.maps ?? [])
  },
    [selectedJourney])

  // Handle ICP weight changes to maintain 100% total
  const handleICPWeightChange = (type: "GAP" | "RPP", value: number[]) => {
    const newValue = value[0]
    const otherValue = 100 - newValue

    if (type === "GAP") {
      setIcpWeights({
        pesoGAP: [newValue],
        pesoRPP: [otherValue],
      })
    } else {
      setIcpWeights({
        pesoGAP: [otherValue],
        pesoRPP: [newValue],
      })
    }
  }

  // Handle IAE weight changes to maintain 100% total
  const handleIAEWeightChange = (type: "TAP" | "TAProg", value: number[]) => {
    const newValue = value[0]
    const otherValue = 100 - newValue

    if (type === "TAP") {
      setIaeWeights({
        pesoTAP: [newValue],
        pesoTAProg: [otherValue],
      })
    } else {
      setIaeWeights({
        pesoTAP: [otherValue],
        pesoTAProg: [newValue],
      })
    }
  }


  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    // Adicione aqui qualquer lógica adicional antes de fechar
  };


  //Periodic ICP
  const [chartDataPoints, setChartDataPoints] = useState<ChartDataPoint[]>([])

  const [periodicidade, setPeriodicidade] = useState("Anual")
  const [collectionType, setCollectionType] = useState<"range" | "periodica">(
    activeMetric === "ICP" ? "range" : "periodica",
  )
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  // Reset configuration when changing collection type
  const handleCollectionTypeChange = async (newType: "range" | "periodica") => {
    let response

    if (newType === "periodica") {
      setCollectionType(newType)
      if (activeMetric == "ICP") {
        response = await axios.get("http://localhost:8095/v1/map/metrics/in-progress-periodic-icp",
          { headers: { Authorization: `Bearer ${acessToken}` } })
      }
      else {
        response = await axios.post("http://localhost:8095/v1/map/metrics/in-progress-periodic-iae",
          { headers: { Authorization: `Bearer ${acessToken}` } })
      }

      if (response.data.length !== 0) {
        setShowResults(true)
        setChartDataPoints(response.data)
      }

      else {
        clearConfig(newType)
      }

    }
    else {
      clearConfig(newType)
    }

  }

  const clearConfig = (newType: "range" | "periodica") => {
    setCollectionType(newType)
    // Reset configuration data
    setSelectedJourney(null)
    setSelectedMap(null)
    setStartDate("")
    setEndDate("")
    setStartTime("")
    setEndTime("")
    setPeriodicidade("Anual")
    setSelectedStudents([])
    setShowResults(false)
    setCurrentHistoryItem(null)
  }

  //Formatação

  const formatarDataHora = (dataTexto: string): string => {
    const data = new Date(dataTexto);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatarPeriodoBr = (periodoTexto: string): string => {
    const [inicioStr, fimStr] = periodoTexto.split(' - ');
    const inicio = new Date(inicioStr);
    const fim = new Date(fimStr);

    const formatador = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return `${formatador.format(inicio)} a ${formatador.format(fim)}`;
  };

  const handleCalculate = () => {
    if (selectedJourney && selectedMap && startDate && (collectionType === "range" ? endDate : startTime)) {
      // Only add to history if it's range de datas
      if (collectionType === "range" && activeMetric === "ICP") {
        const newRangeDatesICP: RangeDatesICP = {
          map_id: selectedMap.id,
          convergence_point: pointTypes.decisao,
          divergence_point: pointTypes.debate,
          essay_point: pointTypes.avaliacao,
          dynamic_weights: dynamicWeights,
          weight_x: icpWeights.pesoGAP[0],
          weight_y: icpWeights.pesoRPP[0],
          start_date: new Date(startDate),
          end_date: new Date(endDate),
        }

        axios.post("http://localhost:8095/v1/map/metrics/participation-consistency-index",
          newRangeDatesICP,
          { headers: { Authorization: `Bearer ${acessToken}` } }).
          then(response => {
            const students = response.data.participation_consistency_per_users.map((value: any) => ({
              id: value.user_id,
              name: value.user_name,
              averageRPP: value.user_average_rpp.toFixed(2),
              averageGAP: value.user_average_gap.toFixed(2),
              averageICP: value.user_average_icp.toFixed(2)
            }))
            setAvailableStudents(students)
            setTurmaAvarage(response.data.class_average_icp.toFixed(2))

            const newAnalysis: AnalysisHistory = {
              id: Date.now().toString(),
              journey: selectedJourney,
              map: selectedMap,
              date: response.data.created_at,
              period: `${startDate} - ${endDate}`,
              result: response.data.class_average_icp.toFixed(2),
              type: activeMetric,
              collectionType,
              students
            }

            setAnalysisHistory([newAnalysis, ...analysisHistory])
            setCurrentHistoryItem(newAnalysis)
            setSelectedStudents([])
          })
      }

      //Calcular IAE
      else if (collectionType === "range" && activeMetric === "IAE") {
        const newRangeDatesIAE: RangeDatesIAE = {
          map_id: selectedMap.id,
          convergence_point: pointTypes.decisao,
          divergence_point: pointTypes.debate,
          essay_point: pointTypes.avaliacao,
          dynamic_weights: dynamicWeights,
          weight_x: icpWeights.pesoGAP[0],
          weight_y: icpWeights.pesoRPP[0],
          start_date: new Date(startDate),
          end_date: new Date(endDate),
        }

        axios.post("http://localhost:8095/v1/map/metrics/structured-dropout-index",
          newRangeDatesIAE,
          { headers: { Authorization: `Bearer ${acessToken}` } }).
          then(response => {
            const dropoutData = response.data.points_indexes.map((value: any) => ({
              label: value.label,
              iae: (value.iae * 100).toFixed(2),
              tap: (value.tap * 100).toFixed(2),
              taProg: (value.ta_prog * 100).toFixed(2)
            }))
            setchartData(dropoutData)

          })

        /*

        const newAnalysis: AnalysisHistory = {
          id: Date.now().toString(),
          journey: selectedJourney,
          map: selectedMap,
          date: new Date().toLocaleDateString("pt-BR"),
          period: `${startDate} - ${endDate}`,
          result: Math.floor(Math.random() * 40) + 40,
          type: activeMetric,
          collectionType,
          dropoutData
        }
        setAnalysisHistory([newAnalysis, ...analysisHistory])
        */
      }

      else if (activeMetric === "ICP" && collectionType === "periodica") {
        if (showResults) {
          setAlertCalculateICP(true)
        }
        else {
          const newRangeDatesICP: PeriodicICP = {
            map_id: selectedMap.id,
            convergence_point: pointTypes.decisao,
            divergence_point: pointTypes.debate,
            essay_point: pointTypes.avaliacao,
            dynamic_weights: dynamicWeights,
            weight_x: icpWeights.pesoGAP[0],
            weight_y: icpWeights.pesoRPP[0],
            start_date: new Date(startDate),
            end_date: new Date(endDate),
            periodicity: periodicidade
          }

          axios.post("http://localhost:8095/v1/map/metrics/periodic-icp",
            newRangeDatesICP,
            { headers: { Authorization: `Bearer ${acessToken}` } })

          //Se tiver um grafico em andamento dizer que precisa primeiro dar stop

          //se nao mostra o resultado 


        }
      }

      else { }


      setCurrentHistoryItem(null)
      setShowResults(true)
    }
  }

  // Handle clicking on history item
  const handleHistoryClick = (analysis: AnalysisHistory) => {
    setCurrentHistoryItem(analysis)
    setActiveMetric(analysis.type)
    setCollectionType(analysis.collectionType)
    setSelectedJourney(analysis.journey)
    setSelectedMap(analysis.map)
    setShowResults(true)
    setSelectedStudents([])
    setAvailableStudents(analysis.students)
  }

  const addStudent = (student: Student) => {
    if (!selectedStudents.find((s) => s.id === student.id)) {
      setSelectedStudents([...selectedStudents, student])
    }
  }

  const removeStudent = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter((s) => s.id !== studentId))
  }

  const canCalculate = selectedJourney && selectedMap && startDate && (collectionType === "range" ? endDate : startTime)

  // Get time labels based on periodicidade
  const getTimeLabels = () => {
    switch (periodicidade) {
      case "Anual":
        return ["2021", "2022", "2023", "2024"]
      case "Semestral":
        return ["1º Sem", "2º Sem", "3º Sem", "4º Sem"]
      case "Trimestral":
        return ["1º Tri", "2º Tri", "3º Tri", "4º Tri"]
      case "Mensal":
        return ["Jan", "Fev", "Mar", "Abr"]
      case "Semanal":
        return ["Sem 1", "Sem 2", "Sem 3", "Sem 4"]
      case "Diário":
        return ["Dia 1", "Dia 2", "Dia 3", "Dia 4"]
      default:
        return ["T1", "T2", "T3", "T4"]
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard de Métricas</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="bg-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Configuração
                </CardTitle>
                <p className="text-sm opacity-90">Configuração dos parâmetros para o cálculo personalizado das métricas.</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Metric Type Tabs */}
                <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 text-center">
                    <button
                      onClick={() => {
                        setActiveMetric("ICP")
                        setShowResults(false)
                        setSelectedStudents([])
                        setCurrentHistoryItem(null)
                      }}
                      className={`w-full font-medium pb-1 ${activeMetric === "ICP"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      ICP
                    </button>
                  </div>
                  <div className="flex-1 text-center">
                    <button
                      onClick={() => {
                        setActiveMetric("IAE")
                        setShowResults(false)
                        setSelectedStudents([])
                        setCurrentHistoryItem(null)
                      }}
                      className={`w-full font-medium pb-1 ${activeMetric === "IAE"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      IAE
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">
                    <strong>Dashboard descritivo {activeMetric}:</strong>{" "}
                    {activeMetric === "ICP"
                      ? "Análise do Índice de Consistência de Participação"
                      : "Análise do Índice de Abandono Estruturado"}
                  </p>
                </div>

                {/* Collection Type */}
                <div>
                  <Label className="text-sm font-medium">Tipo de Coleta</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="range"
                        name="coleta"
                        checked={collectionType === "range"}
                        onChange={() => handleCollectionTypeChange("range")}
                        className="text-purple-600"
                      />
                      <label htmlFor="range" className="text-sm">
                        Range de Datas
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="periodica"
                        name="coleta"
                        checked={collectionType === "periodica"}
                        onChange={() => handleCollectionTypeChange("periodica")}
                        className="text-purple-600"
                      />
                      <label htmlFor="periodica" className="text-sm">
                        Coleta Periódica
                      </label>
                    </div>
                  </div>
                </div>

                {/* Periodicidade - Only show for Coleta Periódica */}
                {collectionType === "periodica" && (
                  <div>
                    <Label className="text-sm font-medium">Periodicidade</Label>
                    <Select value={periodicidade} onValueChange={setPeriodicidade}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MINUTE">MINUTE</SelectItem>
                        <SelectItem value="MONTHLY">Mensal</SelectItem>
                        <SelectItem value="WEEKLY">Semanal</SelectItem>
                        <SelectItem value="DAILY">Diário</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="mt-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm text-green-800">
                        ℹ️ A coleta será iniciada imediatamente após o período contínuo com a periodicidade selecionada.
                      </p>
                    </div>
                  </div>
                )}

                {/* Period */}
                <div>
                  <Label className="text-sm font-medium">
                    {collectionType === "range" ? "Período" : "Data e Hora de Início"}
                  </Label>

                  {collectionType === "range" ? (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {/* Data Inicial */}
                      <div>
                        <Label className="text-xs text-gray-500">Data Inicial</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full mt-1 pl-3 text-left font-normal", !startDate && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "dd/MM/yyyy") : <span>Selecione</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Data Final */}

                      <div>
                        <Label className="text-xs text-gray-500">Data Final</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full mt-1 pl-3 text-left font-normal", !startDate && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "dd/MM/yyyy") : <span>Selecione</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                              // Adicione esta linha para permitir apenas datas a partir de hoje
                              fromDate={new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {/* Data Inicial */}
                      <div>
                        <Label className="text-xs text-gray-500">Data Inicial</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full mt-1 pl-3 text-left font-normal", !startDate && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "dd/MM/yyyy") : <span>Selecione</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                              // Adicione esta linha para permitir apenas datas a partir de hoje
                              fromDate={new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Hora Inicial */}
                      <div>
                        <Label htmlFor="start-time" className="text-xs text-gray-500">Hora Início</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      {/* Data Final */}
                      <div>
                        <Label className="text-xs text-gray-500">Data Final</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full mt-1 pl-3 text-left font-normal", !startDate && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "dd/MM/yyyy") : <span>Selecione</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                              // Adicione esta linha para permitir apenas datas a partir de hoje
                              fromDate={new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Hora Final */}
                      <div>
                        <Label htmlFor="end-time" className="text-xs text-gray-500">Hora de Término</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>


                {/* Journey Selection */}
                <div>
                  <Label className="text-sm font-medium">Jornada</Label>
                  <Select value={selectedJourney?.id} onValueChange={(value) => setSelectedJourney(journeys.find(item => item.id === value))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione a jornada" />
                    </SelectTrigger>
                    <SelectContent>Jornada
                      {journeys.map((journey) => (
                        <SelectItem key={journey.id} value={journey.id}>
                          {journey.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Map Selection - Only show if journey is selected */}
                {selectedJourney && (
                  <div>
                    <Label className="text-sm font-medium">Mapa</Label>
                    <Select value={selectedMap?.id} onValueChange={(value) => setSelectedMap(maps.find(item => item.id === value))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecione o mapa" />
                      </SelectTrigger>
                      <SelectContent>
                        {maps.map((map) => (
                          <SelectItem key={map.id} value={map.id}>
                            {map.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Point Types - Always visible */}
                <div>
                  <Label className="text-sm font-medium">Tipo de Ponto</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="avaliacao"
                        checked={pointTypes.avaliacao}
                        onCheckedChange={(checked) =>
                          setPointTypes((prev) => ({ ...prev, avaliacao: checked as boolean }))
                        }
                      />
                      <label htmlFor="avaliacao" className="text-sm">
                        Avaliação
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="debate"
                        checked={pointTypes.debate}
                        onCheckedChange={(checked) =>
                          setPointTypes((prev) => ({ ...prev, debate: checked as boolean }))
                        }
                      />
                      <label htmlFor="debate" className="text-sm">
                        Debate
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="decisao"
                        checked={pointTypes.decisao}
                        onCheckedChange={(checked) =>
                          setPointTypes((prev) => ({ ...prev, decisao: checked as boolean }))
                        }
                      />
                      <label htmlFor="decisao" className="text-sm">
                        Decisão
                      </label>
                    </div>
                  </div>
                </div>

                {/* Weight Configuration - Always visible */}
                <div>
                  <Label className="text-sm font-medium">Configuração de Pesos</Label>

                  {/* IAE Dynamic Weights Toggle */}
                  {activeMetric === "IAE" && (
                    <div className="mt-4 mb-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="dynamic-weights" className="text-sm font-medium">
                            Peso Dinâmico
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent side="right" align="start" className="max-w-[260px]">
                                <p className="text-sm">
                                  O sistema analisa o padrão de engajamento da turma e ajusta os pesos entre TAP e TAprog
                                  dinamicamente. O indicador mais representativo recebe maior peso (60%).
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Switch id="dynamic-weights" checked={dynamicWeights} onCheckedChange={setDynamicWeights} />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 space-y-4">
                    {activeMetric === "ICP" ? (
                      // ICP Weights (GAP and RPP) - Linked sliders
                      <>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-xs">Índice de Gaps na Participação (GAP) </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent side="right" align="start" className="max-w-[260px]">
                                  <p className="text-sm">
                                    Mede a regularidade das participações, penalizando alunos que interagem de forma intercalada
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span className="text-xs font-medium">{icpWeights.pesoGAP[0]}%</span>
                          </div>

                          <Slider
                            value={icpWeights.pesoGAP}
                            onValueChange={(value) => handleICPWeightChange("GAP", value)}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-xs">Regularidade da Participação (RPP)</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent side="right" align="start" className="max-w-[260px]">
                                  <p className="text-sm">
                                    Mede a continuidade das participações, penalizando ausências prolongadas ao longo do tempo                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span className="text-xs font-medium">{icpWeights.pesoRPP[0]}%</span>
                          </div>
                          <Slider
                            value={icpWeights.pesoRPP}
                            onValueChange={(value) => handleICPWeightChange("RPP", value)}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="text-xs text-center text-gray-500 pt-2">
                          Total: {icpWeights.pesoGAP[0] + icpWeights.pesoRPP[0]}%
                        </div>
                      </>
                    ) : (
                      // IAE Weights (TAP and TAProg) - Linked sliders
                      !dynamicWeights && (
                        <>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-xs">Taxa de Abandono Relativa ao Ponto - TAp</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent side="right" align="start" className="max-w-[260px]">
                                    <p className="text-sm">
                                      Avalia o abandono entre dois pontos consecutivos da jornada, com base nos alunos que
                                      participaram anteriormente.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="text-xs font-medium text-gray-600">{iaeWeights.pesoTAP[0]}%</span>
                            </div>
                            <Slider
                              value={iaeWeights.pesoTAP}
                              onValueChange={(value) => handleIAEWeightChange("TAP", value)}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label className="text-xs"> Taxa de Abandono Progressivo - TAprog</Label>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent side="right" align="start" className="max-w-[260px]">
                                    <p className="text-sm">
                                      Indica o percentual de alunos que deixaram de participar em cada ponto, com base no total de
                                      participantes ao longo da jornada.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="text-xs font-medium text-gray-600">{iaeWeights.pesoTAProg[0]}%</span>
                            </div>
                            <Slider
                              value={iaeWeights.pesoTAProg}
                              onValueChange={(value) => handleIAEWeightChange("TAProg", value)}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div className="text-xs text-center text-gray-500 pt-2">
                            Total: {iaeWeights.pesoTAP[0] + iaeWeights.pesoTAProg[0]}%
                          </div>
                        </>
                      )
                    )}
                  </div>
                </div>

                {/* Calculate Button */}
                <Button
                  onClick={handleCalculate}
                  disabled={!canCalculate}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calcular
                </Button>
              </CardContent>
            </Card>
          </div>


          <AlertDialog open={alertCalculateICP} onOpenChange={setAlertCalculateICP}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Coleta Periódica em Andamento
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <div>
                      Existe uma <strong>coleta periódica em andamento</strong>. Aguarde sua finalização ou interrompa-a para iniciar uma nova coleta.
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogAction asChild>
                  <Button onClick={handleClose}>
                    OK
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-6">

            {showResults ? (
              <>

                {/* Results Header */}
                {activeMetric === "ICP" && collectionType === "periodica" && <Index chartDataPoints={chartDataPoints} setShowResults={setShowResults} />}


                {/* Student Selection for ICP */}
                {activeMetric === "ICP" && collectionType === "range" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="w-4 h-4" />
                        Selecionar Alunos para Comparação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Adicionar Aluno</Label>
                          <Select
                            onValueChange={(value) => {
                              const student = availableStudents.find((s) => s.id === value)
                              if (student) addStudent(student)
                            }}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Selecione um aluno" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStudents
                                .filter((student) => !selectedStudents.find((s) => s.id === student.id))
                                .map((student) => (
                                  <SelectItem key={student.id} value={student.id}>
                                    {student.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedStudents.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Alunos Selecionados</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedStudents.map((student) => (
                                <Badge
                                  key={student.id}
                                  variant="secondary"
                                  className="px-3 py-1 flex items-center gap-2"
                                >
                                  {student.name}
                                  <button onClick={() => removeStudent(student.id)}>
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ICP Comparison (only for range de datas) */}
                {activeMetric === "ICP" && collectionType === "range" && (
                  <><Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="w-4 h-4" />
                        Comparação de ICP
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Turma</span>
                          <span className="text-sm font-bold">{currentHistoryItem?.result}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="h-3 rounded-full bg-purple-500" style={{ width: `${currentHistoryItem?.result}%` }} />
                        </div>
                      </div>

                      {selectedStudents.map((student) => (
                        <div key={student.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{student.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{student.averageICP}%</span>
                              <span
                                className={`text-xs ${student.averageICP > currentHistoryItem?.result! ? "text-green-600" : "text-red-600"}`}
                              >
                                ({student.averageICP > currentHistoryItem?.result! ? "+" : ""}
                                {(student.averageICP - currentHistoryItem?.result!).toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${student.averageICP > currentHistoryItem?.result! ? "bg-green-500" : "bg-red-500"}`}
                              style={{ width: `${student.averageICP}%` }} />
                          </div>
                        </div>
                      ))}


                    </CardContent>
                  </Card><ICPLegend /></>

                )}

                {/* IAE Line Chart */}
                {activeMetric === "IAE" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="w-4 h-4" />
                        Análise IAE - {collectionType === "range" ? "Pontos do Mapa" : "Evolução Temporal"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-80 bg-gray-50 rounded-lg p-6">
                        <div className="h-64 relative" id="aleatorio">
                          {/* Y-axis labels */}
                          {[100, 75, 50, 25, 0].map((val, idx) => (
                            <div key={idx} className="absolute left-0 text-xs text-gray-500" style={{ top: `${(100 - val) * 2}px` }}>
                              {val}
                            </div>
                          ))}
                          {/* Chart area */}
                          <div className="absolute left-12 top-0 right-4 bottom-8">
                            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                              {/* Horizontal grid lines */}
                              {[0, 50, 100, 150, 200].map((y) => (
                                <line
                                  key={`h-${y}`}
                                  x1={0}
                                  y1={y}
                                  x2={400}
                                  y2={y}
                                  stroke={y === 0 ? "#374151" : "#d1d5db"} // #374151 = gray-700, #d1d5db = gray-300
                                  strokeWidth="1"
                                  strokeDasharray={y === 0 ? "0" : "4 2"}
                                />
                              ))}

                              {/* Vertical grid lines */}
                              {xPositions.map((x, i) => (
                                <g key={`v-${i}`}>
                                  <line
                                    x1={x}
                                    y1={0}
                                    x2={x}
                                    y2={200}
                                    stroke={x === 0 ? "#374151" : "#d1d5db"}
                                    strokeWidth="1"
                                    strokeDasharray={x === 0 ? "0" : "4 2"}
                                  />
                                  {/* Label */}
                                  <text
                                    x={x}
                                    y="215"
                                    fontSize="10"
                                    fill="#6b7280"
                                    textAnchor="middle"
                                  >
                                    {chartData[i].label}
                                  </text>
                                </g>
                              ))}

                              {/* IAE polyline */}
                              <polyline
                                points={xPositions.map((x, i) => `${x},${getYPos(iaeData[i])}`).join(" ")}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="1"
                              />

                              {/* TAP polyline */}
                              <polyline
                                points={xPositions.map((x, i) => `${x},${getYPos(tapData[i])}`).join(" ")}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="1"
                              />

                              {/* TAProg polyline */}
                              <polyline
                                points={xPositions.map((x, i) => `${x},${getYPos(taprogData[i])}`).join(" ")}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="1"
                              />

                              {/* Data points and hover areas */}
                              {xPositions.map((x, i) => (
                                <g key={i}>
                                  <circle
                                    cx={x}
                                    cy={getYPos(iaeData[i])}
                                    r="4"
                                    fill="#3b82f6"
                                    className="hover:r-6 cursor-pointer transition-all"
                                  />
                                  {/* Retângulo para TAP */}
                                  <rect
                                    x={x - 4}
                                    y={getYPos(tapData[i]) - 4}
                                    width="8"
                                    height="8"
                                    fill="#10b981"
                                    className="cursor-pointer hover:scale-110 transition-transform"
                                  />
                                  <polygon
                                    points={`
                                      ${x},${getYPos(taprogData[i]) - 5} 
                                      ${x - 5},${getYPos(taprogData[i]) + 5} 
                                      ${x + 5},${getYPos(taprogData[i]) + 5}
                                    `}
                                    fill="#f59e0b"
                                    className="cursor-pointer hover:scale-110 transition-transform"
                                  />

                                  {/* Hover rect */}
                                  <rect
                                    x={x - 20}
                                    y={0}
                                    width={40}
                                    height={200}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={(e) => {
                                      const tooltip = document.getElementById("tooltip")
                                      if (tooltip) {
                                        tooltip.style.display = "block"
                                        tooltip.innerHTML = `
                                          <div class="text-center font-semibold mb-1">${collectionType === "range" ? xLabels[i] : getTimeLabels()[i]}</div>
                                          <div class="flex items-center gap-1">
                                            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span>IAE: ${iaeData[i]}%</span>
                                          </div>
                                          <div class="flex items-center gap-1">
                                            <div class="w-2 h-2 bg-green-500"></div>
                                            <span>TAP: ${tapData[i]}%</span>
                                          </div>
                                          <div class="flex items-center gap-1">
                                            <div class="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-yellow-500"></div>
                                            <span>TAProg: ${taprogData[i]}%</span>
                                          </div>
                                        `
                                        const rect = (document.getElementById("aleatorio"))!.getBoundingClientRect()
                                        tooltip.style.left = `${e.pageX - rect.left - 100}px`
                                        tooltip.style.top = `${e.pageY - rect.top - 100}px`
                                        console.log(e.pageX, rect.left, e.pageY, rect.top)

                                      }
                                    }}
                                    onMouseLeave={() => {
                                      const tooltip = document.getElementById("tooltip")
                                      if (tooltip) tooltip.style.display = "none"
                                    }}

                                  />
                                </g>
                              ))}
                            </svg>

                            <div
                              id="tooltip"
                              className="absolute z-10 bg-white border border-gray-300 rounded-md px-2 py-1 shadow text-[10px] text-gray-800 font-sans transition-opacity duration-200"
                              style={{ display: "none", pointerEvents: "none", top: 0, left: 0 }}
                            ></div>

                          </div>

                          {/* X-axis labels */}
                          <div className="absolute left-12 right-4 bottom-0 flex justify-between text-xs text-gray-500">
                            {collectionType === "range"
                              ? xLabels.map((label, i) => (
                                <div key={i} className="text-center">
                                  {label}
                                </div>
                              ))
                              : getTimeLabels().map((label, i) => (
                                <div key={i} className="text-center">
                                  {label}
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex gap-6 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-blue-500"></div>
                            <span>IAE - Índice de Abandono Estruturado</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-green-500"></div>
                            <span>TAP - Taxa de Abandono Relativa ao Ponto</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-yellow-500"></div>
                            <span>TAProg - Taxa de Abandono Progressiva</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary Cards */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="p-4 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg">
                          <div className="text-sm font-medium text-blue-800">IAE Médio</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(iaeData.reduce((a, b) => a + b, 0) / iaeData.length)}%
                          </div>
                          <div className="text-xs text-blue-600">Índice de Adequação Estrutural</div>
                        </div>
                        <div className="p-4 border-l-4 border-green-400 bg-green-50 rounded-r-lg">
                          <div className="text-sm font-medium text-green-800">TAP Médio</div>
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(tapData.reduce((a, b) => a + b, 0) / tapData.length)}%
                          </div>
                          <div className="text-xs text-green-600">Tempo de Adequação do Ponto</div>
                        </div>
                        <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg">
                          <div className="text-sm font-medium text-yellow-800">TAProg Médio</div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {Math.round(taprogData.reduce((a, b) => a + b, 0) / taprogData.length)}%
                          </div>
                          <div className="text-xs text-yellow-600">Tempo de Adequação Progressiva</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <>
                {/* Initial State */}
                <Card className="h-64">
                  <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                    <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Configure e Execute</h3>
                    <p className="text-gray-500 text-sm">
                      Configure os parâmetros no painel lateral e clique em "Calcular" para visualizar os resultados
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Analysis History - Only for Range de Datas */}
            {collectionType === "range" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="w-4 h-4" />
                    Histórico de Análises {activeMetric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisHistory.filter(
                    (analysis) => analysis.type === activeMetric && analysis.collectionType === "range",
                  ).length > 0 ? (
                    <div className="space-y-3">
                      {analysisHistory
                        .filter((analysis) => analysis.type === activeMetric && analysis.collectionType === "range")
                        .map((analysis) => (
                          <div
                            key={analysis.id}
                            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleHistoryClick(analysis)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">Jornada: {analysis.journey.title}</div>
                                <div className="text-xs text-gray-600">Mapa: {analysis.map.title}</div>
                                <div className="text-xs text-gray-600">Data da criação: {formatarDataHora(analysis.date)}</div>
                                <div className="text-xs text-gray-600">Período de análise: {formatarPeriodoBr(analysis.period)}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-purple-600">{analysis.type}</div>
                                <div className="text-lg font-bold">{analysis.result}%</div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Nenhuma análise {activeMetric} realizada ainda</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            )}

          </div>



        </div>
      </div>
    </div>
  )
}
