'use client'
import AccountAvatar from '@/components/layout/account/avatar'
import AccountDetails from '@/components/layout/account/details'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

const AccountPage = () => {
    return (
        <div className='space-y-6'>
            <div className=''>
                <CustomBreadCrumb currentPage='Account' />
            </div>
            <div className='grid grid-cols-12 gap-4 lg:gap-12 py-2 lg:py-6'>
                <AccountAvatar />
                <div className='col-span-12 lg:col-span-8'>
                    <AccountDetails />
                </div>
            </div>
        </div>
    )
}

export default AccountPage