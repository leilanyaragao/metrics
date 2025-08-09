"use client"

import { use, useCallback, useEffect, useState } from "react"
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarIcon, InfoIcon, ClockIcon, AlertCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ICPPEriodic from "./ICPPeriodic"
import { SelectionPointsCard } from "./SelectPointsCard"
import { HistoryCard } from "./HistoryCard"
import { WeightsCard } from "./WeightsCard"
import { ChartDataPoint, HistoricalResponse, ProcessedHistoricalCollection } from "@/types/chart-data"
import { AnalysisHistory, Class, IAERange, IAERangeHistory, points_indexes, Student } from "@/types/dashboard"
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
import { ICPRange } from "@/types/dashboard";
import { Informations } from "@/components/Informations"
import { DetailSidebar } from "@/components/DetailSidebar"
import IAERangeSection from "@/components/IAERangeSection"
import IAERangeHistorySection from "@/components/IAERangeHistorySection"
import IAERangeHistorySidebar from "@/components/IAERangeHistorySidebar"
import { HistoricalCollectionsPanel } from "@/components/ICPPeriodicHistory"


const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

interface RangeDatesICP {
  map_id: string
  convergence_point: boolean
  divergence_point: boolean
  essay_point: boolean
  dynamic_weights: boolean
  weight_gap: number
  weight_rpp: number
  start_date: Date
  end_date: Date
}

interface PeriodicICP {
  map_id: string
  convergence_point: boolean
  divergence_point: boolean
  essay_point: boolean
  dynamic_weights: boolean
  weight_gap: number
  weight_rpp: number
  start_date: string
  end_date: string
  periodicity: string
}

interface RangeDatesIAE {
  map_id: string
  convergence_point: boolean
  divergence_point: boolean
  essay_point: boolean
  dynamic_weights: boolean
  weight_tap: number
  weight_taprog: number
  start_date: Date
  end_date: Date
}


interface Points {
  avaliacao: boolean,
  debate: boolean,
  decisao: boolean,
}

interface Weights {
  dynamic_weights: boolean,
  weight_x: number,
  weight_y: number
}


