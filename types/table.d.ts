import { TableMeta } from "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface TableMeta<> {
    expandedRowId: string | null
    setExpandedRowId: (id: string | null) => void
  }
}