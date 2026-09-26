import { useState, useCallback } from "react";
import { useApiDataQuery } from "./useDataQuery";

/**
 * Interface untuk konfigurasi mobile view dengan multiple dialogs
 */
interface MobileViewMultiDialogConfig<TData = any> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ data: TData[] }>;
  gcTime?: number;
}

/**
 * Interface untuk hasil mobile view dengan multiple dialogs
 */
interface MobileViewMultiDialogResult<TData = any> {
  // Data states
  data: { data: TData[] } | undefined;
  extractedData: TData[];
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
  hasData: boolean;
  
  // Dialog states
  isDialogOpen: boolean;
  selectedData: TData | null;
  isView: boolean;
  isDownload: boolean;
  
  // Dialog handlers
  onDownload: (data: TData) => void;
  onViewOpen: (data: TData) => void;
  handleAddNew: () => void;
  onCloseDialog: (value: boolean) => void;
  
  // Helper methods
  showEmptyState: boolean;
  showGrid: boolean|undefined;
}

/**
 * Custom hook untuk mobile view dengan multiple dialog states
 * @param config - Konfigurasi mobile view
 * @returns Object berisi state dan handlers untuk mobile view dengan multiple dialogs
 */
export const useMobileViewMultiDialog = <TData = any>(
  config: MobileViewMultiDialogConfig<TData>
): MobileViewMultiDialogResult<TData> => {
  const { queryKey, queryFn, gcTime } = config;
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<TData | null>(null);
  const [isView, setIsView] = useState<boolean>(false);
  const [isDownload, setIsDownload] = useState<boolean>(false);
  
  // Data fetching
  const {
    data,
    isFetching,
    error: isError,
    extractedData,
    isEmpty,
    hasData
  } = useApiDataQuery<TData[]>({
    queryKey,
    queryFn,
    gcTime,
  });
  
  // Dialog handlers
  const onDownload = useCallback((report: TData) => {
    setSelectedData(report);
    setIsDialogOpen(true);
    setIsDownload(true);
  }, []);
  
  const onViewOpen = useCallback((report: TData) => {
    setSelectedData(report);
    setIsDialogOpen(true);
    setIsView(true);
  }, []);
  
  const handleAddNew = useCallback(() => {
    setIsDialogOpen(true);
    setSelectedData(null);
    setIsView(false);
    setIsDownload(false);
  }, []);
  
  const onCloseDialog = useCallback((value: boolean) => {
    setIsDialogOpen(value);
    if (!value) {
      setSelectedData(null);
    }
    if (isView || isDownload) {
      setIsView(false);
      setIsDownload(false);
    }
  }, [isView, isDownload]);
  
  // Helper computed values
  const showEmptyState = !isFetching && (!extractedData || !Array.isArray(extractedData) || extractedData.length === 0);
  const showGrid = !isFetching && extractedData && Array.isArray(extractedData) && extractedData.length > 0;
  
  return {
    // Data states
    data,
    extractedData: extractedData || [],
    isFetching,
    isError: !!isError,
    isEmpty,
    hasData,
    
    // Dialog states  
    isDialogOpen,
    selectedData,
    isView,
    isDownload,
    
    // Dialog handlers
    onDownload,
    onViewOpen,
    handleAddNew,
    onCloseDialog,
    
    // Helper methods
    showEmptyState,
    showGrid,
  };
};
