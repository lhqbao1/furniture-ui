'use client'
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerTitle,
    DrawerClose,
    DrawerDescription,
} from "@/components/ui/drawer"
import { User, X } from "lucide-react"
import { useTranslations } from "next-intl"
import HeaderLoginForm from "./header-login-form"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import CartLoginForm from "../layout/cart/login-form-cart"
import { useRouter } from "@/src/i18n/navigation"

export interface LoginDrawerProps {
    openLogin: boolean
    setOpenLogin: (open: boolean) => void
    isCheckOut?: boolean
}

export function LoginDrawer({ openLogin, setOpenLogin, isCheckOut = false }: LoginDrawerProps) {
    const t = useTranslations()
    const [userId, setUserId] = useState<string | null>(
        typeof window !== "undefined" ? localStorage.getItem("userId") : ""
    );
    const queryClient = useQueryClient();
    const router = useRouter()
    return (
        <Drawer open={openLogin} onOpenChange={setOpenLogin} direction="left">
            {isCheckOut ? '' :
                (<DrawerTrigger asChild>
                    <div className="relative">
                        <User
                            className="cursor-pointer hover:scale-110 transition-all duration-300 relative"
                            stroke="#4D4D4D"
                            size={30}
                        />
                    </div>
                </DrawerTrigger>)
            }

            <DrawerContent className="w-full h-full flex flex-col p-0 data-[vaul-drawer-direction=left]:w-full duration-500">
                <DrawerTitle className="border-b-2 p-4 flex justify-between">
                    <div className="uppercase font-bold text-xl">{t("login")}</div>
                    <DrawerClose>
                        <X />
                    </DrawerClose>
                </DrawerTitle>
                <DrawerDescription></DrawerDescription>
                <div className="px-4 pb-6 space-y-2">
                    <p className="text-black/70 text-lg">
                        Melden Sie sich hier mit Ihren Kundendaten an.
                    </p>
                    {isCheckOut ?
                        (<CartLoginForm
                            onSuccess={() => {
                                setOpenLogin(false)
                                const uid = localStorage.getItem("userId")
                                setUserId(uid) // cập nhật state
                                queryClient.invalidateQueries({ queryKey: ["me"] })
                                queryClient.invalidateQueries({ queryKey: ["cart-items"] })
                                router.push('/check-out')
                            }}
                            onError={() => {
                                setOpenLogin(false)
                            }}
                        />) :
                        (<HeaderLoginForm
                            onSuccess={() => {
                                const uid = localStorage.getItem("userId")
                                setUserId(uid) // cập nhật state
                                queryClient.invalidateQueries({ queryKey: ["me"] })
                                queryClient.invalidateQueries({ queryKey: ["cart-items"] })
                                setOpenLogin(false)
                            }}
                        />)
                    }

                </div>
            </DrawerContent>
        </Drawer>
    )
}
