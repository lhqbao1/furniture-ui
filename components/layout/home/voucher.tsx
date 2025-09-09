import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import React from 'react'

const Voucher = () => {
    return (
        <div className='lg:mt-16 mt-24 grid xl:grid-cols-2 grid-cols-1 xl:gap-4 gap-2 w-full section-padding'>
            <div className='lg:h-[300px] h-[200px] relative rounded-2xl'>
                <Image
                    src={'/voucher-banner-1.jpg'}
                    width={400}
                    height={200}
                    alt=''
                    className='h-full w-full object-fill rounded-2xl absolute top-0 z-0'
                />
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-l from-white/10 to-black/20'></div>
            </div>
            <div className='lg:h-[300px] h-[200px] relative rounded-2xl'>
                <Image
                    src={'/voucher-banner-2.jpg'}
                    width={400}
                    height={200}
                    alt=''
                    className='h-full w-full object-fill rounded-2xl absolute top-0 z-0'
                />
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-black/20'></div>
            </div>
        </div>
    )
}

export default Voucher