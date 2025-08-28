"use client"

import { MySwitch } from "@/components/shared/my-swtich"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Variant } from "@/types/products"
import Image from "next/image"
import VariantDrawer from "./add-variant-form"
import { useState } from "react"
import { Pencil } from "lucide-react"
import { set } from "zod"


interface ProductVariantsProps {
    isSimple: boolean
    variants: Variant[]
    showMaterial: boolean
    setShowMaterial: (val: boolean) => void
    openVariant: boolean
    setOpenVariant: (val: boolean) => void
    append: (val: Variant) => void
    replace: (val: Variant) => void
    setVariants: React.Dispatch<React.SetStateAction<Variant[]>>
}

export default function ProductVariants({
    isSimple,
    variants,
    showMaterial,
    setShowMaterial,
    openVariant,
    setOpenVariant,
    append,
    replace,
    setVariants
}: ProductVariantsProps) {
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null)

    const handleAddVariant = (variant: Variant) => {
        // Append vào field array của form cha
        append(variant); // append từ props của VariantDrawer
        setOpenVariant(false);
        setEditingVariant(null);
    };

    const handleEditVariant = (variant: Variant) => {
        const index = variants.findIndex(
            (v) => v.id === variant.id || v.name === variant.name
        );
        if (index !== -1) {
            replace(variant);
            setOpenVariant(false);
            setEditingVariant(null);
        }
    };

    if (isSimple) return null

    return (
        <div className="border-t border-gray-400 pt-2">
            <p>Product Variants</p>
            <div className="flex flex-col gap-3 mt-3">
                {variants && variants.length > 0
                    ? variants.map((item, index) => (
                        <div
                            className="grid grid-cols-12 gap-4 items-center"
                            key={item.name + index}
                        >
                            {/* Left col */}
                            <div className="col-span-3 flex gap-2 items-center justify-start">
                                <p className="text-[#666666] text-sm">{item.name}</p>
                                <MySwitch
                                    checked={showMaterial}
                                    onCheckedChange={() => setShowMaterial(!showMaterial)}
                                />
                            </div>

                            {/* Right col */}
                            {showMaterial ? (
                                <div className="item-color flex flex-row gap-4 col-span-9">
                                    {item.options.map((options, idx) =>
                                        options.image_url ? (
                                            <div key={options.label + idx}>
                                                <Image
                                                    src={options.image_url}
                                                    width={50}
                                                    height={50}
                                                    alt={options.label}
                                                    className="shadow-sm bg-white rounded-sm"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                key={options.label + idx}
                                                className="px-2 py-1 rounded-md border border-gray-300 text-sm font-semibold"
                                            >
                                                {options.label}
                                            </div>
                                        )
                                    )}

                                    {/* Nút Edit sau list options */}
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditingVariant(item)   // chọn variant
                                            setOpenVariant(true)      // mở drawer
                                        }}
                                    >
                                        <Pencil className="size-4 text-primary" />
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    ))
                    : null}
            </div>
            <div className="pt-6">
                <Drawer
                    open={openVariant}
                    onOpenChange={(open) => {
                        setOpenVariant(open)
                        if (!open) setEditingVariant(null)
                    }}
                    direction="right"
                    disablePreventScroll
                >
                    <DrawerTrigger asChild>
                        <Button type="button">Add Variant</Button>
                    </DrawerTrigger>
                    <DrawerContent className="p-4 !max-w-[500px] !w-[500px] overflow-y-auto">
                        <DrawerHeader>
                            <DrawerTitle>
                                {editingVariant ? "Edit Variant" : "Add New Variant"}
                            </DrawerTitle>
                        </DrawerHeader>
                        <VariantDrawer
                            editingVariant={editingVariant ?? undefined}
                            onAdd={editingVariant ? handleEditVariant : handleAddVariant}
                            setVariant={setVariants}
                        />
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    )
}
