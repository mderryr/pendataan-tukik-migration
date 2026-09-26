"use client";

import { ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "@/components/another/DataTable/DataTableRowActions";
import {  ArrowUpDown } from "lucide-react";
// import { Zona } from "Pending/types";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/utils/mediaquery-hook";
import { sizeDevice } from "@/env/size.mjs";

interface penyuInkubasiAction {
  onEditOpen: (zona: any) => void;
  onDeleteOpen: (zona: any) => void;
  onViewOpen: (zona: any) => void;
  // onCreate: (telurDikerami: TelurDikerami) => void;
}
const clickCell = (data:any,setOpen: penyuInkubasiAction["onViewOpen"]) => {
  const isDesktop = useMediaQuery(sizeDevice.Mobile.minQuery);
  return isDesktop
    ? () => console.log("Click")
    : () => {
        setOpen(data)
      };
};
export const columns = ({
  onEditOpen,
  onDeleteOpen,
  onViewOpen,
}: penyuInkubasiAction): ColumnDef<any>[] => [
  {
    accessorKey: "nama",
    header: "Nama Zona",
    cell: ({ row }) => (
      <div className="font-medium"  onClick={clickCell(row.original,onViewOpen)}>
        {row.getValue("nama")}
      </div>
    ),
  },
  {
    accessorKey: "keterangan",
    header: "Nama Zona",
    cell: ({ row }) => (
      <div className="font-medium"  onClick={clickCell(row.original,onViewOpen)}>
        {row.getValue("keterangan")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        onView={onViewOpen}
        onEdit={onEditOpen}
        onDelete={onDeleteOpen}
      />
    ),
  },
];
