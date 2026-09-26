import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { TIME } from "@/env/time.mjs";

/**
 * Interface untuk konfigurasi data query
 */
interface DataQueryConfig<TData = any, TError = Error> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  gcTime?: number;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number;
}

/**
 * Hook untuk mengelola data fetching dengan React Query
 * @param config - Konfigurasi query
 * @returns UseQueryResult dengan tambahan helper functions
 */
export const useDataQuery = <TData = any, TError = Error>(
  config: DataQueryConfig<TData, TError>
): UseQueryResult<TData, TError> & {
  isEmpty: boolean;
  hasData: boolean;
} => {
  const {
    queryKey,
    queryFn,
    enabled = true,
    gcTime = TIME?.CACHE?.LONG || 300000, // 5 menit default
    staleTime = 30000, // 30 detik default
    refetchOnWindowFocus = false,
    retry = 3,
  } = config;

  const queryResult = useQuery<TData, TError>({
    queryKey,
    queryFn,
    enabled,
    gcTime,
    staleTime,
    refetchOnWindowFocus,
    retry,
  } as UseQueryOptions<TData, TError>);

  const { data } = queryResult;

  // Helper untuk mengecek apakah data kosong
  const isEmpty = !data || (Array.isArray(data) && data.length === 0);
  
  // Helper untuk mengecek apakah ada data
  const hasData = !!data && (!Array.isArray(data) || data.length > 0);

  return {
    ...queryResult,
    isEmpty,
    hasData,
  };
};

/**
 * Hook khusus untuk data dengan struktur API response standar
 * @param config - Konfigurasi query
 * Fungsi ini menggunakan Tanstack (Silahkan baca configurasinya)
 */
export const useApiDataQuery = <TData = any, TError = Error>(
  config: DataQueryConfig<{ data: TData }, TError>
): UseQueryResult<{ data: TData }, TError> & {
  isEmpty: boolean;
  hasData: boolean;
  extractedData: TData | undefined;
} => {
  const queryResult = useDataQuery(config);
  
  // Ekstrak data dari response
  const extractedData = queryResult.data?.data;
  
  // Override isEmpty dan hasData untuk data yang diekstrak
  const isEmpty = !extractedData || (Array.isArray(extractedData) && extractedData.length === 0);
  const hasData = !!extractedData && (!Array.isArray(extractedData) || extractedData.length > 0);

  return {
    ...queryResult,
    isEmpty,
    hasData,
    extractedData,
  };
};
