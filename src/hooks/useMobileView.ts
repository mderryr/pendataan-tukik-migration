import * as React from "react";
import { useState, useCallback } from "react";
import { useApiDataQuery } from "./useDataQuery";

/**
 * Interface untuk konfigurasi mobile view
 */
interface MobileViewConfig<TData = any> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ data: TData[] }>;
  gcTime?: number;
}

/**
 * Interface untuk hasil mobile view
 */
interface MobileViewResult<TData = any> {
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
  isDeleted: boolean;
  isOpen: boolean; // untuk FloatingBottom
  
  // Dialog handlers
  handleDialog: (value?: TData | null, isViewMode?: boolean, isDeleteMode?: boolean) => void;
  handleAddNew: () => void;
  onCloseDialog: (value: boolean) => void;
  
  // Helper methods
  renderEmptyView: (title?: string, description?: string) => React.ReactElement;
}

/**
 * Custom hook untuk mobile view dengan pattern handleDialog
 * @param config - Konfigurasi mobile view
 * @returns Object berisi state dan handlers untuk mobile view
 */
export const useMobileView = <TData = any>(
  config: MobileViewConfig<TData>
): MobileViewResult<TData> => {
  const { queryKey, queryFn, gcTime } = config;
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<TData | null>(null);
  const [isView, setIsView] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  
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
  
  // Handle dialog operations
  const handleDialog = useCallback((
    value: TData | null = null, 
    isViewMode: boolean = false, 
    isDeleteMode: boolean = false
  ) => {
    setSelectedData(value);
    setIsOpen(!isOpen);
    setIsDialogOpen(true);
    setIsView(isViewMode);
    setIsDeleted(isDeleteMode);
  }, [isOpen]);
  
  // Handle add new
  const handleAddNew = useCallback(() => {
    handleDialog();
  }, [handleDialog]);
  
  // Handle close dialog
  const onCloseDialog = useCallback((value: boolean) => {
    setIsDialogOpen(value);
    setIsOpen(!isOpen);
    
    if (!value) {
      setSelectedData(null);
    }
    if (isView || isDeleted) {
      setIsView(false);
      setIsDeleted(false);
    }
  }, [isOpen, isView, isDeleted]);
  
  // Render empty view helper
  const renderEmptyView = useCallback((
    title: string = "Tidak Ada Data",
    description: string = "Saat ini tidak ada data yang tersedia."
  ): React.ReactElement => {
    try {
      const EmptyView = require('@/components/another/empty-view.component').default;
      return React.createElement(EmptyView, {
        Title: title,
        CardDescription: description,
        clickActions: handleAddNew
      });
    } catch (error) {
      // Fallback jika EmptyView tidak ditemukan
      return React.createElement('div', {
        className: 'empty-view-fallback',
        style: { textAlign: 'center', padding: '2rem' }
      }, [
        React.createElement('h3', { key: 'title' }, title),
        React.createElement('p', { key: 'description' }, description),
        React.createElement('button', {
          key: 'button',
          onClick: handleAddNew,
          style: {
            padding: '0.5rem 1rem',
            marginTop: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }, 'Tambah Data')
      ]);
    }
  }, [handleAddNew]);
  
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
    isDeleted,
    isOpen,
    
    // Dialog handlers
    handleDialog,
    handleAddNew,
    onCloseDialog,
    
    // Helper methods
    renderEmptyView,
  };
};
