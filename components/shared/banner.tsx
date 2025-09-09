'use client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Mic, Search, ShoppingCart, User } from 'lucide-react'
import React, { useState } from 'react'
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
import { useMe } from '@/features/auth/hook'
import { useQueryClient } from '@tanstack/react-query'
import { useGetCartItems } from '@/features/cart/hook'
import { useRouter } from 'next/navigation'
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

interface BannerProps {
    height?: number
}

const Banner = ({ height }: BannerProps) => {
    const isPhone = useMediaQuery({ maxWidth: 430 })
    const queryClient = useQueryClient();
    const router = useRouter()

    const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useMe()

    const onLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("id");
        toast.success("Logged out successfully")
        // Reset react-query cache
        queryClient.invalidateQueries({ queryKey: ["me"] }); // xóa dữ liệu user cũ
        queryClient.setQueryData(["me"], null)
        queryClient.clear(); // tùy chọn xóa tất cả cache
    }

    return (
        <div
            className={cn(
                "relative w-full flex-shrink-0",
                !height ? `h-[200px] lg:h-[400px]` : `lg:h-[${height}px]`
            )}
            style={isPhone ? { height: 200 } : { height }}
        >
            <Image
                src="/banner.jpeg"
                alt="Banner"
                fill
                className="object-cover"
                priority
            />

            <div className='home-banner__content h-full flex flex-col relative z-10'>
                <div className={`home-banner-top__content ${isPhone ? 'fixed flex flex-row gap-4 w-full bg-white shadow-secondary/10 shadow-xl py-4 items-center px-4' : 'flex flex-col items-end'}`}>
                    <Image
                        src={'/new-logo.png'}
                        width={40}
                        height={40}
                        alt=''
                    />

                    <div className={`flex h-full items-center xl:justify-end gap-4 ${isPhone ? '' : 'flex-0 pt-4 pr-4'}`}>
                        {/*Language switch */}
                        <Select>
                            <SelectTrigger className={`w-[150px] text-white font-bold text-lg xl:border-0 border-2 border-white ${isPhone ? 'hidden' : ''}`}>
                                <SelectValue placeholder="German" className='text-white' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="German" className='font-semibold '>German</SelectItem>
                                <SelectItem value="English" className='font-semibold '>English</SelectItem>
                            </SelectContent>
                        </Select>

                        {/*User */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <User className="cursor-pointer hover:scale-110 transition-all duration-300" stroke={`${isPhone ? '#FAA61A' : '#FAA61A'}`} />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">
                                {!user ? (
                                    <div>
                                        <Link href={'/login'} className='cursor-pointer'>
                                            <DropdownMenuItem className='cursor-pointer'>
                                                Login
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href={'/sign-up'} className='cursor-pointer'>
                                            <DropdownMenuItem className='cursor-pointer'>
                                                Create an account
                                            </DropdownMenuItem>
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <DropdownMenuLabel>Hello, {user.last_name}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => router.push('/account')}>
                                            Account information
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={onLogout}>
                                            Log out
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/*Search */}
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Search />
                            </DrawerTrigger>
                            <DrawerContent>
                            </DrawerContent>
                        </Drawer>

                        {/*Search */}
                        <ShoppingCart />
                        <SidebarTrigger className={`border-none text-primary  ${isPhone ? 'relative' : 'absolute xl:top-2 xl:left-2 top-4 left-3 cursor-pointer z-20 bg-white'}`} isMobile={isPhone ? true : false} />
                    </div>
                </div>


                <ProductSearch />

                {/* Phần title căn giữa theo chiều cao */}
                {
                    isPhone || height ? '' :
                        <div className="flex-1 flex flex-col justify-center items-center gap-6 xl:mt-12 mt-0 xl:px-0 px-4">
                            <h1 className="home-banner__title font-bold leading-tight flex xl:flex-row flex-col justify-center items-center xl:gap-4 gap-1">
                                <span className="text-secondary text-4xl lg:text-6xl font-libre font-semibold">
                                    WELCOME TO
                                </span>
                                <span className="text-primary text-4xl lg:text-6xl font-libre font-semibold">
                                    PRESTIGE HOME
                                </span>
                            </h1>
                            <span className='text-white xl:text-3xl text-xl text-center font-medium'>THE PLACE YOU CAN FIND UNIQUE AND TRENDY PRODUCTS</span>
                        </div>
                }
            </div>
        </div>
    )
}

export default Banner