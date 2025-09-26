'use client'
import ListPolicyAdmin from '@/components/layout/admin/policy/list-policy'
import PolicyListVersion from '@/components/layout/admin/policy/list-version'
import { Button } from '@/components/ui/button'
import { useGetPolicyVersion } from '@/features/policy/hook'
import React, { useState } from 'react'

const PolicyPage = () => {
    const [currentVersion, setCurrentVersion] = useState<string>()
    const { data, isLoading, isError } = useGetPolicyVersion()

    return (
        <div className='space-y-6'>
            <PolicyListVersion setCurrentVersion={setCurrentVersion} currentVersion={currentVersion ?? ''} />
            {!data || isLoading ? '' :
                (<ListPolicyAdmin versionData={data} versionId={currentVersion ?? ''} />)
            }
        </div>
    )
}

export default PolicyPage