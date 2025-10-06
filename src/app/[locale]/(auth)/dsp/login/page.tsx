import LoginForm from '@/components/layout/auth/login-form'
import SellerLoginForm from '@/components/layout/auth/seller-login-form'
import Image from 'next/image'
import React from 'react'

const SellerLoginPage = () => {
    return (
        <div className='grid grid-cols-12 w-screen h-screen'>
            <div className='lg:col-span-5 col-span-12 flex items-center justify-center'>
                <SellerLoginForm isAdmin />
            </div>
            <div className='lg:col-span-7 lg:block hidden relative'>
                <Image
                    src={'/login.webp'}
                    fill
                    alt=''
                    className='absolute w-full h-full object-cover top-0'
                />
            </div>
        </div>
    )
}

export default SellerLoginPage