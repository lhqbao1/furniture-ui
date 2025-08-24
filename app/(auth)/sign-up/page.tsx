import SignUpForm from '@/components/layout/auth/signup-form'
import Image from 'next/image'
import React from 'react'

const SignUpPage = () => {
    return (
        <div className='grid grid-cols-12 w-screen h-screen'>
            <div className='lg:col-span-7 lg:block hidden relative'>
                <Image
                    src={'/login.webp'}
                    fill
                    alt=''
                    className='absolute w-full h-full object-cover top-0'
                />
            </div>
            <div className='lg:col-span-5 col-span-12 flex lg:items-center items-start justify-center'>
                <SignUpForm />
            </div>
        </div>
    )
}

export default SignUpPage