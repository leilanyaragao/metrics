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

const acessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJsZWlsYW55LnVsaXNzZXNAdGRzLmNvbXBhbnkiLCJ1aWQiOiI2NjdiMWJlZjIzYzY5ZTY2ZjM0MzYyYjciLCJyb2xlcyI6W10sIm5hbWUiOiJMZWlsYW55IFVsaXNzZXMiLCJleHAiOjE3NDkwOTQ4MjQsImlhdCI6MTc0OTA4MDQyNH0.6EHcMri6oe2FzDEg-He3juScpKByzhbL77LqAuSfe68AgCMOFQOKYav1IU5yleme607Cvzr4An25G0JEqjMLYQ"

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

export default function MetricsDashboard() {
  const [showResults, setShowResults] = useState(false)
  const [activeMetric, setActiveMetric] = useState<"ICP" | "IAE">("ICP")
  const [selectedJourney, setSelectedJourney] = useState<any>(null)
  const [selectedMap, setSelectedMap] = useState<any>(null)
  const [startDate, setStartDate] = useState("")
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

  // Only store history for range de datas
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([])
  const [currentHistoryItem, setCurrentHistoryItem] = useState<AnalysisHistory | null>(null)

  const [journeys, setJourneys] = useState<any[]> (
    []
  )
  useEffect(()=> {
    axios.get("http://localhost:8095/v1/map/metrics/journeys", {headers:{Authorization:`Bearer ${acessToken}`}}).then(
      value => setJourneys(value.data))
  },
  [])

  const [maps, setMaps] = useState<any[]> ([])
  
  useEffect(()=> {
   setMaps(journeys.find(item=>item.id === selectedJourney?.id)?.maps??[])
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

  const [periodicidade, setPeriodicidade] = useState("Anual")
  const [collectionType, setCollectionType] = useState<"range" | "periodica">(
    activeMetric === "ICP" ? "range" : "periodica",
  )
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  // Reset configuration when changing collection type
  const handleCollectionTypeChange = (newType: "range" | "periodica") => {
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
          {headers:{Authorization:`Bearer ${acessToken}`}}).
          then(response=>{
            const students = response.data.participation_consistency_per_users.map((value:any)=>({
              id: value.user_id,
              name: value.user_name,
              averageRPP: value.user_average_rpp,
              averageGAP: value.user_average_gap,
              averageICP: value.user_average_icp
            }))
            setAvailableStudents(students)
            setTurmaAvarage(response.data.class_average_icp)

            const newAnalysis: AnalysisHistory = {
              id: Date.now().toString(),
              journey: selectedJourney,
              map: selectedMap,
              date: response.data.created_at,
              period: `${startDate} - ${endDate}`,
              result: response.data.class_average_icp,
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
      if (collectionType === "range" && activeMetric === "IAE") {
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
          {headers:{Authorization:`Bearer ${acessToken}`}})

        const newAnalysis: AnalysisHistory = {
          id: Date.now().toString(),
          journey: selectedJourney,
          map: selectedMap,
          date: new Date().toLocaleDateString("pt-BR"),
          period: `${startDate} - ${endDate}`,
          result: Math.floor(Math.random() * 40) + 40,
          type: activeMetric,
          collectionType,
          students: []
        }
        setAnalysisHistory([newAnalysis, ...analysisHistory])
      }


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
          <p className="text-gray-600">Análise de ICP e IAE com configurações personalizadas</p>
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
                <p className="text-sm opacity-90">Configure os parâmetros para cálculo das métricas</p>
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
                      className={`w-full font-medium pb-1 ${
                        activeMetric === "ICP"
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
                      className={`w-full font-medium pb-1 ${
                        activeMetric === "IAE"
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
                      ? "Análise do Índice de Contribuição de Participação dos alunos"
                      : "Análise do Índice de Adequação Estrutural dos pontos"}
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
                        <SelectItem value="Anual">Anual</SelectItem>
                        <SelectItem value="Semestral">Semestral</SelectItem>
                        <SelectItem value="Trimestral">Trimestral</SelectItem>
                        <SelectItem value="Mensal">Mensal</SelectItem>
                        <SelectItem value="Semanal">Semanal</SelectItem>
                        <SelectItem value="Diário">Diário</SelectItem>
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
                      <div>
                        <Label htmlFor="start-date" className="text-xs text-gray-500">
                          Data Início
                        </Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date" className="text-xs text-gray-500">
                          Data Final
                        </Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label htmlFor="start-date-periodic" className="text-xs text-gray-500">
                          Data Início
                        </Label>
                        <Input
                          id="start-date-periodic"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="start-time" className="text-xs text-gray-500">
                          Hora Início
                        </Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date-periodic" className="text-xs text-gray-500">
                          Data Término
                        </Label>
                        <Input
                          id="end-date-periodic"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time" className="text-xs text-gray-500">
                          Hora de Término
                        </Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => endTime(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Journey Selection */}
                <div>
                  <Label className="text-sm font-medium">Jornada</Label>
                  <Select value={selectedJourney?.id} onValueChange={(value)=>setSelectedJourney(journeys.find(item=>item.id===value))}>
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
                    <Select value={selectedMap?.id} onValueChange={(value)=>setSelectedMap(maps.find(item=>item.id===value))}>
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
                          <Info className="w-4 h-4 text-gray-400" />
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
                            <Label className="text-xs">Peso GAP</Label>
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
                            <Label className="text-xs">Peso RPP</Label>
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
                              <Label className="text-xs">Peso TAP</Label>
                              <span className="text-xs font-medium text-red-600">{iaeWeights.pesoTAP[0]}%</span>
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
                              <Label className="text-xs">Peso TAProg</Label>
                              <span className="text-xs font-medium text-red-600">{iaeWeights.pesoTAProg[0]}%</span>
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

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-6">
            {showResults ? (
              <>
                {/* Results Header */}
                <div className={`${activeMetric === "ICP" ? "bg-green-600" : "bg-blue-600"} text-white p-4 rounded-lg`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <h1 className="text-lg font-semibold">
                      Resultados - {activeMetric} {currentHistoryItem && "(Histórico)"}
                    </h1>
                  </div>
                  <p className="text-sm opacity-90">
                    {collectionType === "range" ? "Análise por Range de Datas" : `Análise Periódica - ${periodicidade}`}
                  </p>
                  <p className="text-xs opacity-75">
                    Jornada: {currentHistoryItem ? currentHistoryItem.journey.title : selectedJourney.title}
                  </p>
                  <p className="text-xs opacity-75">
                    Jornada: {currentHistoryItem ? currentHistoryItem.map.title : selectedMap.title}
                  </p>
                </div>

                {/* Student Selection for ICP */}
                {activeMetric === "ICP" && (
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

                        {/* Line Chart for ICP Periodic Collection */}
                        {collectionType === "periodica" && (
                          <div className="mt-6">
                            <div className="relative h-64 bg-gray-50 rounded-lg p-4">
                              <div className="h-48 relative">
                                {/* Y-axis labels (0-100) */}
                                <div className="absolute left-2 top-0 text-xs text-gray-500">100</div>
                                <div className="absolute left-2 top-12 text-xs text-gray-500">75</div>
                                <div className="absolute left-2 top-24 text-xs text-gray-500">50</div>
                                <div className="absolute left-2 top-36 text-xs text-gray-500">25</div>
                                <div className="absolute left-2 bottom-8 text-xs text-gray-500">0</div>

                                <svg className="absolute inset-8 w-full h-full" viewBox="0 0 400 160">
                                  {/* Grid lines */}
                                  <line x1="0" y1="32" x2="400" y2="32" stroke="#e5e7eb" strokeWidth="1" />
                                  <line x1="0" y1="64" x2="400" y2="64" stroke="#e5e7eb" strokeWidth="1" />
                                  <line x1="0" y1="96" x2="400" y2="96" stroke="#e5e7eb" strokeWidth="1" />
                                  <line x1="0" y1="128" x2="400" y2="128" stroke="#e5e7eb" strokeWidth="1" />

                                  {/* Turma line (fixed) */}
                                  <polyline
                                    points="50,85 150,80 250,75 350,70"
                                    fill="none"
                                    stroke="#6b7280"
                                    strokeWidth="3"
                                    strokeDasharray="5,5"
                                  />

                                  {/* Student lines */}
                                  {selectedStudents.map((student, index) => {
                                    const color = student.averageICP > turmaAverage! ? "#10b981" : "#ef4444"
                                    const yPos = 160 - student.averageICP * 1.6
                                    return (
                                      <polyline
                                        key={student.id}
                                        points={`50,${yPos + 10} 150,${yPos + 5} 250,${yPos} 350,${yPos - 5}`}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="2"
                                      />
                                    )
                                  })}

                                  {/* Data points */}
                                  <circle cx="50" cy="85" r="3" fill="#6b7280" />
                                  <circle cx="150" cy="80" r="3" fill="#6b7280" />
                                  <circle cx="250" cy="75" r="3" fill="#6b7280" />
                                  <circle cx="350" cy="70" r="3" fill="#6b7280" />

                                  {selectedStudents.map((student, index) => {
                                    const color = student.averageICP > turmaAverage! ? "#10b981" : "#ef4444"
                                    const yPos = 160 - student.averageICP * 1.6
                                    return (
                                      <g key={student.id}>
                                        <circle cx="50" cy={yPos + 10} r="3" fill={color} />
                                        <circle cx="150" cy={yPos + 5} r="3" fill={color} />
                                        <circle cx="250" cy={yPos} r="3" fill={color} />
                                        <circle cx="350" cy={yPos - 5} r="3" fill={color} />
                                      </g>
                                    )
                                  })}
                                </svg>

                                {/* X-axis labels (Time based on periodicidade) */}
                                {getTimeLabels().map((label, index) => (
                                  <div
                                    key={index}
                                    className="absolute bottom-2 text-xs text-gray-500"
                                    style={{ left: `${12 + index * 20}%` }}
                                  >
                                    {label}
                                  </div>
                                ))}
                              </div>

                              {/* Legend */}
                              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-0.5 bg-gray-500" style={{ borderStyle: "dashed" }}></div>
                                  <span>Turma ({turmaAverage}%)</span>
                                </div>
                                {selectedStudents.map((student) => (
                                  <div key={student.id} className="flex items-center gap-2">
                                    <div
                                      className={`w-4 h-0.5 ${student.averageICP > turmaAverage! ? "bg-green-500" : "bg-red-500"}`}
                                    ></div>
                                    <span
                                      className={student.averageICP > turmaAverage! ? "text-green-600" : "text-red-600"}
                                    >
                                      {student.name} ({student.averageICP}%)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ICP Comparison (only for range de datas) */}
                {activeMetric === "ICP" && collectionType === "range" && (
                  <Card>
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
                                {student.averageICP - currentHistoryItem?.result!}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full ${student.averageICP > currentHistoryItem?.result! ? "bg-green-500" : "bg-red-500"}`}
                              style={{ width: `${student.averageICP}%` }}
                            />
                          </div>
                        </div>
                      ))}

              
                    </CardContent>
                  </Card>
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
                        <div className="h-64 relative">
                          {/* Y-axis labels (0-100) */}
                          <div className="absolute left-0 top-0 text-xs text-gray-500">100</div>
                          <div className="absolute left-0 top-12 text-xs text-gray-500">75</div>
                          <div className="absolute left-0 top-24 text-xs text-gray-500">50</div>
                          <div className="absolute left-0 top-36 text-xs text-gray-500">25</div>
                          <div className="absolute left-0 bottom-12 text-xs text-gray-500">0</div>

                          {/* Chart area */}
                          <div className="absolute left-8 top-0 right-4 bottom-8">
                            <svg className="w-full h-full" viewBox="0 0 400 200">
                              {/* Horizontal grid lines */}
                              <line x1="0" y1="0" x2="400" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                              <line x1="0" y1="50" x2="400" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                              <line x1="0" y1="100" x2="400" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                              <line x1="0" y1="150" x2="400" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                              <line x1="0" y1="200" x2="400" y2="200" stroke="#e5e7eb" strokeWidth="1" />

                              {/* Vertical grid lines aligned with data points */}
                              <line x1="50" y1="0" x2="50" y2="200" stroke="#f3f4f6" strokeWidth="1" />
                              <line x1="150" y1="0" x2="150" y2="200" stroke="#f3f4f6" strokeWidth="1" />
                              <line x1="250" y1="0" x2="250" y2="200" stroke="#f3f4f6" strokeWidth="1" />
                              <line x1="350" y1="0" x2="350" y2="200" stroke="#f3f4f6" strokeWidth="1" />

                              {(() => {
                                // Sample data for demonstration
                                const iaeData = [65, 72, 68, 75] // IAE values for 4 points/periods
                                const tapData = [58, 69, 74, 71] // TAP values
                                const taprogData = [62, 66, 70, 78] // TAProg values

                                // X positions aligned with grid lines and labels
                                const xPositions = [50, 150, 250, 350]

                                // Convert percentage to Y position (invert because SVG Y increases downward)
                                const getYPos = (percentage) => 200 - percentage * 2

                                return (
                                  <g>
                                    {/* IAE line */}
                                    <polyline
                                      points={xPositions.map((x, i) => `${x},${getYPos(iaeData[i])}`).join(" ")}
                                      fill="none"
                                      stroke="#3b82f6"
                                      strokeWidth="3"
                                    />

                                    {/* TAP line */}
                                    <polyline
                                      points={xPositions.map((x, i) => `${x},${getYPos(tapData[i])}`).join(" ")}
                                      fill="none"
                                      stroke="#10b981"
                                      strokeWidth="3"
                                    />

                                    {/* TAProg line */}
                                    <polyline
                                      points={xPositions.map((x, i) => `${x},${getYPos(taprogData[i])}`).join(" ")}
                                      fill="none"
                                      stroke="#f59e0b"
                                      strokeWidth="3"
                                    />

                                    {/* Data points with hover areas */}
                                    {xPositions.map((x, i) => (
                                      <g key={i}>
                                        {/* IAE point */}
                                        <circle
                                          cx={x}
                                          cy={getYPos(iaeData[i])}
                                          r="4"
                                          fill="#3b82f6"
                                          className="hover:r-6 cursor-pointer transition-all"
                                        />

                                        {/* TAP point */}
                                        <circle
                                          cx={x}
                                          cy={getYPos(tapData[i])}
                                          r="4"
                                          fill="#10b981"
                                          className="hover:r-6 cursor-pointer transition-all"
                                        />

                                        {/* TAProg point */}
                                        <circle
                                          cx={x}
                                          cy={getYPos(taprogData[i])}
                                          r="4"
                                          fill="#f59e0b"
                                          className="hover:r-6 cursor-pointer transition-all"
                                        />

                                        {/* Invisible hover area for tooltip */}
                                        <rect
                                          x={x - 20}
                                          y="0"
                                          width="40"
                                          height="200"
                                          fill="transparent"
                                          className="cursor-pointer"
                                          onMouseEnter={(e) => {
                                            const tooltip = document.getElementById(`tooltip-${i}`)
                                            if (tooltip) {
                                              tooltip.style.display = "block"
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            const tooltip = document.getElementById(`tooltip-${i}`)
                                            if (tooltip) {
                                              tooltip.style.display = "none"
                                            }
                                          }}
                                        />
                                      </g>
                                    ))}

                                    {/* Tooltips positioned relative to chart */}
                                    {xPositions.map((x, i) => (
                                      <foreignObject key={`tooltip-${i}`} x={x - 60} y="10" width="120" height="80">
                                        <div
                                          id={`tooltip-${i}`}
                                          className="bg-white border border-gray-300 rounded-lg p-2 shadow-lg text-xs"
                                          style={{ display: "none" }}
                                        >
                                          <div className="font-medium mb-1 text-center">
                                            {collectionType === "range"
                                              ? `Ponto ${String.fromCharCode(65 + i)}`
                                              : getTimeLabels()[i]}
                                          </div>
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                              <span>IAE: {iaeData[i]}%</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                              <span>TAP: {tapData[i]}%</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                              <span>TAProg: {taprogData[i]}%</span>
                                            </div>
                                          </div>
                                        </div>
                                      </foreignObject>
                                    ))}
                                  </g>
                                )
                              })()}
                            </svg>
                          </div>

                          {/* X-axis labels aligned with data points */}
                          <div className="absolute left-8 right-4 bottom-0 flex justify-between text-xs text-gray-500">
                            {collectionType === "range" ? (
                              // Map Points for range de datas
                              <>
                                <div className="text-center">Ponto A</div>
                                <div className="text-center">Ponto B</div>
                                <div className="text-center">Ponto C</div>
                                <div className="text-center">Ponto D</div>
                              </>
                            ) : (
                              // Time labels for periodic collection
                              getTimeLabels().map((label, index) => (
                                <div key={index} className="text-center">
                                  {label}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex gap-6 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-blue-500"></div>
                            <span>IAE - Índice de Adequação Estrutural</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-green-500"></div>
                            <span>TAP - Tempo de Adequação do Ponto</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-yellow-500"></div>
                            <span>TAProg - Tempo de Adequação Progressiva</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary Cards */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="p-4 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg">
                          <div className="text-sm font-medium text-blue-800">IAE Médio</div>
                          <div className="text-2xl font-bold text-blue-600">70%</div>
                          <div className="text-xs text-blue-600">Índice de Adequação Estrutural</div>
                        </div>
                        <div className="p-4 border-l-4 border-green-400 bg-green-50 rounded-r-lg">
                          <div className="text-sm font-medium text-green-800">TAP Médio</div>
                          <div className="text-2xl font-bold text-green-600">68%</div>
                          <div className="text-xs text-green-600">Tempo de Adequação do Ponto</div>
                        </div>
                        <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg">
                          <div className="text-sm font-medium text-yellow-800">TAProg Médio</div>
                          <div className="text-2xl font-bold text-yellow-600">69%</div>
                          <div className="text-xs text-yellow-600">Tempo de Adequação Progressiva</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Average Display for ICP */}
                {activeMetric === "ICP" && (
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-800">ICP Médio da Turma</span>
                      </div>
                      <div className="text-4xl font-bold text-red-600">{currentHistoryItem?.result}%</div>
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
                                <div className="font-medium text-sm">{analysis.journey.title}</div>
                                <div className="text-xs text-gray-600">Período de Análise: {analysis.date}</div>
                                <div className="text-xs text-gray-600">Período: {analysis.period}</div>
                                <div className="text-xs text-gray-600">Jornada: {analysis.journey.title}</div>
                                <div className="text-xs text-gray-600">Mapa: {analysis.map.title}</div>

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
