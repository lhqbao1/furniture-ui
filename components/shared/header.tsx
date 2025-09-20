import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import React, { useState } from 'react'
import { useMediaQuery } from 'react-responsive';
import ProductSearch from './product-search';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ChevronDown, Mic, Search, ShoppingCart, User, X } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MobileProductSearch from './mobile-product-search';
import { getCartItems } from '@/features/cart/api';
import { toast } from 'sonner';
import { getMe } from '@/features/auth/api';
import { Link, useRouter } from '@/src/i18n/navigation';
import { useCartLocal } from '@/hooks/cart';
import { useIsPhone } from '@/hooks/use-is-phone';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import HeaderLoginForm from './header-login-form';
import CartPage from '@/src/app/[locale]/(no-banner)/cart/page';
import { CartDrawer } from './cart-drawer';
import { LoginDrawer } from './login-drawer';

interface PageHeaderProps {
    hasSideBar?: boolean
}

const PageHeader = ({ hasSideBar = false }: PageHeaderProps) => {
    const router = useRouter()
    const t = useTranslations()
    const isPhone = useIsPhone()
    const [open, setOpen] = useState(false)
    const [openCart, setOpenCart] = useState(false)

    const queryClient = useQueryClient();

    const [userId, setUserId] = React.useState<string | null>(
        typeof window !== "undefined" ? localStorage.getItem("userId") : ""
    );

    //Get cart local and server
    const { cart: localCart, addToCartLocal, updateCart } = useCartLocal();
    const { data: cart, isLoading: isLoadingCart, isError: isErrorCart } = useQuery({
        queryKey: ["cart-items", userId],
        queryFn: async () => {
            const data = await getCartItems()
            data.items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            return data
        },
        enabled: !!userId,
        retry: false,
    })

    const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useQuery({
        queryKey: ["me", userId],
        queryFn: () => getMe(),
        enabled: !!userId,
    });


    const onLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("userId");
        localStorage.removeItem("checkout");
        localStorage.removeItem("payment");

        toast.success("Logged out successfully");

        // Reset react-query cache liên quan đến user/session
        queryClient.removeQueries({ queryKey: ["me"], exact: true });
        queryClient.removeQueries({ queryKey: ["user"], exact: true });

        setUserId(null); // cập nhật lại state để trigger re-render
        // queryClient.removeQueries({ queryKey: ["cart-items"], exact: true });
    }

    const displayedCart = userId ? cart?.items ?? [] : localCart;


    return (
        <div className={`home-banner-top__content sticky top-0 overflow-hidden z-50 ${isPhone ? 'flex flex-row gap-4 h-16 w-full bg-white shadow-secondary/10 shadow-xl py-4 items-center px-4' : 'flex items-center justify-end px-4 py-3 gap-6 bg-white shadow-secondary/10 shadow-xl'}`}>
            <div className={`flex gap-4 items-center`}>
                <Link href={'/'} className='relative w-10 h-10'>
                    {/* <Image
                        src={'/new-logo.svg'}
                        width={40}
                        height={40}
                        alt=''
                        unoptimized
                    /> */}
                    <Image
                        src="/new-logo.svg"
                        alt=""
                        fill
                        style={{ objectFit: "contain" }}
                        unoptimized
                    />
                </Link>
                <div className={`text-[29px] gap-1 ${isPhone ? 'hidden' : 'flex'}`} translate="no">
                    <span className="text-secondary font-bold">Prestige</span>
                    <span className="text-primary font-bold">Home</span>
                </div>
            </div>

            {/*Product search desktop */}
            <div className={`${isPhone ? 'hidden' : 'block flex-1'}`}>
                <ProductSearch />
            </div>

            <div className={`flex h-full items-center justify-end ${isPhone ? 'w-full gap-3' : 'items-end gap-6'}`}>

                {/*Language switch */}
                {/* <Select
                    onValueChange={(value) => {
                        if (value === "de") {
                            const path = pathname.startsWith('/en') ? pathname.replace('/en', '/') : pathname
                            console.log('de', value)
                            console.log(path)
                            router.push(path)
                        } else if (value === "en") {
                            const path = pathname.startsWith('/en') ? pathname : `/en${pathname}`
                            console.log('en', value)
                            console.log(path)
                            router.push(path)
                        }
                    }}
                >
                    <SelectTrigger className={`justify-end text-black/70 text-xl font-bold px-0 py-0 !h-[30px]  ${isPhone ? 'hidden' : ''}`} iconColor='#4D4D4D'>
                        <SelectValue placeholder={t('german')} className='text-secondary' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="de" className='font-semibold'>{t('german')}</SelectItem>
                        <SelectItem value="en" className='font-semibold'>{t('english')}</SelectItem>
                    </SelectContent>
                </Select> */}

                {/*Mobile Search */}
                <div className={`${isPhone ? 'block' : 'hidden'}`}>
                    <MobileProductSearch />
                </div>

                {/*Shopping cart */}
                {isPhone ?
                    (
                        <CartDrawer openCart={openCart} setOpenCart={setOpenCart} cartNumber={displayedCart.length} />
                    )
                    :
                    (<Link href={'/cart'} className={`cursor-pointer relative`}>
                        <ShoppingCart stroke={`#4D4D4D`} size={30} className='hover:scale-110 transition-all duration-300' />
                        {displayedCart && displayedCart.length > 0 ?
                            <span className="absolute -top-1.5 -right-1 flex size-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
                            </span>
                            : ''}
                    </Link>)
                }


                {/*User */}
                {isLoadingUser ? (
                    // Loading state
                    <User
                        stroke="#4D4D4D"
                        size={30}
                        className="animate-pulse opacity-50"
                    />
                ) : user ? (
                    // Logged in -> Dropdown
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex gap-2 justify-start items-end">
                                <User
                                    className="cursor-pointer hover:scale-110 transition-all duration-300 relative"
                                    stroke="#4D4D4D"
                                    size={30}
                                />
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            side="bottom"
                            className="w-48 !absolute top-0 lg:-left-[180px] -left-[180px]
              data-[state=open]:slide-in-from-right duration-500
              data-[state=closed]:slide-out-to-right"
                        >
                            <DropdownMenuLabel>
                                {t("greeting")}, {user.last_name}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/account")}>
                                {t("accountInformation")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onLogout}>
                                {t("logout")}
                            </DropdownMenuItem>
                            <Link href={"/wishlist"}>
                                <DropdownMenuItem>{t("wishlist")}</DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    // Not logged in -> Dialog
                    //         <Dialog open={open} onOpenChange={setOpen}>
                    //             <DialogTrigger asChild>
                    //                 <div className="flex gap-2 justify-start items-end">
                    //                     <User
                    //                         className="cursor-pointer hover:scale-110 transition-all duration-300 relative"
                    //                         stroke="#4D4D4D"
                    //                         size={30}
                    //                     />
                    //                 </div>
                    //             </DialogTrigger>
                    //             <DialogContent
                    //                 isTopRight
                    //                 className="lg:w-[500px] w-full lg:h-fit h-full lg:top-10 top-0 max-w-full translate-x-0 translate-y-0 lg:!right-10 lg:p-0 flex flex-col lg:grid
                    //   data-[state=open]:slide-in-from-right duration-500
                    //   data-[state=closed]:slide-out-to-left"
                    //             >
                    //                 <DialogTitle className="border-b-2 p-4">
                    //                     <div className="uppercase font-bold text-xl">{t("login")}</div>
                    //                 </DialogTitle>
                    //                 <div className="px-4 pb-6 space-y-2">
                    //                     <p className="text-black/70 text-lg">
                    //                         Melden Sie sich hier mit Ihren Kundendaten an.
                    //                     </p>
                    //                     <HeaderLoginForm
                    //                         onSuccess={() => {
                    //                             const uid = localStorage.getItem("userId")
                    //                             setUserId(uid) // cập nhật state
                    //                             queryClient.invalidateQueries({ queryKey: ["me"] })
                    //                             queryClient.invalidateQueries({ queryKey: ["cart-items"] })
                    //                             setOpen(false)
                    //                         }}
                    //                     />
                    //                 </div>
                    //             </DialogContent>
                    //         </Dialog>
                    <LoginDrawer openLogin={open} setOpenLogin={setOpen} />
                )}

                {hasSideBar ?
                    <SidebarTrigger className={`border-none text-[#4D4D4D] relative`} isMobile={isPhone ? true : false} />
                    : ''}
            </div>
        </div>
    )
}

export default PageHeader