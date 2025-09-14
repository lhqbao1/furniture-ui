import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import React from 'react'
import { useMediaQuery } from 'react-responsive';
import ProductSearch from './product-search';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ChevronDown, Mic, Search, ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BannerInput } from '@/components/shared/banner-input'
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
import Link from 'next/link';


const PageHeader = () => {
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations()


    const isPhone = useMediaQuery({ maxWidth: 430 })
    const queryClient = useQueryClient();

    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;


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
        toast.success("Logged out successfully")
        // Reset react-query cache
        queryClient.removeQueries({ queryKey: ["me"] }); // xoá query user
        queryClient.removeQueries({ queryKey: ["cart-items"] }); // xoá cart
        queryClient.clear(); // tùy chọn xóa tất cả cache
    }

    return (
        <div className={`home-banner-top__content ${isPhone ? 'sticky top-0 flex flex-row gap-4 h-16 w-full bg-white shadow-secondary/10 shadow-xl py-4 items-center px-4 overflow-hidden' : 'flex items-center justify-end px-4 py-3 gap-6 sticky bg-white shadow-secondary/10 shadow-xl z-50 top-0'}`}>
            <div className={`${isPhone ? 'block' : 'hidden'}`}>
                <Image
                    src={'/new-logo.svg'}
                    width={40}
                    height={40}
                    alt=''
                    unoptimized
                />
            </div>
            {/*Product search desktop */}
            <div className={`${isPhone ? 'hidden' : 'block w-full'}`}>
                <ProductSearch />
            </div>

            <div className={`flex h-full items-center justify-end gap-6 ${isPhone ? 'w-full' : 'items-end'}`}>

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
                    <ShoppingCart stroke={`${isPhone ? '#00B159' : '#4D4D4D'}`} size={30} className='hover:scale-110 transition-all duration-300' />
                    <div className='absolute -top-4 -right-4 text-white bg-primary py-1 px-3 rounded-full flex items-center text-sm'>{cart && cart.items ? cart.items.length : 0}</div>
                </Link>

                {isPhone ?
                    <SidebarTrigger className={`border-none text-primary relative`} isMobile={isPhone ? true : false} />
                    : ''}

                {/*User */}
                <DropdownMenu >
                    <DropdownMenuTrigger asChild>
                        <div className='flex gap-2 justify-start items-end'>
                            <User className="cursor-pointer hover:scale-110 transition-all duration-300 relative" stroke={`${isPhone ? '#00B159' : '#4D4D4D'}`} size={30} />
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent side="bottom" className="w-48 !absolute top-0 lg:-left-[180px] -left-[180px]">
                        {!user || !userId ? (
                            <div>
                                <Link href={'/login'} className='cursor-pointer'>
                                    <DropdownMenuItem className='cursor-pointer'>
                                        {t('login')}
                                    </DropdownMenuItem>
                                </Link>
                                <Link href={'/sign-up'} className='cursor-pointer'>
                                    <DropdownMenuItem className='cursor-pointer'>
                                        {t('createAccount')}
                                    </DropdownMenuItem>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <DropdownMenuLabel>{t('greeting')}, {user.last_name}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push('/account')}>
                                    {t('accountInformation')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onLogout}>
                                    {t('logout')}
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

export default PageHeader