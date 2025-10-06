'use client'

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { ProductItem } from '@/types/products'

export default function ExportExcelButton({ data }: { data: ProductItem[] }) {
    const handleExport = () => {
        const exportData = data.map(p => ({
            id: p.id_provider,
            ean: p.ean,
            brand_id: p.brand ? p.brand.id : '',
            supplier_id: '',
            manufacturer_sku: p.sku,
            manufacturing_country: p.manufacture_country,
            customs_tariff_nr: p.tariff_number,
            name: p.name,
            description: p.description,
            technical_description: p.technical_description,
            category_id: p.categories && p.categories.length > 0 ? p.categories[0].code : '',
            unit: p.unit,
            amount_unit: p.amount_unit,
            delivery_time: p.delivery_time,
            carrier_id: p.carrier,
            net_purchase_cost: '',
            delivery_cost: p.delivery_cost,
            return_cost: p.return_cost,
            original_price: p.price,
            sale_price: p.final_price,
            vat: p.tax,
            stock: p.stock,
            img_url: '',
            length: p.length,
            width: p.width,
            height: p.height,
            weight: p.weight,
            weee_nr: p.weee_nr,
            eek: p.eek,
            SEO_keywords: p.meta_keywords,
            materials: '',
            color: ''
        }))

        // 1️⃣ Tạo worksheet từ dữ liệu JSON
        const worksheet = XLSX.utils.json_to_sheet(exportData)

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
