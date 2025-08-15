'use client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Mic, Search, ShoppingCart, User } from 'lucide-react'
import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { BannerInput } from '@/components/shared/banner-input'

const Banner = () => {
    return (
        <div className='home-banner bg-[url("/banner.jpg")] h-[500px] bg-no-repeat bg-center bg-cover'>
            <SidebarTrigger className='absolute' />
            <div className='home-banner__content h-full flex flex-col'>
                <div className='home-banner-top__content flex flex-col items-end'>
                    <div className='flex flex-0 items-center justify-end gap-4 pt-4 pr-4'>
                        <Select>
                            <SelectTrigger className="w-[150px] text-white">
                                <SelectValue placeholder="German" className='text-white' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="German" className='font-semibold '>German</SelectItem>
                                <SelectItem value="English" className='font-semibold '>English</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className='flex flex-row relative'>
                            <ShoppingCart stroke='white' />
                            <div className="absolute bg-primary w-6 h-6 flex items-center justify-center rounded-full text-white text-sm -top-3 -right-3">
                                2
                            </div>
                        </div>
                        <User stroke='white' />
                    </div>
                </div>

                <div className="flex justify-center items-center gap-2 relative pt-6">
                    <div className='w-1/2 relative flex xl:mr-56'>
                        <BannerInput type="email" placeholder="" className='w-full h-12' />
                        <Button type="submit" variant="default" className='absolute right-0 rounded-full bg-primary text-white text-lg px-0 pl-1 pr-12 h-12'>
                            <Mic stroke='white' size={24} className='bg-secondary size-3 h-11 w-11 rounded-full' />
                            Search
                        </Button>
                        <Search size={24} className='absolute left-3 top-3' stroke='gray' />
                    </div>
                </div>

                {/* Phần title căn giữa theo chiều cao */}
                <div className="flex-1 flex flex-col justify-center items-center gap-6">
                    <h1 className="home-banner__title font-bold leading-tight flex flex-row justify-center items-center gap-4">
                        <span className="text-secondary text-2xl sm:text-3xl md:text-4xl lg:text-6xl">
                            WELCOME TO
                        </span>
                        <span className="text-primary text-2xl sm:text-3xl md:text-4xl lg:text-6xl">
                            PRESTIGE HOME
                        </span>
                    </h1>
                    <span className='text-white text-3xl font-medium'>THE PLACE YOU CAN FIND UNIQUE AND TRENDY PRODUCTS</span>
                </div>

                {/* <div className="grid grid-cols-2 md:grid-cols-4 w-full bg-amber-50/90">
                    <div className="flex items-center justify-center gap-2 p-4">
                        <Headset className="w-6 h-6 text-primary" />
                        <span className="text-sm font-medium text-gray-800">24/7 Support Always Be There For You</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 p-4">
                        <CircleDollarSign className="w-6 h-6 text-primary" />
                        <span className="text-sm font-medium text-gray-800">Lower Prices Than Other Stores</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 p-4">
                        <Truck className="w-6 h-6 text-primary" />
                        <span className="text-sm font-medium text-gray-800">Free Delivery From 30$</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 p-4">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <span className="text-sm font-medium text-gray-800">Best Quality Furniture</span>
                    </div>
                </div> */}
            </div>


        </div>
    )
}

export default Banner