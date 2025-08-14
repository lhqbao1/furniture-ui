import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import React from 'react'

const Voucher = () => {
    return (
        <div className='container-padding mt-12 grid xl:grid-cols-2 grid-cols-1 xl:gap-4 gap-2 w-full'>
            <div className='h-[300px] relative rounded-2xl'>
                <Image
                    src={'/voucher-banner-1.jpg'}
                    width={400}
                    height={200}
                    alt=''
                    className='h-full w-full object-fill rounded-2xl absolute top-0 z-0'
                />
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-l from-white/10 to-black/20'></div>

                <div className='z-10 relative xl:p-9 p-6 flex flex-col gap-3  w-fit rounded-2xl' >
                    <div>
                        <h3 className='text-white font-bold xl:text-3xl text-lg text-shadow-2xs'>Save Up To 25%</h3>
                        <h3 className='text-white font-bold xl:text-3xl text-lg '>With Promo Code</h3>
                    </div>

                    <div className='flex flex-row gap-3 items-center'>
                        <p className='text-white text-sm font-bold'>Promo Code:</p>
                        <Badge
                            variant="secondary"
                            className="bg-red-500 text-white dark:bg-red-600"
                        >
                            ABCDEF123
                        </Badge>
                    </div>
                    <p className='text-xs text-gray-800'>*Not combined with promotional offers and discounts</p>
                </div>
            </div>
            <div className='h-[300px] relative rounded-2xl'>
                <Image
                    src={'/voucher-banner-2.jpg'}
                    width={400}
                    height={200}
                    alt=''
                    className='h-full w-full object-fill rounded-2xl absolute top-0 z-0'
                />
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-black/20'></div>

                <div className='z-10 relative xl:p-9 p-6 flex flex-col gap-3 items-end' >
                    <div>
                        <h3 className='text-white font-bold xl:text-3xl text-lg text-shadow-2xs'>Save Up To 25%</h3>
                        <h3 className='text-white font-bold xl:text-3xl text-lg '>With Promo Code</h3>
                    </div>

                    <div className='flex flex-row gap-3 items-center'>
                        <p className='text-white text-sm font-bold'>Promo Code:</p>
                        <Badge
                            variant="secondary"
                            className="bg-red-500 text-white dark:bg-red-600"
                        >
                            ABCDEF123
                        </Badge>
                    </div>
                    <p className='text-xs text-gray-800'>*Not combined with promotional offers and discounts</p>
                </div>
            </div>
        </div>
    )
}

export default Voucher