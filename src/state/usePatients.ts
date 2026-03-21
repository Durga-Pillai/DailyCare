import { useQuery } from '@tanstack/react-query'
import { fetchPatients } from '../api/client'

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