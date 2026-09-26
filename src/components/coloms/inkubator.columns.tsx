"use client";

import { ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "@/components/another/DataTable/DataTableRowActions";
import DataTableAnother from "@/components/another/DataTable/DataTableRowActions.inkubator";
import { ArrowUpDown } from "lucide-react";
// import { Inkobator } from "Pending/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import moment from "moment";

interface penyuInkubasiAction {
  onEditOpen?: (inkubator: any) => void;
  onDeleteOpen?: (inkubator: any) => void;
  onViewOpen: (inkubator: any) => void;
  onDeadOpen?: (inkubator: any) => void;
  onReleased?: (inkubator: any) => void;
}

export const columns = ({
  onEditOpen,
  onDeleteOpen,
  onViewOpen,
  onDeadOpen,
  onReleased,
}: penyuInkubasiAction): ColumnDef<any>[] =>
  onReleased && onDeadOpen
    ? [
        {
          accessorKey: "namaany",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Tanggal Pengambilan Data
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => {
            // console.log(row.getValue("tanggalData"))
            return (
              <div className="font-medium">{row.getValue("namaany")}</div>
            );
          },
        },
        {
          accessorKey: "tukikHidup",
          header: "Tukik Hidup",
          cell: ({ row }) => {
            return (
              <div className="font-medium">
                {row.getValue("tukikHidup")!==0?row.getValue("tukikHidup") + " Tukik":"Tidak Ada"}
              </div>
            );
          },
        },
        {
          accessorKey: "tukikMati",
          header: "Tukik Mati",
          cell: ({ row }) => {
            return (
              <div className="font-medium">
                {row.getValue("tukikMati")!==0?row.getValue("tukikMati") + " Tukik":"Tidak Ada"}
              </div>
            );
          },
        },
        {
          accessorKey: "berfungsi",
          header: "Status",
          cell: ({ row }) => {
            const { berfungsi, tukikAda } = row.original;
            return (
              <div className="font-medium">
                <Badge
                  variant={
                    berfungsi ? "default" : tukikAda ? "default" : "destructive"
                  }
                >
                  {tukikAda
                    ? "Sedang Digunakan"
                    : berfungsi
                    ? "Kosong"
                    : "Tidak Berfungsi"}
                </Badge>
              </div>
            );
          },
        },
        {
          id: "actions",
          cell: ({ row }) => (
            <DataTableAnother
              row={row}
              onView={onViewOpen}
              onDead={onDeadOpen}
              onReleased={onReleased}
            />
          ),
        },
      ]
    : [
        {
          accessorKey: "namaany",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Tanggal Pengambilan Data
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => {
            // console.log(row.getValue("tanggalData"))
            return (
              <div className="font-medium">{row.getValue("namaany")}</div>
            );
          },
        },
        {
          accessorKey: "berfungsi",
          header: "Status",
          cell: ({ row }) => {
            const { berfungsi, tukikAda } = row.original;
            return (
              <div className="font-medium">
                <Badge
                  variant={
                    berfungsi ? "default" : tukikAda ? "default" : "destructive"
                  }
                >
                  {tukikAda
                    ? "Sedang Digunakan"
                    : berfungsi
                    ? "Kosong"
                    : "Tidak Berfungsi"}
                </Badge>
              </div>
            );
          },
        },
        {
          accessorKey: "keterangan",
          header: "Keterangan",
          cell: ({ row }) => {
            return (
              <div className="font-medium">
                {row.getValue("keterangan")
                  ? row.getValue("keterangan")
                  : "Tidak ada"}
              </div>
            );
          },
        },
        {
          id: "actions",
          cell: ({ row }) =>onEditOpen&&onDeleteOpen&& (
            <DataTableRowActions
              row={row}
              onView={onViewOpen}
              onEdit={onEditOpen}
              onDelete={onDeleteOpen}
            />
          ),
        },
      ];
