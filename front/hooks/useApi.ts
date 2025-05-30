"use client"

import { useState, useEffect } from "react"
import { API_CONFIG, buildApiUrl, getAuthHeaders } from "../config/api"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  immediate?: boolean
  dependencies?: any[]
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = { immediate: true },
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

      const response = await fetch(buildApiUrl(endpoint), {
        headers: getAuthHeaders(),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setState({ data: result.data || result, loading: false, error: null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      setState({ data: null, loading: false, error: errorMessage })
    }
  }

  useEffect(() => {
    if (options.immediate) {
      fetchData()
    }
  }, options.dependencies || [])

  return {
    ...state,
    refetch: fetchData,
  }
}

// Hook para POST requests
export function useApiPost<T, R = any>() {
  const [state, setState] = useState<UseApiState<R>>({
    data: null,
    loading: false,
    error: null,
  })

  const post = async (endpoint: string, data: T): Promise<R | null> => {
    setState({ data: null, loading: true, error: null })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

      const response = await fetch(buildApiUrl(endpoint), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setState({ data: result.data || result, loading: false, error: null })
      return result.data || result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      setState({ data: null, loading: false, error: errorMessage })
      return null
    }
  }

  return {
    ...state,
    post,
  }
}
