"use client"

import { useFormContext, Controller, useWatch } from "react-hook-form"
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetAllCustomers } from "@/features/users/hook"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

interface CheckOutUserInformationProps {
    userId?: string
    setUserId?: (id: string) => void
    isAdmin?: boolean
}

export function CheckOutUserInformation({ userId, setUserId, isAdmin = false }: CheckOutUserInformationProps) {
    const form = useFormContext()
    const t = useTranslations()
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const { data: listUser, isLoading } = useGetAllCustomers()

    return (
        <div className="space-y-4">
            <div className="flex justify-between bg-secondary/10 p-2">
                <h2 className="text-lg text-black font-semibold ">{isAdmin ? "User Information" : t('userInformation')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isAdmin ? "First Name" : t('firstName')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isAdmin ? "Last Name" : t('lastName')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => {
                        const emails = listUser?.map((user) => user.email) || []

                        const filtered = inputValue
                            ? emails.filter((e) => e.toLowerCase().includes(inputValue.toLowerCase()))
                            : emails

                        return (
                            <FormItem>
                                <FormLabel>{t("email")}</FormLabel>
                                <Popover open={open} onOpenChange={setOpen} modal={false}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                value={inputValue}
                                                onChange={(e) => {
                                                    const val = e.target.value

                                                    setInputValue(e.target.value)
                                                    field.onChange(e.target.value)
                                                    const hasSuggestions = emails.some((email) =>
                                                        email.toLowerCase().includes(val.toLowerCase())
                                                    )
                                                    // Trì hoãn mở popover để tránh mất focus
                                                    setTimeout(() => {
                                                        setOpen(hasSuggestions)
                                                    }, 500)
                                                }}
                                            />
                                        </FormControl>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        className="min-w-[340px] p-0"
                                        align="start"
                                    >
                                        {filtered.length > 0 ? (
                                            <Command>
                                                <CommandList>
                                                    <CommandGroup>
                                                        {filtered.map((email) => (
                                                            <CommandItem
                                                                key={email}
                                                                value={email}
                                                                onSelect={(value) => {
                                                                    const selectedUser = listUser?.find((u) => u.email === value)
                                                                    if (setUserId) {
                                                                        setUserId(selectedUser?.id || "")
                                                                    }
                                                                    field.onChange(value)
                                                                    setInputValue(value)
                                                                    setOpen(false)
                                                                }}
                                                            >
                                                                {email}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        ) : (
                                            <div className="p-2 text-sm text-muted-foreground">
                                                {t("noResult")}
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>

                                <FormMessage />
                            </FormItem>
                        )
                    }}
                /> */}

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isAdmin ? "Phone Number" : t('phone_number')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="+49"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>{isAdmin ? "Gender" : t("gender")}</FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="w-full border" placeholderColor>
                                        <SelectValue placeholder={isAdmin ? "Gender" : t("gender")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">{isAdmin ? "Male" : t("male")}</SelectItem>
                                        <SelectItem value="female">{isAdmin ? "Female" : t("female")}</SelectItem>
                                        <SelectItem value="other">{isAdmin ? 'Other' : t("otherGender")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
