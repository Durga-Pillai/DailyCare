// src/state/usePatients.ts

import { useQuery } from '@tanstack/react-query'
import { fetchPatients } from '../api/client'
import type { Patient } from '../api/types'

export function usePatients() {
  const query = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
  })

  return {
    patients: query.data ?? [],        // never undefined — default to []
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}