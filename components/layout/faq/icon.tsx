import {
    ShoppingCart,
    Truck,
    RotateCcw,
    User,
    Wallet,
    Tag,
    Pointer,
    ShieldCheck,
    Grid,
} from "lucide-react"

export const getIcon = (name: string) => {
    switch (name) {
        case "Order":
            return <ShoppingCart className="w-10 h-10 text-primary" strokeWidth="1" />
        case "Delivery":
            return <Truck className="w-10 h-10 text-primary" strokeWidth="1" />
        case "Cancellation & return":
            return <RotateCcw className="w-10 h-10 text-primary" strokeWidth="1" />
        case "Account":
            return <User className="w-10 h-10 text-primary" strokeWidth="1" />
        case "Payment":
            return <Wallet className="w-10 h-10 text-primary" strokeWidth="1" />
        case "Promotions":
            return <Tag className="w-10 h-10 text-primary" strokeWidth="1" />
        case "Usage":
            return <Pointer className="w-10 h-10 text-primary" strokeWidth="1" />
        case "Warranty":
            return <ShieldCheck className="w-10 h-10 text-primary" strokeWidth="1" />
        case "Somthing Else":
            return <Grid className="w-10 h-10 text-primary" strokeWidth="1" />
        default:
            return <Grid className="w-10 h-10 text-primary" strokeWidth="1" />
    }
}