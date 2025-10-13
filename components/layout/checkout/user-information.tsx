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
import { useTranslations } from "next-intl"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


interface CheckOutUserInformationProps {
    isLogin: boolean
    userId?: string
}
export default function CheckOutUserInformation({ isLogin, userId }: CheckOutUserInformationProps) {
    const form = useFormContext()
    const t = useTranslations()

    return (
        <div className="space-y-4">
            <div className="flex justify-between bg-secondary/10 p-2">
                <h2 className="text-lg text-black font-semibold ">{t('userInformation')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                {/* <FormLabel>{t("gender")}</FormLabel> */}
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                        <FormItem className="flex gap-1 items-center">
                                            <FormControl>
                                                <RadioGroupItem value="male" />
                                            </FormControl>
                                            <FormLabel className="ml-2">{t("male")}</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex gap-1 items-center">
                                            <FormControl>
                                                <RadioGroupItem value="female" />
                                            </FormControl>
                                            <FormLabel className="ml-2">{t("female")}</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex gap-1 items-center">
                                            <FormControl>
                                                <RadioGroupItem value="other" />
                                            </FormControl>
                                            <FormLabel className="ml-2">{t("otherGender")}</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('firstName')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} disabled={isLogin} />
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
                            <FormLabel>{t('lastName')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} disabled={isLogin} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('email')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder=""
                                    {...field}
                                    disabled={isLogin}
                                />
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
                            <FormLabel>{t('phone_number')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder=""
                                    {...field}
                                    disabled={isLogin}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}
