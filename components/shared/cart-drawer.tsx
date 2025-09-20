import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerTitle,
    DrawerClose,
    DrawerDescription,
} from "@/components/ui/drawer"
import CartPage from "@/src/app/[locale]/(no-banner)/cart/page"
import { ShoppingCart, X } from "lucide-react"
import { useTranslations } from "next-intl"

export interface CartDrawerProps {
    openCart: boolean
    setOpenCart: (open: boolean) => void
    cartNumber?: number
}

export function CartDrawer({ openCart, setOpenCart, cartNumber }: CartDrawerProps) {
    const t = useTranslations()
    return (
        <Drawer open={openCart} onOpenChange={setOpenCart} direction="left">
            <DrawerTrigger asChild>
                <div className="relative">
                    <ShoppingCart
                        stroke="#4D4D4D"
                        size={30}
                        className="hover:scale-110 transition-all duration-300"
                    />
                    {cartNumber && cartNumber > 0 ? (
                        <span className="absolute -top-1.5 -right-1 flex size-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
                        </span>
                    ) : null}
                </div>
            </DrawerTrigger>

            <DrawerContent className="w-full h-full px-4 flex flex-col p-0 data-[vaul-drawer-direction=left]:w-full duration-500 overflow-y-scroll">
                <DrawerTitle className="border-b-2 p-4 flex justify-between">
                    <div className="uppercase font-bold text-xl">{t("cart")}</div>
                    <DrawerClose>
                        <X />
                    </DrawerClose>
                </DrawerTitle>
                <DrawerDescription></DrawerDescription>
                <CartPage />
            </DrawerContent>
        </Drawer>
    )
}
