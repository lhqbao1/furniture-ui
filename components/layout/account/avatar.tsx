'use client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

const AccountAvatar = () => {
    return (
        <div className='col-span-12 lg:col-span-4 flex flex-col justify-start items-center gap-4'>
            <Image
                src={'/people.webp'}
                height={150}
                width={150}
                alt=''
                className='rounded-xl'
            />
            <div className='flex gap-3'>
                <Button variant={'secondary'} >Change</Button>
                <Button variant={'secondary'}>Remove</Button>
            </div>
            <span className='text-sm text-gray-500'>allowed JPG, PNG. Max 2M</span>
        </div>
    )
}

export default AccountAvatar