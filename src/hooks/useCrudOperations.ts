import { useApiDataQuery, useTableData, useFormState } from "./";

/**
 * Interface untuk konfigurasi CRUD operations
 */
interface CrudConfig<TData = any, TCreateData = any, TUpdateData = any> {
  // Data fetching
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ data: TData[] }>;
  
  // Mutations
  createFn?: ((data: TCreateData | TUpdateData) => Promise<TData>) | undefined
  updateFn?: ((data: (TCreateData | TUpdateData) & { id: string | number; }) => Promise<TData>) | undefined ;
  deleteFn?: (id: string | number) => Promise<void>;
  
  // Table columns
  columnsFactory: (callbacks: {
    onEditOpen: (data: TData) => void;
    onDeleteOpen: (data: TData) => void;
    onViewOpen: (data: TData) => void;
  }) => any[];
  
  // Messages
  messages?: {
    createSuccess?: string;
    updateSuccess?: string;
    deleteSuccess?: string;
  };
  
  // Query options
  enabled?: boolean;
}

/**
 * Interface untuk hasil CRUD operations
 */
interface CrudResult<TData = any> {
  // Data state
  data: { data: TData[] } | undefined;
  extractedData: TData[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  hasData: boolean;
  isEmpty: boolean;
  
  // Table state
  isDialogOpen: boolean;
  selectedData: TData | null;
  mode: "create" | "edit" | "view" | "delete";
  columns: any[];
  tableData: TData[];
  
  // Dialog handlers
  onCreateOpen: () => void;
  onEditOpen: (data: TData) => void;
  onViewOpen: (data: TData) => void;
  onDeleteOpen: (data: TData) => void;
  onDialogClose: () => void;
  
  // Form mutations
  createMutation: (data: any, onSuccess?: () => void) => void;
  updateMutation: (data: any, onSuccess?: () => void) => void;
  deleteMutation: (id: string | number, onSuccess?: () => void) => void;
  
  // Loading states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  
  // Helper booleans
  isCreate: boolean;
  isEdit: boolean;
  isView: boolean;
  isDelete: boolean;
  
  // Actions
  handleFormSubmit: (data: any, onSuccess?: () => void) => void;
  handleDelete: (onSuccess?: () => void) => void;
  resetState: () => void;
}

/**
 * Hook untuk mengelola CRUD operations lengkap
 * @param config - Konfigurasi CRUD operations
 * @returns Object berisi semua state dan handler yang diperlukan
 */
export const useCrudOperations = <TData = any, TCreateData = any, TUpdateData extends ((data: TCreateData | TUpdateData) => Promise<TData>) | undefined = any>(
  config: CrudConfig<TData, TCreateData, TUpdateData>
): CrudResult<TData> => {
  const {
    queryKey,
    queryFn,
    createFn,
    updateFn,
    deleteFn,
    columnsFactory,
    messages,
    enabled = true,
  } = config;

  // Data fetching
  const {
    data,
    isLoading,
    error,
    isFetching,
    hasData,
    isEmpty,
    extractedData,
  } = useApiDataQuery<TData[]>({
    queryKey,
    queryFn,
    enabled,
  });

  // Table management
  const tableState = useTableData<TData>({
    data: extractedData,
    columnsFactory,
  });

  // Form mutations
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting,
    resetState: resetFormState,
  } = useFormState<TData, TCreateData | TUpdateData>({
    createFn,
    updateFn,
    deleteFn,
    queryKey,
    messages,
  });

  // Helper untuk submit form berdasarkan mode
  const handleFormSubmit = (data: any, onSuccess?: () => void) => {
    if (tableState.mode === "create") {
      createMutation(data, onSuccess);
    } else if (tableState.mode === "edit" && tableState.selectedData) {
      updateMutation(
        { ...data, id: (tableState.selectedData as any).id },
        onSuccess
      );
    }
  };

  // Helper untuk delete
  const handleDelete = (onSuccess?: () => void) => {
    if (tableState.selectedData && tableState.mode === "delete") {
      deleteMutation((tableState.selectedData as any).id, onSuccess);
    }
  };

  // Reset semua state
  const resetState = () => {
    tableState.onDialogClose();
    resetFormState();
  };

  return {
    // Data state
    data,
    extractedData,
    isLoading,
    isFetching,
    error,
    hasData,
    isEmpty,
    
    // Table state
    isDialogOpen: tableState.isDialogOpen,
    selectedData: tableState.selectedData,
    mode: tableState.mode,
    columns: tableState.columns,
    tableData: tableState.tableData,
    
    // Dialog handlers
    onCreateOpen: tableState.onCreateOpen,
    onEditOpen: tableState.onEditOpen,
    onViewOpen: tableState.onViewOpen,
    onDeleteOpen: tableState.onDeleteOpen,
    onDialogClose: tableState.onDialogClose,
    
    // Form mutations
    createMutation,
    updateMutation,
    deleteMutation,
    
    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    isSubmitting,
    
    // Helper booleans
    isCreate: tableState.isCreate,
    isEdit: tableState.isEdit,
    isView: tableState.isView,
    isDelete: tableState.isDelete,
    
    // Actions
    handleFormSubmit,
    handleDelete,
    resetState,
  };
};
