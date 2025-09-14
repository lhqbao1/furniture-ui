"use client"

import { useFormContext } from "react-hook-form"
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Eye, EyeOff, Key } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface CheckOutPassword {
    isCreatePassword: boolean
    setIsCreatePassword: React.Dispatch<React.SetStateAction<boolean>>
}

export function CheckOutPassword({ isCreatePassword, setIsCreatePassword }: CheckOutPassword) {
    const form = useFormContext()
    const [seePassword, setSeePassword] = useState(false)
    const t = useTranslations()

    return (
        <div className="space-y-4">
            <div className="flex justify-between bg-secondary/10 p-2">
                <h2 className="text-lg text-black font-semibold">{t('createAccount')}</h2>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="same-invoice">{t('createAccount')}</Label>
                    <Switch
                        id="same-invoice"
                        checked={isCreatePassword}
                        onCheckedChange={setIsCreatePassword}
                        className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary"
                    />
                </div>
            </div>
            {isCreatePassword ? (
                <div className="grid grid-cols-2 gap-4">
                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('password')}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        {seePassword === false ?
                                            <Eye className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setSeePassword(true)} /> :
                                            <EyeOff className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setSeePassword(false)} />}
                                        <Input type={seePassword ? 'text' : 'password'} placeholder="Password" {...field} className="pl-12 py-3 h-fit" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('confirm_password')}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        {seePassword === false ?
                                            <Eye className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setSeePassword(true)} /> :
                                            <EyeOff className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setSeePassword(false)} />}
                                        <Input type={seePassword ? 'text' : 'password'} placeholder="Password" {...field} className="pl-12 py-3 h-fit" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            ) : ''}

        </div>
    )
}
