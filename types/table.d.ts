import { TableMeta } from "@tanstack/react-table"
import type { Dispatch, SetStateAction } from "react"

declare module "@tanstack/react-table" {
  interface TableMeta<> {
    expandedRowId: string | null
    setExpandedRowId: (id: string | null) => void
    expandedRowIds?: string[]
    setExpandedRowIds?: Dispatch<SetStateAction<string[]>>
    toggleExpandedRow?: (id: string) => void
    isRowExpanded?: (id: string) => boolean
  }
}
