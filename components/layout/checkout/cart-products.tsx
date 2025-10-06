'use client'

import { CartItem } from "@/src/app/[locale]/(payment)/check-out/page"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"

type CartItemSelectorProps = {
    field: {
        value: CartItem[]
        onChange: (value: CartItem[]) => void
    }
}

export default function CartItemSelector({ field }: CartItemSelectorProps) {
    const updateItem = (id: number, quantity: number) => {
        const updated = field.value.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
        field.onChange(updated)
    }

    const removeItem = (id: number) => {
        const updated = field.value.filter((item) => item.id !== id)
        field.onChange(updated)
    }

    return (
        <div className="space-y-4">
            {field.value.map((item) => {
                const total = item.unitPrice * item.quantity

                return (
                    <div key={item.id} className="grid grid-cols-12 items-center gap-4">
                        <div className="flex gap-2 items-center col-span-5">
                            <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-md" unoptimized />
                            <div>
                                <h4 className="text-sm font-semibold">{item.name}</h4>
                                <div className="text-sm text-muted-foreground">Color: {item.color}</div>
                                <div className="text-sm text-muted-foreground">Size: {item.size}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 col-span-5">
                            <div className="text-sm">€{item.unitPrice}</div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateItem(item.id, item.quantity - 1)} className="px-2 py-1 border rounded text-sm">➖</button>
                                <Input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) => updateItem(item.id, parseInt(e.target.value))}
                                    className="w-16 text-center"
                                />
                                <button onClick={() => updateItem(item.id, item.quantity + 1)} className="px-2 py-1 border rounded text-sm">➕</button>
                            </div>
                            <div className="text-sm">€{total.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>

                        <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-xl col-span-2">🗑️</button>
                    </div>
                )
            })}
        </div>
    )
}
