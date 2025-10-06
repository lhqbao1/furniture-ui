'use client'

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { ProductItem } from '@/types/products'

export default function ExportExcelButton({ data }: { data: ProductItem[] }) {
    const handleExport = () => {
        // 1️⃣ Tạo worksheet từ dữ liệu JSON
        const worksheet = XLSX.utils.json_to_sheet(data)

        // 2️⃣ Tạo workbook chứa sheet
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

        // 3️⃣ Ghi workbook ra file Excel (dưới dạng binary)
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

        // 4️⃣ Tạo Blob và tải về
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
        saveAs(blob, 'export.xlsx')
    }

    return (
        <Button variant={'ghost'} onClick={handleExport}>
            Export Excel
        </Button>
    )
}
