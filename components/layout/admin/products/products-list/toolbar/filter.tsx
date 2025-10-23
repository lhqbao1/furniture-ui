'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FilterFormProps {
    allProducts: boolean
    setAllProducts: (val: boolean) => void
    // isActive: boolean
    // setIsActive: (val: boolean) => void
    // brand: string
    // setBrand: (val: string) => void
    // minPrice?: number
    // setMinPrice: (val?: number) => void
    // maxPrice?: number
    // setMaxPrice: (val?: number) => void
    // sortByStock?: string
    // setSortByStock: (val?: string) => void
}

export default function FilterForm({
    allProducts,
    setAllProducts,
    // isActive,
    // setIsActive,
    // brand,
    // setBrand,
    // minPrice,
    // setMinPrice,
    // maxPrice,
    // setMaxPrice,
    // sortByStock,
    // setSortByStock,
}: FilterFormProps) {
    const handleReset = () => {
        setAllProducts(true)
        // setIsActive(false)
        // setBrand('')
        // setMinPrice(undefined)
        // setMaxPrice(undefined)
        // setSortByStock(undefined)
    }

    return (
        <div className="space-y-4">
            {/* All / Active toggles */}
            <div className="flex items-center justify-between">
                <Label htmlFor="all-products">Active</Label>
                <Switch
                    id="same-invoice"
                    checked={allProducts}
                    onCheckedChange={setAllProducts}
                    className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary"

                />
            </div>

            {/* <div className="flex items-center justify-between">
                <Label htmlFor="is-active">Active only</Label>
                <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
            </div> */}

            {/* Sort by stock */}
            {/* <div className="flex flex-col gap-2">
                <Label>Sort by stock</Label>
                <select
                    value={sortByStock ?? ''}
                    onChange={(e) => setSortByStock(e.target.value || undefined)}
                    className="border rounded-md px-2 py-1 text-sm"
                >
                    <option value="">None</option>
                    <option value="asc">Low → High</option>
                    <option value="desc">High → Low</option>
                </select>
            </div> */}

            {/* Price range */}
            {/* <div className="flex flex-col gap-2">
                <Label>Price Range (€)</Label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice ?? ''}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice ?? ''}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>
            </div> */}

            {/* Brand */}
            {/* <div className="flex flex-col gap-2">
                <Label>Brand</Label>
                <Input
                    placeholder="Enter brand..."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                />
            </div> */}

            {/* Reset */}
            <div className="flex justify-end pt-3">
                <Button variant="outline" size="sm" onClick={handleReset}>
                    Reset
                </Button>
            </div>
        </div>
    )
}
