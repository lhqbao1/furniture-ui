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

interface BannerProps {
    height?: number
}

// home-banner bg-[url("/banner.jpg")] bg-no-repeat xl:bg-center bg-top xl:bg-cover bg-contain

const Banner = ({ height }: BannerProps) => {
    const isPhone = useMediaQuery({ maxWidth: 430 })
    const [user, setUser] = useState<{ username: string } | null>(null)

    return (
        <div
            className={cn('relative',
                height ? `overflow-hidden` : ''
            )}
            style={{ height: height ? height : 500 }}
        >
            <Image
                src='/banner.jpg'
                fill
                alt=''
                className='absolute top-0 z-0'
            />

            <SidebarTrigger className='absolute border-none text-primary bg-white xl:top-2 xl:left-2 top-4 left-3 cursor-pointer z-20' isMobile={isPhone ? true : false} />
            <div className='home-banner__content h-full flex flex-col relative z-10'>
                <div className='home-banner-top__content flex flex-col items-end'>
                    <div className='flex flex-0 items-center xl:justify-end gap-4 pt-4 pr-4'>
                        <Select>
                            <SelectTrigger className="w-[150px] text-white font-bold text-lg xl:border-0 border-2 border-white">
                                <SelectValue placeholder="German" className='text-white' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="German" className='font-semibold '>German</SelectItem>
                                <SelectItem value="English" className='font-semibold '>English</SelectItem>
                            </SelectContent>
                        </Select>
                        <Link href={'/cart'} className='flex flex-row relative cursor-pointer'>
                            <ShoppingCart stroke='white' className='hover:scale-110 transition-all duration-300' />
                            <div className="absolute bg-primary w-6 h-6 flex items-center justify-center rounded-full text-white text-sm -top-3 -right-3">
                                2
                            </div>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <User className="cursor-pointer" stroke='white' />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">
                                {!user ? (
                                    <Link href={'/login'} className='cursor-pointer'>
                                        <DropdownMenuItem className='cursor-pointer'>
                                            Đăng nhập
                                        </DropdownMenuItem>
                                    </Link>
                                ) : (
                                    <>
                                        <DropdownMenuLabel>Xin chào, {user.username}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => alert("Đi tới thông tin tài khoản")}>
                                            Thông tin tài khoản
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setUser(null)}>
                                            Đăng xuất
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-2 relative pt-6">
                    <div className={cn('xl:w-1/2 w-3/4 relative flex',
                        height ? 'mr-0' : 'xl:mr-56'
                    )}>
                        <BannerInput type="email" placeholder="" className='w-full xl:h-12 h-10' />
                        <Button type="submit" variant="default" className='absolute right-0 rounded-full bg-primary text-white xl:text-lg text-sm px-0 pl-1 xl:pr-12 xl:h-12 pr-4 h-10'>
                            <Mic stroke='white' size={24} className='xl:bg-secondary xl:size-3 size-5 xl:h-11 xl:w-11 rounded-full' />
                            Search
                        </Button>
                        <Search size={24} className='absolute left-3 xl:top-3 top-2' stroke='gray' />
                    </div>
                </div>

                {/* Phần title căn giữa theo chiều cao */}
                {height ? '' :
                    <div className="flex-1 flex flex-col justify-center items-center gap-6 xl:mt-12 mt-0 xl:px-0 px-4">
                        <h1 className="home-banner__title font-bold leading-tight flex xl:flex-row flex-col justify-center items-center xl:gap-4 gap-1">
                            <span className="text-secondary text-4xl lg:text-6xl">
                                WELCOME TO
                            </span>
                            <span className="text-primary text-4xl lg:text-6xl">
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