export default function MetricsDashboard() {
  const [showResults, setShowResults] = useState(false)
  const [activeMetric, setActiveMetric] = useState<"ICP" | "IAE">("ICP")
  const [selectedJourney, setSelectedJourney] = useState<any>(null)
  const [selectedMap, setSelectedMap] = useState<any>(null)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [pointTypes, setPointTypes] = useState({
    avaliacao: false,
    debate: false,
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


  //Range ICP
  //selected Points
  const [selectedPointsRangeICP, setSelectedPointsRangeICP] = useState<Points>({} as Points)
  const [selectedWeightsRangeICP, setSelectedWeightsRangeICP] = useState<Weights>({} as Weights)
  const [selectedClassRangeICP, setSelectedClassRangeICP] = useState<Class>({} as Class)

  //Hisotry
  const [ICPRangeHistoryResponse, setICPRangeHistoryResponse] = useState<ICPRange[]>([]);
  const [selectedICPRangeHistoryItem, setSelectedICPRangeHistoryItem] = useState<ICPRange | null>(null);
  const [selectedIAERangeHistoryItem, setSelectedIAERangeHistoryItem] = useState<IAERange | null>(null);
  const [processHistoricalCollections, setProcessHistoricalCollections] = useState<ProcessedHistoricalCollection>();

  const [historicalCollections, setHistoricalCollections] = useState<HistoricalResponse>({});





  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  //IAE range Data
  const [IAERangeResponse, setIAERangeResponse] = useState<IAERange>()
  const [IAERangeHistoryResponse, setIAERangeHistoryResponse] = useState<IAERange[]>([])


  const handleICPHistoryClick = (item: ICPRange) => {
    setSelectedICPRangeHistoryItem(item);
    setIsSidebarOpen(true);
  };

  const handleIAEHistoryClick = (item: IAERange) => {
    setSelectedIAERangeHistoryItem(item);
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setSelectedICPRangeHistoryItem(null);
    setSelectedIAERangeHistoryItem(null);
  };


  // Simulate data loading
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);


  // Only store history for range de datas
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([])
  const [currentHistoryItem, setCurrentHistoryItem] = useState<AnalysisHistory | null>(null)


  // 
  const [alertCalculateICP, setAlertCalculateICP] = useState(false)


  const [journeys, setJourneys] = useState<any[]>(
    []
  )
  useEffect(() => {
    axios.get("http://localhost:8095/v1/metrics/journeys/my", { headers: { Authorization: `Bearer ${accessToken}` } }).then(
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

  function ConcatDateAndTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const dateFinal = new Date(year, month, day, hours, minutes, 0, 0);

    dateFinal.setTime(dateFinal.getTime() - dateFinal.getTimezoneOffset() * 60 * 1000);

    return dateFinal.toISOString().split(".")[0]
  }



  // Reset configuration when changing collection type
  const handleCollectionTypeChange = async (metric: "ICP" | "IAE", newType: "range" | "periodica") => {
    let response

    if (newType === "periodica" && metric == "ICP") {
      setCollectionType(newType)

      //Ve se tem algum existente
      response = await axios.get("http://localhost:8095/v1/metrics/icp/periodic/in-progress",
        { headers: { Authorization: `Bearer ${accessToken}` } })
      
      //Pegar historico ICP Periodico
        const historyResponse = await axios.get(
        "http://localhost:8095/v1/metrics/icp/periodic/history",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setHistoricalCollections(historyResponse.data);


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

      if (metric == "ICP") {
        try {
          response = await axios.get("http://localhost:8095/v1/metrics/icp/range/history",
            { headers: { Authorization: `Bearer ${accessToken}` } })
          console.log("icp")
          setICPRangeHistoryResponse(response.data)
        }
        catch (error) {
          setICPRangeHistoryResponse([])
        }

      }
      else {
        try {
          response = await axios.get("http://localhost:8095/v1/metrics/iae/range/history",
            { headers: { Authorization: `Bearer ${accessToken}` } })
          console.log("iae")
          setIAERangeHistoryResponse(response.data)
        }
        catch (error) {
          setIAERangeHistoryResponse([])
        }
      }
    }

  }

  useEffect(() => {
    handleCollectionTypeChange(activeMetric, "range")
  }, [])

  const clearConfig = (newType: "range" | "periodica") => {
    setCollectionType(newType)
    // Reset configuration data
    setSelectedJourney(null)
    setSelectedMap(null)
    setStartDate(undefined)
    setEndDate(undefined)
    setStartTime("")
    setEndTime("")
    setPeriodicidade("Anual")
    setSelectedStudents([])
    setShowResults(false)
    setCurrentHistoryItem(null)
  }


  const handleCalculate = () => {
    if (selectedJourney && selectedMap && startDate && endDate) {
      // Only add to history if it's range de datas
      if (collectionType === "range" && activeMetric === "ICP") {
        const newRangeDatesICP: RangeDatesICP = {
          map_id: selectedMap.id,
          convergence_point: pointTypes.decisao,
          divergence_point: pointTypes.debate,
          essay_point: pointTypes.avaliacao,
          dynamic_weights: dynamicWeights,
          weight_gap: icpWeights.pesoGAP[0],
          weight_rpp: icpWeights.pesoRPP[0],
          start_date: new Date(startDate),
          end_date: new Date(endDate),
        }

        axios.post("http://localhost:8095/v1/metrics/icp/range", newRangeDatesICP, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then(response => {
            // Verifica se os dados estão completos
            if (!response.data) {
              setShowResults(false)
              return;
            };

            setSelectedPointsRangeICP({
              avaliacao: response.data.essay_point,
              debate: response.data.divergence_point,
              decisao: response.data.convergence_point,
            })

            setSelectedWeightsRangeICP({
              dynamic_weights: false,
              weight_x: response.data.weight_gap,
              weight_y: response.data.weight_rpp,
            })

            setSelectedClassRangeICP({
              journey_name: response.data.journey_name,
              map_name: response.data.map_name
            })

            const students = response.data.participation_consistency_per_users.map((value: any) => ({
              id: value.user_id,
              name: value.user_name,
              averageRPP: value.user_average_rpp.toFixed(2),
              averageGAP: value.user_average_gap.toFixed(2),
              averageICP: value.user_average_icp.toFixed(2),
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
              students,
            }

            setAnalysisHistory([newAnalysis, ...analysisHistory])
            setCurrentHistoryItem(newAnalysis)
            setSelectedStudents([])
          }).catch((error) => {
            setShowResults(false);
            alert("Erro");
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
          weight_tap: iaeWeights.pesoTAP[0],
          weight_taprog: iaeWeights.pesoTAProg[0],
          start_date: new Date(startDate),
          end_date: new Date(endDate),
        }

        axios.post("http://localhost:8095/v1/metrics/iae/range",
          newRangeDatesIAE,
          { headers: { Authorization: `Bearer ${accessToken}` } }).
          then(response => {
            if (!response.data) {
              setShowResults(false)
              return;
            };

            const responseIAE: IAERange = {
              map_id: response.data.map_id,
              journey_name: response.data.journey_name,
              map_name: response.data.map_name,
              periodic_collection: response.data.periodic_collection,
              points_indexes: response.data.points_indexes,
              periodic_iaeid: response.data.periodic_iaeid,
              user_id: response.data.user_id,
              divergence_point: response.data.divergence_point,
              convergence_point: response.data.convergence_point,
              essay_point: response.data.essay_point,
              start_date: response.data.start_date,
              end_date: response.data.end_date,
              dynamic_weights: response.data.dynamic_weights,
              weight_tap: response.data.weight_tap,
              weight_taprog: response.data.weight_taprog,
              active: response.data.active,
              id: response.data.id,
              version: response.data.version,
              created_at: response.data.created_at,
              created_by: response.data.created_by,
              updated_at: response.data.updated_at,
              updated_by: response.data.updated_by,
              ancestors: response.data.ancestors,
            }
            setIAERangeResponse(responseIAE)
          }).catch((error) => {
            setShowResults(false);
            alert("Erro");
          });
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
            weight_gap: icpWeights.pesoGAP[0],
            weight_rpp: icpWeights.pesoRPP[0],
            start_date: ConcatDateAndTime(startDate, startTime),
            end_date: ConcatDateAndTime(endDate, endTime),
            periodicity: periodicidade
          }

          axios.post("http://localhost:8095/v1/metrics/icp/periodic",
            newRangeDatesICP,
            { headers: { Authorization: `Bearer ${accessToken}` } })
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
                        handleCollectionTypeChange("ICP", "range")
                        setShowResults(false)
                        setSelectedStudents([])
                        setCurrentHistoryItem(null)
                        setSelectedIAERangeHistoryItem(null);
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
                        handleCollectionTypeChange("IAE", "range")
                        setShowResults(false)
                        setSelectedStudents([])
                        setCurrentHistoryItem(null)
                        setSelectedICPRangeHistoryItem(null);


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
                    {activeMetric === "ICP"
                      ? "Dashboard ICP: Análise do Índice de Consistência de Participação"
                      : "Dashboard IAE: Análise do Índice de Abandono Estruturado"}
                  </p>
                </div>

                {/* Collection Type */}
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
                        onChange={() => handleCollectionTypeChange(activeMetric, "range")}
                        className="text-purple-600"
                      />
                      <label htmlFor="range" className="text-sm">
                        Personalizada
                      </label>
                    </div>

                    {/* AQUI ESTÁ A MUDANÇA: SÓ RENDERIZA SE A MÉTRICA NÃO FOR IAE */}
                    {activeMetric !== "IAE" && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="periodica"
                          name="coleta"
                          checked={collectionType === "periodica"}
                          onChange={() => handleCollectionTypeChange(activeMetric, "periodica")}
                          className="text-purple-600"
                        />
                        <label htmlFor="periodica" className="text-sm">
                          Dinâmica
                        </label>
                      </div>
                    )}
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
                              className={cn("w-full mt-1 pl-3 text-left font-normal", !endDate && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "dd/MM/yyyy") : <span>Selecione</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
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
                              className={cn("w-full mt-1 pl-3 text-left font-normal", !endDate && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "dd/MM/yyyy") : <span>Selecione</span>}
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
                {activeMetric === "ICP" && collectionType === "periodica" && <ICPPEriodic chartDataPoints={chartDataPoints} setShowResults={setShowResults} />}

                {activeMetric === "ICP" && collectionType === "range" && (
                  <>
                    {/* Bloco de Informações da Turma */}
                    <Informations informations={selectedClassRangeICP} />

                    {/* Card para Seleção de Alunos */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Users className="h-4 w-4" />
                          Selecionar Alunos para Comparação
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Adicionar Aluno</Label>
                            <Select
                              onValueChange={(value) => {
                                const student = availableStudents.find((s) => s.id === value);
                                if (student) addStudent(student);
                              }}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Selecione um aluno" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableStudents
                                  .filter((student) => !selectedStudents.some((s) => s.id === student.id))
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
                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedStudents.map((student) => (
                                  <Badge
                                    key={student.id}
                                    variant="secondary"
                                    className="flex items-center gap-2 px-3 py-1"
                                  >
                                    {student.name}
                                    <button onClick={() => removeStudent(student.id)}>
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Card para Comparação de ICP */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <TrendingUp className="h-4 w-4" />
                          Comparação de ICP
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6"> {/* Aumentado o espaçamento para melhor visualização */}
                        {/* Comparativo da Turma */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Turma</span>
                            <span className="text-sm font-bold">{currentHistoryItem?.result}%</span>
                          </div>
                          <div className="h-3 w-full rounded-full bg-gray-200">
                            <div
                              className="h-3 rounded-full bg-purple-500"
                              style={{ width: `${currentHistoryItem?.result}%` }}
                            />
                          </div>
                        </div>

                        {/* Comparativo por Aluno */}
                        {selectedStudents.map((student) => {
                          const studentICP = student.averageICP ?? 0;
                          const classResult = currentHistoryItem?.result ?? 0;
                          const isAbove = studentICP > classResult;
                          const difference = (studentICP - classResult).toFixed(2);

                          return (
                            <div key={student.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{student.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold">{studentICP}%</span>
                                  <span className={`text-xs ${isAbove ? "text-green-600" : "text-red-600"}`}>
                                    ({isAbove ? "+" : ""}{difference}%)
                                  </span>
                                </div>
                              </div>
                              <div className="h-3 w-full rounded-full bg-gray-200">
                                <div
                                  className={`h-3 rounded-full ${isAbove ? "bg-green-500" : "bg-red-500"}`}
                                  style={{ width: `${studentICP}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}

                        {/* Pontos Selecionados */}
                        <div>
                          <SelectionPointsCard
                            debate={selectedPointsRangeICP.debate}
                            avaliacao={selectedPointsRangeICP.avaliacao}
                            decisao={selectedPointsRangeICP.decisao}
                          />
                        </div>

                        {/* Pesos */}
                        <WeightsCard
                          dynamicWeights={selectedWeightsRangeICP.dynamic_weights}
                          weightX={selectedWeightsRangeICP.weight_x}
                          weightY={selectedWeightsRangeICP.weight_y}
                          weightXName="Peso do GAP"
                          weightXDescription="Mede a regularidade das participações, penalizando alunos que interagem de forma intercalada."
                          weightXAbbreviation="GAP"
                          weightYName="Peso do RPP"
                          weightYDescription="Mede a continuidade das participações, penalizando ausências prolongadas ao longo do tempo."
                          weightYAbbreviation="RPP"
                        />
                      </CardContent>
                    </Card>

                    {/* Legenda do ICP */}
                    <ICPLegend />
                  </>
                )}

                {/* IAE Line Chart */}
                {activeMetric === "IAE" && collectionType === "range" && (
                  <IAERangeSection
                    iaeRangeResponse={IAERangeResponse!}
                  />

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

            {/* Analysis History - ICP */}
            {collectionType === "range" && activeMetric == "ICP" && (
              <>
                <HistoryCard
                  historyItems={ICPRangeHistoryResponse}
                  onSelectItem={handleICPHistoryClick}
                  className="w-full"
                  isLoading={isLoading}
                />


                {/* Detail Sidebar */}
                <DetailSidebar
                  item={selectedICPRangeHistoryItem}
                  isOpen={isSidebarOpen}
                  onClose={handleSidebarClose}
                  chartDataPoints={chartDataPoints}
                />
              </>

            )}
            {/* Analysis History - IAE */}
            {collectionType === "range" && activeMetric == "IAE" && (
              <>
                <IAERangeHistorySection
                  historyData={IAERangeHistoryResponse}
                  onHistoryCardClick={handleIAEHistoryClick}
                />

                <IAERangeHistorySidebar
                  isOpen={isSidebarOpen}
                  selectedHistoryItem={selectedIAERangeHistoryItem}
                  onClose={handleSidebarClose}
                  IAERangeResponse={selectedIAERangeHistoryItem!}
                />
              </>
            )}

            {/* Analysis History - ICP */}
            {collectionType === "periodica" && activeMetric == "ICP" && (
              <>
                <HistoricalCollectionsPanel
                  historicalCollectionsData={historicalCollections}
                />
              </>
            )}

          </div>
        </div>
      </div>
    </div >
  )
}
