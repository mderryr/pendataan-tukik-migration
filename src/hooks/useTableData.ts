import { useMemo } from "react";
import { useDialogState } from "./useDialogState";

/**
 * Interface untuk konfigurasi table data
 */
interface TableDataConfig<TData = any> {
  data: TData[] | undefined;
  columnsFactory: (callbacks: {
    onEditOpen: (data: TData) => void;
    onDeleteOpen: (data: TData) => void;
    onViewOpen: (data: TData) => void;
  }) => any[];
}

/**
 * Interface untuk hasil table data
 */
interface TableDataResult<TData = any> {
  // Dialog state
  isDialogOpen: boolean;
  selectedData: TData | null;
  mode: "create" | "edit" | "view" | "delete";
  
  // Dialog handlers
  onCreateOpen: () => void;
  onEditOpen: (data: TData) => void;
  onViewOpen: (data: TData) => void;
  onDeleteOpen: (data: TData) => void;
  onDialogClose: () => void;
  
  // Table configuration
  columns: any[];
  tableData: TData[];
  
  // Helper functions
  isCreate: boolean;
  isEdit: boolean;
  isView: boolean;
  isDelete: boolean;
}

/**
 * Hook untuk mengelola table data dengan dialog actions
 * @param config - Konfigurasi table
 * @returns Object berisi state dan handlers untuk table dan dialog
 */
export const useTableData = <TData = any>(
  config: TableDataConfig<TData>
): TableDataResult<TData> => {
  const { data, columnsFactory } = config;
  
  // Gunakan dialog state hook
  const {
    isOpen: isDialogOpen,
    selectedData,
    mode,
    onCreateOpen,
    onEditOpen,
    onViewOpen,
    onDeleteOpen,
    onClose: onDialogClose,
  } = useDialogState<TData>();

  // Memoize columns dengan callback functions
  const columns = useMemo(() => {
    return columnsFactory({
      onEditOpen,
      onDeleteOpen,
      onViewOpen,
    });
  }, [onEditOpen, onDeleteOpen, onViewOpen, columnsFactory]);

  // Pastikan data adalah array
  const tableData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Helper untuk mengecek mode
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isDelete = mode === "delete";

  return {
    // Dialog state
    isDialogOpen,
    selectedData,
    mode,
    
    // Dialog handlers
    onCreateOpen,
    onEditOpen,
    onViewOpen,
    onDeleteOpen,
    onDialogClose,
    
    // Table configuration
    columns,
    tableData,
    
    // Helper functions
    isCreate,
    isEdit,
    isView,
    isDelete,
  };
};

/**
 * Hook untuk table dengan struktur API response standar
 */
export const useApiTableData = <TData = any>(
  config: Omit<TableDataConfig<TData>, 'data'> & {
    data: { data: TData[] } | undefined;
  }
): TableDataResult<TData> => {
  const { data, columnsFactory } = config;
  
  return useTableData({
    data: data?.data,
    columnsFactory,
  });
};
