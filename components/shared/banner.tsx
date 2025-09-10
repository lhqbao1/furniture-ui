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

    const userId = typeof window !== "undefined" ? localStorage.getItem("id") : null;

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
        queryClient.invalidateQueries({ queryKey: ["me"] }); // xóa dữ liệu user cũ
        queryClient.setQueryData(["me"], null)
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
                isPhone ? "mb-16" : ""
            )}
            style={isPhone ? { height: 200 } : { height }}
        >
            <Image
                src="/banner.jpeg"
                alt="Banner"
                fill
                className={`object-cover ${isPhone && 'mt-16'}`}
                priority
            />

            <div className='home-banner__content h-full flex flex-col relative z-10'>
                <div className={`home-banner-top__content ${isPhone ? 'fixed flex flex-row gap-4 h-16 w-full bg-white shadow-secondary/10 shadow-xl py-4 items-center px-4' : 'flex flex-col items-end'}`}>
                    <div className={`${isPhone ? 'block' : 'hidden'}`}>
                        <Image
                            src={'/new-logo.svg'}
                            width={40}
                            height={40}
                            alt=''
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
                            <SelectTrigger className={`w-[150px] text-white font-bold text-lg xl:border-0 border-2 border-white ${isPhone ? 'hidden' : ''}`}>
                                <SelectValue placeholder={t('german')} className='text-white' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="de" className='font-semibold'>{t('german')}</SelectItem>
                                <SelectItem value="en" className='font-semibold'>{t('english')}</SelectItem>
                            </SelectContent>
                        </Select>



                        {/*User */}
                        <DropdownMenu >
                            <DropdownMenuTrigger asChild>
                                <User className="cursor-pointer hover:scale-110 transition-all duration-300 relative" stroke={`${isPhone ? '#00B159' : '#F7941D'}`} />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent side="bottom" className="w-48 !absolute top-0 lg:-left-[180px]">
                                {!user ? (
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

                        <div className={`${isPhone ? 'block' : 'hidden'}`}>
                            {/*Search */}
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <Search stroke={`${isPhone ? '#00B159' : '#F7941D'}`} />
                                </DrawerTrigger>
                                <DrawerContent>
                                </DrawerContent>
                            </Drawer>
                        </div>

                        {/*Shopping cart */}
                        <div className={`${isPhone ? 'block' : 'hidden'}`}>
                            <ShoppingCart stroke={`${isPhone ? '#00B159' : '#F7941D'}`} />
                        </div>
                        {isPhone ?
                            <SidebarTrigger className={`border-none text-primary relative`} isMobile={isPhone ? true : false} />
                            : ''}
                    </div>
                </div>


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