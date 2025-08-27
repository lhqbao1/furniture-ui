"use client"

import { ControllerRenderProps, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { format, subDays, subMonths, subYears } from "date-fns"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
// --- Schema ---
const FilterSchema = z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    dateRange: z.string().optional(),
    priceFrom: z.string().optional(),
    priceTo: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional(),
    channel: z.array(z.string()).optional(),
})

type FieldConfig<K extends keyof FilterValues = keyof FilterValues> = {
    name: K
    label: string
    component: (field: ControllerRenderProps<FilterValues, K>) => React.ReactNode
    row?: number
}

type FormGroup = {
    title: string
    fields: FieldConfig[]
}

export type FilterValues = {
    dateFrom?: string,
    dateTo?: string,
    dateRange?: string,
    priceFrom?: string,
    priceTo?: string,
    status?: string,
    channel?: string[],
    category?: string
}



export default function FilterForm() {
    const form = useForm<FilterValues>({
        resolver: zodResolver(FilterSchema),
        defaultValues: {
            dateFrom: "",
            dateTo: "",
            priceFrom: "",
            dateRange: "",
            priceTo: "",
            status: "",
            category: "",
            channel: [],
        },
    })

    const formGroups: FormGroup[] = [
        {
            title: "Date",
            fields: [
                {
                    name: "dateFrom",
                    label: "Date from",
                    component: (field) => <Input {...field} placeholder="dd.mm.yy" />,
                },
                {
                    name: "dateTo",
                    label: "Date to",
                    component: (field) => <Input {...field} placeholder="dd.mm.yy" />,
                },
                {
                    name: "dateRange",
                    label: "Quick range",
                    row: 2,
                    component: (field) => (
                        <RadioGroup
                            value={typeof field.value === "string" ? field.value : ""}
                            onValueChange={(value) => {
                                field.onChange(value)

                                const today = new Date()
                                let from: Date | null = null

                                switch (value) {
                                    case "7d": from = subDays(today, 7); break
                                    case "30d": from = subDays(today, 30); break
                                    case "1m": from = subMonths(today, 1); break
                                    case "3m": from = subMonths(today, 3); break
                                    case "1y": from = subYears(today, 1); break
                                    case "3y": from = subYears(today, 3); break
                                    case "5y": from = subYears(today, 5); break
                                    case "all": from = null; break
                                }

                                form.setValue("dateFrom", from ? format(from, "dd.MM.yyyy") : "")
                                form.setValue("dateTo", format(today, "dd.MM.yyyy"))
                            }}
                            className="grid grid-cols-2 gap-2"
                        >
                            {[
                                { value: "7d", label: "Last 7 days" },
                                { value: "30d", label: "Last 30 days" },
                                { value: "1m", label: "Last month" },
                                { value: "3m", label: "Last 3 months" },
                                { value: "1y", label: "Last year" },
                                { value: "3y", label: "Last 3 years" },
                                { value: "5y", label: "Last 5 years" },
                                { value: "all", label: "All the time" },
                            ].map(({ value, label }) => (
                                <div key={value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={value} id={value} />
                                    <Label htmlFor={value}>{label}</Label>
                                </div>
                            ))}
                        </RadioGroup>

                    ),
                }
            ],
        },

        {
            title: "Price",
            fields: [
                {
                    name: "priceFrom",
                    label: "Price from",
                    component: (field) => <Input {...field} placeholder="€" />,
                },
                {
                    name: "priceTo",
                    label: "Price to",
                    component: (field) => <Input {...field} placeholder="€" />,
                },
            ],
        },
        {
            title: "Status",
            fields: [
                {
                    name: "status",
                    label: "Status",
                    component: (field) => (
                        <Select
                            onValueChange={field.onChange}
                            value={field.value as string | undefined}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="in_stock">In Stock</SelectItem>
                                <SelectItem value="out_stock">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    ),
                },
            ],
        },
        {
            title: "Category",
            fields: [
                {
                    name: "category",
                    label: "Category",
                    component: (field) => (
                        <Select onValueChange={field.onChange} value={field.value as string | undefined}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bedroom">Bedroom</SelectItem>
                                <SelectItem value="living">Living room</SelectItem>
                            </SelectContent>
                        </Select>
                    ),
                },
            ],
        },
        {
            title: "Channel",
            fields: [
                {
                    name: "channel",
                    label: "Channel",
                    component: (field) => (
                        <div className="flex flex-col gap-2">
                            {["prestige", "amazon", "ebay", "kaufland"].map((val) => (
                                <label key={val} className="gap-2">
                                    <Checkbox
                                        checked={field.value?.includes(val)}
                                        onCheckedChange={(checked) => {
                                            const currentValue = Array.isArray(field.value) ? field.value : []
                                            const newVal = checked
                                                ? [...currentValue, val]
                                                : currentValue.filter((v) => v !== val)
                                            field.onChange(newVal)
                                        }}
                                    />
                                    {val}
                                </label>
                            ))}
                        </div>
                    ),
                },
            ],
        }

    ]

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit((data) => {
                    console.log("Filter values:", data)
                })}
                className="space-y-6 p-4 grid grid-cols-3 gap-8 max-w-[1000px]"
            >
                {/* Map từng group */}
                {formGroups.map((group) => (
                    <div key={group.title} className="gap-4 grid grid-cols-2">
                        {group.fields.map((item) => (
                            <div key={item.name} className={cn('', item.row ? `col-span-${item.row}` : '')}>
                                <FormField
                                    control={form.control}
                                    name={item.name}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{item.label}</FormLabel>
                                            <FormControl>{item.component(field)}</FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                ))}

                <div className="flex justify-end">
                    <Button type="submit">Apply Filters</Button>
                </div>
            </form>
        </Form>
    )
}
