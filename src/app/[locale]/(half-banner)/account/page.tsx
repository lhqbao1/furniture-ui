import AccountForm from '@/components/layout/account/account-form'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import React from 'react'

const AccountPage = async () => {
    return (
        <div className="space-y-6 lg:pb-12 pb-4">
            <div>
                <CustomBreadCrumb currentPage="Account" />
            </div>
            <div className='lg:px-30'>
                <AccountForm />
            </div>
        </div>
    )
}

export default AccountPage
