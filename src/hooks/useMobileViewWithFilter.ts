import { useState, useCallback, useEffect } from "react";
import { useApiDataQuery } from "./useDataQuery";
import moment, { MomentInput } from 'moment';

/**
 * Interface untuk konfigurasi mobile view dengan filter
 */
interface MobileViewWithFilterConfig<TData = any> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ data: TData[] }>;
  gcTime?: number;
  filterKey?: any; // key untuk filtering data berdasarkan tanggal
  Track?: boolean; // parameter Track untuk conditional rendering
}

/**
 * Interface untuk hasil mobile view dengan filter
 */
interface MobileViewWithFilterResult<TData = any> {
  // Data states
  data: { data: TData[] } | undefined;
  extractedData: TData[];
  initialData: TData[];
  filteredData: TData[];
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
  hasData: boolean;
  
  // Dialog states
  isDialogOpen: boolean;
  selectedData: TData | null;
  isView: boolean;
  isDeleted: boolean;
  Track?: boolean;
  
  // Filter states
  month: number;
  year: number;
  
  // Dialog handlers
  onDeleteOpen: (data: TData) => void;
  onEditOpen: (data: TData) => void;
  onViewOpen: (data: TData) => void;
  handleAddNew: () => void;
  onCloseDialog: (value: boolean) => void;
  
  // Filter handlers
  handleDateChange: (date: Date) => void;
  handleResetData: () => void;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  
  // Helper methods
  showEmptyState: boolean;
  showGrid: boolean;
}

/**
 * Custom hook untuk mobile view dengan filtering capabilities
 * @param config - Konfigurasi mobile view dengan filter
 * @returns Object berisi state dan handlers untuk mobile view dengan filter
 */
export const useMobileViewWithFilter = <TData = any>(
  config: MobileViewWithFilterConfig<TData>
): MobileViewWithFilterResult<TData> => {
  const { queryKey, queryFn, gcTime, filterKey = 'tanggalData' as keyof TData, Track = false } = config;
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<TData | null>(null);
  const [isView, setIsView] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  
  // Filter states
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [initialData, setInitialData] = useState<TData[]>([]);
  const [filteredData, setFilteredData] = useState<TData[]>([]);
  
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
  
  // Update data when extracted data changes
  useEffect(() => {
    if (extractedData) {
      setInitialData(extractedData);
      setFilteredData(extractedData);
    }
  }, [extractedData]);
  
  // Handle date filtering
  const handleDateChange = useCallback((date: Date) => {
    const filtered = initialData.filter((item: any) => {
      const itemDate = moment(item[filterKey]);
      const selectedDate = moment(date);
      return (
        itemDate.isSame(selectedDate, "month") &&
        itemDate.isSame(selectedDate, "year")
      );
    });
    setFilteredData(filtered);
    setMonth(date.getMonth());
    setYear(date.getFullYear());
  }, [initialData, filterKey]);
  
  // Handle reset data
  const handleResetData = useCallback(() => {
    setFilteredData(initialData);
  }, [initialData]);
  
  // Dialog handlers
  const onDeleteOpen = useCallback((dataPenyu: TData) => {
    setSelectedData(dataPenyu);
    setIsDialogOpen(true);
    setIsDeleted(true);
  }, []);
  
  const onEditOpen = useCallback((dataPenyu: TData) => {
    setSelectedData(dataPenyu);
    setIsDialogOpen(true);
  }, []);
  
  const onViewOpen = useCallback((dataPenyu: TData) => {
    setSelectedData(dataPenyu);
    setIsDialogOpen(true);
    setIsView(true);
  }, []);
  
  const handleAddNew = useCallback(() => {
    setIsDialogOpen(true);
    setSelectedData(null);
    setIsView(false);
    setIsDeleted(false);
  }, []);
  
  const onCloseDialog = useCallback((value: boolean) => {
    setIsDialogOpen(value);
    if (!value) {
      setSelectedData(null);
    }
    if (isView || isDeleted) {
      setIsView(false);
      setIsDeleted(false);
    }
  }, [isView, isDeleted]);
  
  // Helper computed values
  const showEmptyState = !isFetching && (!filteredData || filteredData.length === 0);
  const showGrid = !isFetching && filteredData && filteredData.length > 0;
  
  return {
    // Data states
    data,
    extractedData: extractedData || [],
    initialData,
    filteredData,
    isFetching,
    isError: !!isError,
    isEmpty,
    hasData,
    
    // Dialog states  
    isDialogOpen,
    selectedData,
    isView,
    isDeleted,
    Track,
    
    // Filter states
    month,
    year,
    
    // Dialog handlers
    onDeleteOpen,
    onEditOpen,
    onViewOpen,
    handleAddNew,
    onCloseDialog,
    
    // Filter handlers
    handleDateChange,
    handleResetData,
    setMonth,
    setYear,
    
    // Helper methods
    showEmptyState,
    showGrid,
  };
};
