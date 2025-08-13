import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import React from 'react'

const Voucher = () => {
    return (
        <div className='container-padding grid xl:grid-cols-2 grid-cols-1 xl:gap-4 gap-2 w-full'>
            <div className='h-[250px] relative'>
                <Image
                    src={'/voucher-banner.jpg'}
                    width={400}
                    height={200}
                    alt=''
                    className='h-full w-full object-fill rounded-2xl absolute top-0 z-0'
                />
                <div className='z-10 relative xl:p-9 p-6 flex flex-col gap-3'>
                    <div>
                        <h3 className='text-white font-bold xl:text-3xl text-lg '>Save Up To 25%</h3>
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
                    <p className='text-xs text-gray-400'>*Not combined with promotional offers and discounts</p>
                </div>
            </div>
            <div className='h-[250px] relative'>
                <Image
                    src={'/voucher-banner.jpg'}
                    width={400}
                    height={200}
                    alt=''
                    className='h-full w-full object-fill rounded-2xl absolute top-0 z-0'
                />
                <div className='z-10 relative xl:p-9 p-6 flex flex-col gap-3'>
                    <div>
                        <h3 className='text-white font-bold xl:text-3xl text-lg '>Save Up To 25%</h3>
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
                    <p className='text-xs text-gray-400'>*Not combined with promotional offers and discounts</p>
                </div>
            </div>
        </div>
    )
}

export default Voucher