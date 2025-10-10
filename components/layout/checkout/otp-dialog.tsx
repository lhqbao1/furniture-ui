"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useLoginOtp } from "@/features/auth/hook"
import { useSyncLocalCart } from "@/features/cart/hook"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

interface OtpDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    email: string
    onSuccess: (userId: string) => void
}

export function OtpDialog({ open, onOpenChange, email, onSuccess }: OtpDialogProps) {
    const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""])
    const loginOtpMutation = useLoginOtp()
    const syncLocalCartMutation = useSyncLocalCart();
    const t = useTranslations()

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return // chỉ cho nhập số
        const newOtp = [...otpValues]
        newOtp[index] = value.slice(-1) // chỉ giữ 1 ký tự
        setOtpValues(newOtp)

        // Tự focus sang input kế tiếp
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`)
            nextInput?.focus()
        }
    }


    // ✅ Cho phép dán (paste) toàn bộ mã OTP 1 lần
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pasteData = e.clipboardData.getData("Text").trim()
        if (!/^\d{6}$/.test(pasteData)) return
        const newOtp = pasteData.split("").slice(0, 6)
        setOtpValues(newOtp)
    }

    const handleSubmit = () => {
        const code = otpValues.join("")
        if (code.length !== 6) {
            toast.error(t('otpRequired'))
            return
        }

        loginOtpMutation.mutate(
            { email, code },
            {
                onSuccess: (data) => {
                    localStorage.setItem("access_token", data.access_token)
                    localStorage.setItem("userId", data.id)

                    toast.success(t('otpDone'))
                    onSuccess(data.id)
                    onOpenChange(false)
                    syncLocalCartMutation.mutate()
                },
                onError: () => {
                    toast.error(t('otpError'))
                },
            }
        )
    }

    // ✅ Tự động submit khi nhập đủ 6 số
    useEffect(() => {
        const code = otpValues.join("")
        if (code.length === 6) {
            handleSubmit()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otpValues])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] gap-2">
                <DialogHeader>
                    <DialogTitle className="text-center">OTP</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-gray-600 mb-4 text-center">
                    {t('sendedEmail')}
                </p>

                {/* OTP Inputs */}
                <div className="flex gap-2 justify-center mb-4">
                    {otpValues.map((val, idx) => (
                        <Input
                            key={idx}
                            id={`otp-${idx}`}
                            value={val}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onPaste={handlePaste}
                            className="w-10 text-center text-lg"
                            maxLength={1}
                        />
                    ))}
                </div>

                <p className="text-xs text-gray-500">
                    {t('ifNotEnterOtp')}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                    {t('useDifferentEmail')}
                </p>

                <Button
                    className="w-full bg-secondary/95 hover:bg-secondary"
                    onClick={handleSubmit}
                    disabled={loginOtpMutation.isPending}
                >
                    {loginOtpMutation.isPending ?
                        <Loader2 className="animate-spin" />
                        : <div>{t('verifyOTP')}</div>}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
