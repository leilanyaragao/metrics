"use client"

import { useState, useEffect } from "react"
import { dashboardService } from "../services/dashboardService"
import type {
  Student,
  Map,
  HistoryItem,
  AnalysisConfig,
  ICPData,
  ICPTimeData,
  IAEData,
  IAETimeData,
} from "../types/dashboard"

export function useDashboardData() {
  const [students, setStudents] = useState<Student[]>([])
  const [maps, setMaps] = useState<Map[]>([])
  const [pointTypes, setPointTypes] = useState<string[]>([])
  const [periods, setPeriods] = useState<Array<{ value: string; label: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [studentsData, mapsData, pointTypesData, periodsData] = await Promise.all([
          dashboardService.getStudents(),
          dashboardService.getMaps(),
          dashboardService.getPointTypes(),
          dashboardService.getPeriods(),
        ])

        setStudents(studentsData)
        setMaps(mapsData)
        setPointTypes(pointTypesData)
        setPeriods(periodsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados iniciais")
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  return {
    students,
    maps,
    pointTypes,
    periods,
    loading,
    error,
    refetch: () => {
      // Recarregar dados se necessário
    },
  }
}

export function useAnalysis() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [icpData, setIcpData] = useState<ICPData[] | null>(null)
  const [icpTimeData, setIcpTimeData] = useState<ICPTimeData[] | null>(null)
  const [iaeData, setIaeData] = useState<IAEData[] | null>(null)
  const [iaeTimeData, setIaeTimeData] = useState<IAETimeData[] | null>(null)

  const calculateAnalysis = async (config: AnalysisConfig) => {
    try {
      setLoading(true)
      setError(null)

      if (config.metric === "icp") {
        if (config.collectionType === "range") {
          const data = await dashboardService.calculateICPRange(config)
          setIcpData(data)
        } else {
          const data = await dashboardService.getICPPeriodic(config)
          setIcpTimeData(data)
        }
      } else {
        if (config.collectionType === "range") {
          const data = await dashboardService.calculateIAERange(config)
          setIaeData(data)
        } else {
          const data = await dashboardService.getIAEPeriodic(config)
          setIaeTimeData(data)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao calcular análise")
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setIcpData(null)
    setIcpTimeData(null)
    setIaeData(null)
    setIaeTimeData(null)
    setError(null)
  }

  return {
    loading,
    error,
    icpData,
    icpTimeData,
    iaeData,
    iaeTimeData,
    calculateAnalysis,
    clearResults,
  }
}

export function useHistory() {
  const [icpHistory, setIcpHistory] = useState<HistoryItem[]>([])
  const [iaeHistory, setIaeHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const [icpData, iaeData] = await Promise.all([dashboardService.getICPHistory(), dashboardService.getIAEHistory()])

      setIcpHistory(icpData)
      setIaeHistory(iaeData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar histórico")
    } finally {
      setLoading(false)
    }
  }

  const saveAnalysis = async (analysis: HistoryItem) => {
    try {
      const savedAnalysis = await dashboardService.saveAnalysis(analysis)

      if (analysis.metric === "icp") {
        setIcpHistory((prev) => [savedAnalysis, ...prev])
      } else {
        setIaeHistory((prev) => [savedAnalysis, ...prev])
      }

      return savedAnalysis
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar análise")
      throw err
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  return {
    icpHistory,
    iaeHistory,
    loading,
    error,
    saveAnalysis,
    refetch: loadHistory,
  }
}
