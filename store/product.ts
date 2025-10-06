import { atom } from "jotai"

export type ProductFilters = {
  // Date
  dateFrom?: string // ISO string hoặc "yyyy-MM-dd"
  dateTo?: string
  datePreset?: "last7days" | "last30days" | "lastMonth" | "last3months" | "lastYear" | "last3years" | "last5years" | "all"

  // Numeric ranges
  priceFrom?: number
  priceTo?: number
  costFrom?: number
  costTo?: number
  revenueFrom?: number
  revenueTo?: number
  stockFrom?: number
  stockTo?: number

  // Single-select
  status?: string // e.g. "out_of_stock"
  category?: string // e.g. "Bedroom"

  // Multi-select
  channels?: string[] // e.g. ["Amazon", "eBay"]

  // Custom filter
  myFilter?: "sale" | "inventory" | "discount" | ""
}

export const productFiltersAtom = atom<ProductFilters>({
  dateFrom: undefined,
  dateTo: undefined,
  datePreset: "all",
  priceFrom: undefined,
  priceTo: undefined,
  costFrom: undefined,
  costTo: undefined,
  revenueFrom: undefined,
  revenueTo: undefined,
  stockFrom: undefined,
  stockTo: undefined,
  status: "",
  category: "",
  channels: [],
  myFilter: "",
})

export const searchProductQueryStringAtom = atom<string>('')
