'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgePercent } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CartResponse } from "@/types/cart"
import { useRouter } from "next/navigation"

interface CartSummaryProps {
    total?: number
    onApplyCoupon?: (code: string) => void
    onCheckout?: () => void
    cart?: CartResponse
}

const CartSummary = ({ total = 0, onApplyCoupon, onCheckout, cart }: CartSummaryProps) => {
    const router = useRouter()

    return (
        <Card className="p-4 px-0 border-0 shadow-none bg-zinc-100/55 rounded-xl sticky top-20">
            <CardHeader className="pb-0 border-b">
                <CardTitle className="text-xl font-bold text-center">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Apply Coupon */}
                <div className="flex items-center gap-2">
                    <BadgePercent className="w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Apply Coupons" className="flex-1" />
                    <Button className='bg-secondary/85 hover:bg-secondary cursor-pointer' hasEffect>
                        Apply
                    </Button>
                </div>

                {/* Total */}
                <div className="xl:py-7 py-3 border-t border-b space-y-4">
                    <div className="flex justify-between text-base font-semibold items-center">
                        <span>Total</span>
                        <span className="text-primary text-xl font-bold">€{total.toFixed(2)}</span>
                    </div>
                    <Button
                        className="w-full bg-primary py-5 cursor-pointer"
                        hasEffect
                        onClick={onCheckout}
                    >
                        PROCEED TO CHECKOUT
                    </Button>
                </div>

                {/* Info */}
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>🔒</span> Safe and Secure Payments, Easy Returns. <br />
                    100% Authentic Products
                </p>
            </CardContent>
        </Card>
    )
}

export default CartSummary
