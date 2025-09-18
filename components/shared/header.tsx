import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import React from 'react'
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

interface PageHeaderProps {
    hasSideBar?: boolean
}

const PageHeader = ({ hasSideBar = false }: PageHeaderProps) => {
    const router = useRouter()
    const t = useTranslations()
    const isPhone = useIsPhone()

    const queryClient = useQueryClient();

    const [userId, setUserId] = React.useState<string | null>(
        typeof window !== "undefined" ? localStorage.getItem("userId") : null
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
        retry: false,
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
                <Link href={'/'}>
                    <Image
                        src={'/new-logo.svg'}
                        width={40}
                        height={40}
                        alt=''
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
                <Link href={'/cart'} className={`cursor-pointer relative`}>
                    <ShoppingCart stroke={`#4D4D4D`} size={30} className='hover:scale-110 transition-all duration-300' />
                    {displayedCart && displayedCart.length > 0 ?
                        <span className="absolute -top-1.5 -right-1 flex size-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
                        </span>
                        : ''}
                </Link>


                {/*User */}
                {/* User */}
                {!user || !userId ? (
                    // Case chưa login -> dialog
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="flex gap-2 justify-start items-end">
                                <User
                                    className="cursor-pointer hover:scale-110 transition-all duration-300 relative"
                                    stroke="#4D4D4D"
                                    size={30}
                                />
                            </div>
                        </DialogTrigger>
                        <DialogContent isTopRight className='lg:w-[500px] w-full lg:top-10 top-30 right-3  translate-x-0 translate-y-0 lg:!right-10 lg:p-0'>
                            <DialogTitle className='border-b-2 p-4'>
                                <div className='uppercase font-bold text-xl'>{t('login')}</div>
                            </DialogTitle>
                            {/* Nội dung login/signup ở đây */}
                            <div className='px-4 pb-6 space-y-2'>
                                <p className='text-black/70 text-lg'>Melden Sie sich hier mit Ihren Kundendaten an.</p>
                                <HeaderLoginForm />
                            </div>
                            {/* form login/register component */}
                        </DialogContent>
                    </Dialog>
                ) : (
                    // Case đã login -> dropdown menu
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
                            className="w-48 !absolute top-0 lg:-left-[180px] -left-[180px]"
                        >
                            <DropdownMenuLabel>
                                {t("greeting")}, {user.last_name}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/account")}>
                                {t("accountInformation")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onLogout}>{t("logout")}</DropdownMenuItem>
                            <Link href={"/cart"}>
                                <DropdownMenuItem>{t("cart")}</DropdownMenuItem>
                            </Link>
                            <Link href={"/wishlist"}>
                                <DropdownMenuItem>{t("wishlist")}</DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}


                {hasSideBar ?
                    <SidebarTrigger className={`border-none text-[#4D4D4D] relative`} isMobile={isPhone ? true : false} />
                    : ''}
            </div>
        </div>
    )
}

export default PageHeader