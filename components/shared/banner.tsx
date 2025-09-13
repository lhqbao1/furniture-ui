'use client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Mic, Search, ShoppingCart, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { BannerInput } from '@/components/shared/banner-input'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { useMediaQuery } from 'react-responsive'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import ProductSearch from './product-search'
import { getMe } from '@/features/auth/api'
import { useTranslations } from 'next-intl'
import { useIsMobile } from '@/hooks/use-mobile'
import { getCartItems } from '@/features/cart/api'
import MobileProductSearch from './mobile-product-search'

interface BannerProps {
    height?: number
}

const Banner = ({ height }: BannerProps) => {
    const isPhone = useMediaQuery({ maxWidth: 430 })
    const queryClient = useQueryClient();
    const [isSticky, setIsSticky] = useState(false);
    const t = useTranslations()
    const router = useRouter()
    const pathname = usePathname()

    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useQuery({
        queryKey: ["me", userId],
        queryFn: () => getMe(),
        enabled: !!userId,
        retry: false,
    });

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

    // Xử lý scroll
    useEffect(() => {
        const handleScroll = () => {
            const bannerHeight = 400; // chiều cao banner (px)
            if (window.scrollY >= bannerHeight) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={cn(
                "relative w-full flex-shrink-0",
                !height ? `h-[200px] lg:h-[400px]` : `lg:h-[${height}px]`,
                isPhone ? "mb-16 h-0" : ""
            )}
            style={isPhone ? { height: 0 } : { height }}
        >
            {!isPhone ?
                <Image
                    src="/banner.jpeg"
                    alt="Banner"
                    fill
                    className={`object-cover ${isPhone && 'mt-16'}`}
                    priority
                />
                : ''}

            <div className='home-banner__content h-full flex flex-col relative z-10'>
                <div className={`home-banner-top__content ${isPhone ? 'fixed flex flex-row gap-4 h-16 w-full bg-white shadow-secondary/10 shadow-xl py-4 items-center px-4' : 'flex flex-col items-end pt-1'}`}>
                    <div className={`${isPhone ? 'block' : 'hidden'}`}>
                        <Image
                            src={'/new-logo.svg'}
                            width={40}
                            height={40}
                            alt=''
                            unoptimized
                        />
                    </div>

                    <div className={`flex h-full items-center justify-end gap-4 ${isPhone ? 'w-full' : 'flex-0 pt-4 pr-4'}`}>
                        {/*Language switch */}
                        <Select
                            defaultValue="de"
                            onValueChange={(value) => {
                                if (value === "de") {
                                    const path = pathname.startsWith('/en') ? pathname.replace('/en', '') : pathname
                                    router.push(path)
                                } else if (value === "en") {
                                    const path = pathname.startsWith('/en') ? pathname : `/en${pathname}`
                                    router.push(path)
                                }
                            }}
                        >
                            <SelectTrigger className={`w-[150px] text-white text-xl font-bold xl:border-0 border-2 border-white ${isPhone ? 'hidden' : ''}`}>
                                <SelectValue placeholder={t('german')} className='text-white' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="de" className='font-semibold'>{t('german')}</SelectItem>
                                <SelectItem value="en" className='font-semibold'>{t('english')}</SelectItem>
                            </SelectContent>
                        </Select>

                        {/*Mobile Search */}
                        <div className={`${isPhone ? 'block' : 'hidden'}`}>
                            <MobileProductSearch />
                        </div>

                        {/*Shopping cart */}
                        <div className={`cursor-pointer relative`}>
                            <ShoppingCart stroke={`${isPhone ? '#00B159' : 'white'}`} size={30} className='hover:scale-110 transition-all duration-300' />
                            <div className='absolute -top-4 -right-4 text-white bg-primary py-1 px-3 rounded-full flex items-center text-sm'>{cart && cart.items ? cart.items.length : 0}</div>
                        </div>

                        {isPhone ?
                            <SidebarTrigger className={`border-none text-primary relative`} isMobile={isPhone ? true : false} />
                            : ''}

                        {/*User */}
                        <DropdownMenu >
                            <DropdownMenuTrigger asChild>
                                <div className='flex gap-2 justify-start items-end'>
                                    <User className="cursor-pointer hover:scale-110 transition-all duration-300 relative" stroke={`${isPhone ? '#00B159' : 'white'}`} size={30} />
                                    {!isPhone && (
                                        user && userId ? (
                                            <div className="text-white text-xl font-semibold">
                                                {user.first_name} {user.last_name}
                                            </div>
                                        ) : (
                                            <Link
                                                href="/login"
                                                className="text-white text-xl font-semibold"
                                            >
                                                {t("login")}
                                            </Link>
                                        )
                                    )}

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

                {/*Product search desktop */}
                <div className={`${isPhone ? 'hidden' : 'block'}`}>
                    <ProductSearch />
                </div>

                {/* Phần title căn giữa theo chiều cao */}
                {
                    isPhone || height ? '' :
                        <div className="flex-1 flex flex-col justify-center items-center gap-6 xl:mt-12 mt-0 xl:px-0 px-4">
                            <h1 className="home-banner__title font-bold leading-tight flex xl:flex-row flex-col justify-center items-center xl:gap-4 gap-1">
                                <span className="text-secondary text-4xl lg:text-6xl font-libre font-semibold uppercase">
                                    {t('welcomeTo')}
                                </span>
                                <span className="text-primary text-4xl lg:text-6xl font-libre font-semibold uppercase">
                                    PRESTIGE HOME
                                </span>
                            </h1>
                            <span className='text-white xl:text-3xl text-xl text-center font-medium uppercase'>{t('slogan')}</span>
                        </div>
                }
            </div>
        </div>
    )
}

export default Banner