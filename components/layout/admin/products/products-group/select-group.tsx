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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAddProductGroup, useDeleteProductGroup, useGetProductGroup } from "@/features/product-group/hook"
import { toast } from "sonner"
import { atom, useAtom } from "jotai"
import { currentProductGroup } from "@/store/product-group"

const SelectProductGroup = () => {
    const [open, setOpen] = React.useState(false)
    const [groupName, setGroupName] = React.useState("")
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [currentGroup, setCurrentGroup] = useAtom(currentProductGroup)
    // const [selectedGroupId, setSelectedGroupId] = React.useState<string | null>(null)

    const { data: groups, isLoading, isError } = useGetProductGroup()

    const addProductGroupMutation = useAddProductGroup()
    const deleteProductGroupMutation = useDeleteProductGroup()

    const form = useFormContext()


    const handleAddProductGroup = (name: string) => {
        addProductGroupMutation.mutate(name, {
            onSuccess: () => {
                toast.success("Product group created")
                setDialogOpen(false)
                setGroupName('')
            },
            onError: () => {
                toast.error("Create product group failed")
            },
        })
    }

    const handleDeleteAddGroup = (id: string) => {
        deleteProductGroupMutation.mutate(id, {
            onSuccess(data, variables, context) {
                toast.success("Delete product successful")
            },
            onError(error, variables, context) {
                toast.error("Delete product fail")
            },
        })
    }

    return (
        <Controller
            control={form.control}
            name="parent_id"
            render={({ field }) => (
                <FormItem className="space-y-2">
                    <FormLabel className="flex justify-between items-center">
                        <span>Select product group</span>
                        {/* Dialog Add Group */}
                        <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(!dialogOpen)}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="secondary">
                                    Add Group
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-1/3">
                                <DialogHeader>
                                    <DialogTitle>Add Product Group</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <Input
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="Group name"
                                    />

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            disabled={addProductGroupMutation.isPending}
                                            onClick={() => {
                                                if (groupName.trim()) {
                                                    handleAddProductGroup(groupName.trim())
                                                } else {
                                                    toast.error("Please enter group name")
                                                }
                                            }}
                                        >
                                            {addProductGroupMutation.isPending ? <Loader2 className="animate-spin" /> : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </FormLabel>

                    {/* Combobox gắn với form cha */}
                    <FormControl>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {field.value
                                        ? groups?.find((g) => g.id === field.value)?.name
                                        : "Choose group..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full min-w-96">
                                <Command>
                                    <CommandInput placeholder="Search group..." />
                                    <CommandEmpty>No group found.</CommandEmpty>
                                    <CommandGroup>
                                        {groups?.map((g) => (
                                            <CommandItem
                                                key={g.id}
                                                onSelect={() => {
                                                    setCurrentGroup(g.name)
                                                    field.onChange(g.id)
                                                    setOpen(false)
                                                }}
                                            >
                                                <div className="flex justify-between w-full">
                                                    <div className="flex gap-1 items-center">
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                field.value === g.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {g.name}
                                                    </div>
                                                    {/* <Dialog open={selectedGroupId === g.id} onOpenChange={(open) => !open && setSelectedGroupId(null)}>
                                                        <DialogTrigger asChild>
                                                            <div className="cursor-pointer flex items-center" onClick={() => setSelectedGroupId(g.id)}>
                                                                <X stroke="red" />
                                                            </div>
                                                        </DialogTrigger>

                                                        <DialogContent className="w-1/3">
                                                            <DialogHeader>
                                                                <DialogTitle>Confirm Delete</DialogTitle>
                                                            </DialogHeader>

                                                            <p>Bạn có chắc muốn xoá group <b>{g.name}</b> không?</p>

                                                            <div className="flex justify-end gap-2 mt-4">
                                                                <DialogTrigger asChild>
                                                                    <Button type="button" variant="outline">
                                                                        Cancel
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    onClick={() => handleDeleteAddGroup(g.id)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog> */}
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
