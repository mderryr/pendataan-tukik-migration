import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useStatusUtils from "@/utils/status-toast.utils";

/**
 * Interface untuk konfigurasi form mutations
 */
interface FormMutationsConfig<TData = any, TVariables = any> {
  createFn?: (data: TVariables) => Promise<TData>;
  updateFn?: (data: TVariables & { id: string | number }) => Promise<TData>;
  deleteFn?: (id: string | number) => Promise<void>;
  queryKey?: readonly unknown[];
  messages?: {
    createSuccess?: string;
    updateSuccess?: string;
    deleteSuccess?: string;
  };
}

/**
 * Interface untuk hasil form state
 */
interface FormStateResult<TData = any> {
  // Loading states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoading: boolean;
  
  // Mutation functions
  createMutation: (data: any, onSuccess?: () => void) => void;
  updateMutation: (data: any, onSuccess?: () => void) => void;
  deleteMutation: (id: string | number, onSuccess?: () => void) => void;
  
  // Form states
  isSubmitting: boolean;
  hasError: boolean;
  
  // Reset function
  resetState: () => void;
}

/**
 * Hook untuk mengelola form state dengan mutations
 * @param config - Konfigurasi mutations
 * @returns Object berisi state dan mutation functions
 */
export const useFormState = <TData = any, TVariables = any>(
  config: FormMutationsConfig<TData, TVariables>
): FormStateResult<TData> => {
  const { createFn, updateFn, deleteFn, queryKey, messages } = config;
  
  const queryClient = useQueryClient();
  const { onCreateSuccess, onUpdateSuccess, onDeleteSuccess, onRequestError } = useStatusUtils();
  
  const [hasError, setHasError] = useState(false);

  // Create mutation
  const createMutationResult = useMutation({
    mutationFn: createFn || (() => Promise.reject("Create function not provided")),
    onSuccess: (data, variables, context) => {
      if (queryKey) {
        onCreateSuccess({
          newData: data,
          params: queryKey,
          massage: messages?.createSuccess || "Data berhasil ditambahkan",
          onOpenChange: () => {},
        });
      }
      setHasError(false);
    },
    onError: (error, variables, context) => {
      onRequestError({ onOpenChange: () => {} });
      setHasError(true);
    },
  });

  // Update mutation
  const updateMutationResult = useMutation({
    mutationFn: updateFn || (() => Promise.reject("Update function not provided")),
    onSuccess: (data, variables, context) => {
      if (queryKey) {
        onUpdateSuccess({
          newData: data,
          params: queryKey,
          massage: messages?.updateSuccess || "Data berhasil diperbarui",
          onOpenChange: () => {},
        });
      }
      setHasError(false);
    },
    onError: (error, variables, context) => {
      onRequestError({ onOpenChange: () => {} });
      setHasError(true);
    },
  });

  // Delete mutation
  const deleteMutationResult = useMutation({
    mutationFn: deleteFn || (() => Promise.reject("Delete function not provided")),
    onSuccess: (data, variables, context) => {
      if (queryKey) {
        // Invalidate queries untuk refresh data
        queryClient.invalidateQueries({ queryKey });
      }
      onDeleteSuccess({
        massage: messages?.deleteSuccess || "Data berhasil dihapus",
        onOpenChange: () => {},
      });
      setHasError(false);
    },
    onError: (error, variables, context) => {
      onRequestError({ onOpenChange: () => {} });
      setHasError(true);
    },
  });

  // Wrapper functions untuk mutations
  const createMutation = useCallback((data: any, onSuccess?: () => void) => {
    createMutationResult.mutate(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  }, [createMutationResult]);

  const updateMutation = useCallback((data: any, onSuccess?: () => void) => {
    updateMutationResult.mutate(data, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  }, [updateMutationResult]);

  const deleteMutation = useCallback((id: string | number, onSuccess?: () => void) => {
    deleteMutationResult.mutate(id, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  }, [deleteMutationResult]);

  // Reset state
  const resetState = useCallback(() => {
    setHasError(false);
    createMutationResult.reset();
    updateMutationResult.reset();
    deleteMutationResult.reset();
  }, [createMutationResult, updateMutationResult, deleteMutationResult]);

  const isCreating = createMutationResult.isPending;
  const isUpdating = updateMutationResult.isPending;
  const isDeleting = deleteMutationResult.isPending;
  const isLoading = isCreating || isUpdating || isDeleting;
  const isSubmitting = isLoading;

  return {
    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    isLoading,
    
    // Mutation functions
    createMutation,
    updateMutation,
    deleteMutation,
    
    // Form states
    isSubmitting,
    hasError,
    
    // Reset function
    resetState,
  };
};
