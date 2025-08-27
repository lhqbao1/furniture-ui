"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useFieldArray, useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Variant, VariantSchema } from "@/lib/schema/variant"
import ImagePickerInput from "@/components/layout/single-product/tabs/review/image-picker-input"

type VariantDrawerProps = {
    onAdd: (v: Variant) => void
    setVariant: React.Dispatch<React.SetStateAction<Variant[]>>
}

export default function VariantDrawer({ onAdd, setVariant }: VariantDrawerProps) {
    const form = useForm<Variant>({
        resolver: zodResolver(VariantSchema),
        defaultValues: {
            name: "",
            is_active: true,
            type: "local",
            options: [],
            optionType: ''
        },
        mode: "onChange", // validate khi thay đổi
    })

    const optionType = form.watch("optionType")

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "options",
    })

    const onSubmit = (data: Variant) => {
        onAdd(data)
        setVariant((prev) => [...prev, data])
        console.log("✅ form data", data)
    }

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Type (Global / Local) */}
                <div className="space-y-4">
                    <Label>Variant Type</Label>
                    <Controller
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="flex gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="global" id="global" />
                                    <Label htmlFor="global">Global Variant</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="local" id="local" />
                                    <Label htmlFor="local">Local Variant</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                    {form.formState.errors.type && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.type.message as string}
                        </p>
                    )}
                </div>

                {/* Variant Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">Variant Name</Label>
                    <Controller
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <Input id="name" placeholder="Enter variant name" {...field} />
                        )}
                    />
                    {form.formState.errors.name && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.name.message as string}
                        </p>
                    )}
                </div>

                {/* Options Type */}
                <div className="space-y-4">
                    <Label>Options Type</Label>
                    <Controller
                        control={form.control}
                        name="optionType"
                        render={({ field }) => (
                            <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="flex gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="image" id="image" />
                                    <Label htmlFor="image">Image Options</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="text" id="text" />
                                    <Label htmlFor="text">Text Options</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                    {form.formState.errors.optionType && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.optionType.message as string}
                        </p>
                    )}
                </div>


                {/* Options */}
                {optionType === "image" ? (
                    <div className="space-y-5">
                        <Label>Options</Label>
                        {fields.map((field, index) => (
                            <Card key={field.id} className="p-3">
                                <CardContent className="grid grid-cols-12 gap-5">
                                    <div className="col-span-6">
                                        <ImagePickerInput
                                            form={form}
                                            fieldName={`options.${index}.image_url`}
                                            description="Upload an option image"
                                            isSingle
                                            isSimple
                                            className="flex-row"
                                        />
                                    </div>
                                    <div className="col-span-12 space-y-3">
                                        <Label>Extra price</Label>
                                        <Controller
                                            control={form.control}
                                            name={`options.${index}.extra_price`}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    placeholder="Extra price"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.valueAsNumber)
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        className="w-fit"
                                    >
                                        <X className="w-4 h-4 mr-1" /> Remove
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                append({ label: "", extra_price: 0, image_url: "" })
                            }
                        >
                            + Add Option
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Label>Options</Label>
                        {fields.map((field, index) => (
                            <Card key={field.id} className="p-3">
                                <CardContent className="grid grid-cols-12 gap-3">
                                    <div className="col-span-3 space-y-3">
                                        <Label>Name</Label>
                                        <Controller
                                            control={form.control}
                                            name={`options.${index}.label`}
                                            render={({ field }) => (
                                                <Input
                                                    type="text"
                                                    placeholder="Option Label"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.value)
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-3">
                                        <Label>Extra price</Label>
                                        <Controller
                                            control={form.control}
                                            name={`options.${index}.extra_price`}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    placeholder="Extra price"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.valueAsNumber)
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        className="w-fit"
                                    >
                                        <X className="w-4 h-4 mr-1" /> Remove
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                append({ label: "", extra_price: 0, image_url: "" })
                            }
                        >
                            + Add Option
                        </Button>
                    </div>
                )}

                <Button type="submit" className="w-full">
                    Add Variant
                </Button>
            </form>
        </FormProvider>
    )
}
