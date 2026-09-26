import { useState, useCallback } from "react";

/**
 * Interface untuk mengelola state dialog/modal
 */
interface DialogState<T = any> {
  isOpen: boolean;
  selectedData: T | null;
  mode: "create" | "edit" | "view" | "delete" ;
}

/**
 * Tipe untuk callback functions
 */
interface DialogCallbacks<T = any> {
  onCreateOpen: () => void;
  onEditOpen: (data: T) => void;
  onViewOpen: (data: T) => void;
  onDeleteOpen: (data: T) => void;
  onClose: () => void;
  resetState: () => void;
}

/**
 * Hook untuk mengelola state dialog/modal
 * @param initialOpen - State awal dialog (default: false)
 * @returns Object berisi state dan callback functions
 */
export const useDialogState = <T = any>(
  initialOpen: boolean = false
): DialogState<T> & DialogCallbacks<T> => {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const [selectedData, setSelectedData] = useState<T | null>(null);
  const [mode, setMode] = useState<"create" | "edit" | "view" | "delete" >("create");

  const onCreateOpen = useCallback(() => {
    setSelectedData(null);
    setMode("create");
    setIsOpen(true);
  }, []);

  // const onCustomOpen = useCallback((data:T)=>{
  //   setSelectedData(data);
  //   setMode("custom")
  //   setIsOpen(true)
  // },[])

  const onEditOpen = useCallback((data: T) => {
    setSelectedData(data);
    setMode("edit");
    setIsOpen(true);
  }, []);

  const onViewOpen = useCallback((data: T) => {
    setSelectedData(data);
    setMode("view");
    setIsOpen(true);
  }, []);

  const onDeleteOpen = useCallback((data: T) => {
    setSelectedData(data);
    setMode("delete");
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
    // Reset data setelah dialog tertutup
    setTimeout(() => {
      setSelectedData(null);
      setMode("create");
    }, 150); // Delay kecil untuk animasi
  }, []);

  const resetState = useCallback(() => {
    setIsOpen(false);
    setSelectedData(null);
    setMode("create");
  }, []);

  return {
    isOpen,
    selectedData,
    mode,
    onCreateOpen,
    onEditOpen,
    onViewOpen,
    onDeleteOpen,
    onClose,
    resetState,
  };
};
