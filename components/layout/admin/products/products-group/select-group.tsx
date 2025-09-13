"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"
import { Controller, useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { useAddProductGroup, useGetProductGroup } from "@/features/product-group/hook"
import { atom, useAtom } from "jotai"
import { currentProductGroup } from "@/store/product-group"
import DeleteGroupDialog from "./delete-group-dialog"
import AddOrEditParentDialog from "./add-or-edit-parent-dialog"

const SelectProductGroup = () => {
    const [open, setOpen] = React.useState(false)
    const [groupName, setGroupName] = React.useState("")
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [dialogAddOpen, setDialogAddOpen] = React.useState(false)
    const [currentGroup, setCurrentGroup] = useAtom(currentProductGroup)

    const { data: groups, isLoading, isError } = useGetProductGroup()
    const addProductGroupMutation = useAddProductGroup()
    const form = useFormContext()

    return (
        <Controller
            control={form.control}
            name="parent_id"
            render={({ field }) => (
                <FormItem className="space-y-2">
                    <FormLabel className="flex justify-between items-center">
                        <span>Select product group</span>
                        {/* Dialog Add Group */}
                        <AddOrEditParentDialog dialogOpen={dialogAddOpen} setDialogOpen={setDialogAddOpen} groupName={groupName} setGroupName={setGroupName} />
                    </FormLabel>
                    {/* Combobox gắn với form cha */}
                    <FormControl>
                        <Popover open={true}>
                            <PopoverTrigger asChild>
                                {/* <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {field.value
                                        ? groups?.find((g) => g.id === field.value)?.name
                                        : "Choose group..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button> */}
                                <span />
                            </PopoverTrigger>

                            <PopoverContent
                                align="start"
                                className="w-[var(--radix-popover-trigger-width)] p-0 border-0 shadow-none"
                            >
                                <Command className="border-none">
                                    <CommandInput placeholder="Search group..." />
                                    <CommandEmpty>No group found.</CommandEmpty>
                                    <CommandGroup className="mt-6">
                                        {groups?.map((g) => (
                                            <CommandItem
                                                key={g.id}
                                                onSelect={() => {
                                                    setCurrentGroup(g.name)
                                                    field.onChange(g.id)
                                                    setOpen(false)
                                                }}
                                                className="group cursor-pointer"
                                            >
                                                <div className="flex justify-between w-full">
                                                    <div className="flex gap-1 items-center text-base">
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                field.value === g.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {g.name}
                                                    </div>

                                                    {/* Ẩn mặc định, hover mới hiện */}
                                                    <div className="items-center gap-2 hidden group-hover:flex">
                                                        <DeleteGroupDialog parentId={g.id} />
                                                        <AddOrEditParentDialog
                                                            dialogOpen={dialogOpen}
                                                            setDialogOpen={setDialogOpen}
                                                            groupName={groupName}
                                                            setGroupName={setGroupName}
                                                            defaultValues={{ id: g.id, name: g.name }}
                                                        />
                                                    </div>
                                                </div>
                                            </CommandItem>

                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export default SelectProductGroup
