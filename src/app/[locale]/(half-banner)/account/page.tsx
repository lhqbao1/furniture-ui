import AccountForm from '@/components/layout/account/account-form'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import React from 'react'

const AccountPage = async () => {
    return (
        <div className="space-y-6">
            <div>
                <CustomBreadCrumb currentPage="Account" />
            </div>
            <AccountForm />
        </div>
    )
}

export default AccountPage
