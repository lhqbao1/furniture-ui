import { Button } from '@/components/ui/button'
import { getPolicyVersion } from '@/features/policy/api'
import { useGetPolicyVersion } from '@/features/policy/hook'
import React from 'react'

interface PolicyListVersionProps {
    currentVersion: string
    setCurrentVersion: (currentVersion: string) => void
}

const PolicyListVersion = ({ setCurrentVersion, currentVersion }: PolicyListVersionProps) => {
    const { data: listPolicyVersion, isLoading, isError } = useGetPolicyVersion()

    if (!listPolicyVersion || isLoading) return <>Loading...</>

    return (
        <div className='flex gap-3 items-center'>
            <h3 className='text-xl'>List Version:</h3>
            {listPolicyVersion.map((item, index) => {
                return (
                    <Button variant={'outline'} key={index} className={`p-4 border-2 rounded-xl text-xl ${currentVersion === item.id ? 'border-primary' : ''}`} onClick={() => setCurrentVersion(item.id)}>
                        {item.name}
                    </Button>
                )
            })}
        </div>
    )
}

export default PolicyListVersion