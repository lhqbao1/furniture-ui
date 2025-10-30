import AccountForm from '@/components/layout/account/account-form'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import { useTranslations } from 'next-intl'
import React from 'react'

const AccountPage = () => {
    const t = useTranslations()
    return (
        <div className="space-y-6 lg:pb-12 pb-4">
            <div>
                <CustomBreadCrumb currentPage={t('account')} />
            </div>
            <div className='lg:px-30'>
                <AccountForm />
            </div>
        </div>
    )
}

export default AccountPage
