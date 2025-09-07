'use client'
import React, { useState } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useQuery } from '@tanstack/react-query'
import { getPolicyItemsByVersion } from '@/features/policy/api'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PolicyResponse } from '@/types/policy'

interface ListPolicyProps {
    versionId: string
    initialData: PolicyResponse
}

const ListPolicy = ({ versionId, initialData }: ListPolicyProps) => {
    const [currentPolicy, setCurrentPolicy] = useState(0)
    const [currentPolicyItem, setCurrentPolicyItem] = useState(0)

    const { data: policy, isLoading, isError } = useQuery({
        queryKey: ["policy-items", versionId],
        queryFn: () => getPolicyItemsByVersion(versionId),
        enabled: !!versionId,
        initialData
    })

    if (isLoading) return <div className=''><Loader2 className='animate-spin' /></div>

    return (
        <div className='grid grid-cols-12 lg:pt-12 pt-3 h-full min-h-screen'>
            <div className='col-span-4 border-r'>
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue="item-1"
                >
                    {policy?.legal_policies.map((item, policyIndex) => {
                        return (
                            <AccordionItem value={item.id} key={item.id}>
                                <AccordionTrigger className='pr-6 cursor-pointer'>{item.name}</AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-1.5 text-balance">
                                    {item.child_legal_policies.map((child, policyItemIndex) => {
                                        return (
                                            <div key={child.id} className={cn('cursor-pointer hover:underline lg:pl-6 pl-2 relative',
                                                currentPolicy === policyIndex && currentPolicyItem === policyItemIndex ? 'bg-secondary/20 hover:bg-secondary-20 px-2 py-1 font-semibold' : ''
                                            )}>
                                                <div onClick={() => {
                                                    setCurrentPolicy(policyIndex)
                                                    setCurrentPolicyItem(policyItemIndex)
                                                }}>
                                                    {policyItemIndex + 1}. {child.label}
                                                </div>
                                                <div className={cn('absolute w-1 h-full bg-secondary right-0 top-0',
                                                    currentPolicy === policyIndex && currentPolicyItem === policyItemIndex ? 'block' : 'hidden'
                                                )}></div>
                                            </div>
                                        )
                                    })}
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </div>
            <div className='col-span-8 px-3 lg:px-12 space-y-6 pb-8'>
                <h1 className='text-center text-3xl text-secondary font-semibold uppercase'>{policy?.legal_policies[currentPolicy].name}</h1>
                <div className='flex justify-between'>
                    <Button variant={'secondary'}>
                        <div className='flex items-center gap-2'>
                            <ArrowLeft />
                            <p>Previous</p>
                        </div>
                    </Button>
                    <Button variant={'secondary'}>
                        <div className='flex items-center gap-2'>
                            <p>Next</p>
                            <ArrowRight />
                        </div>
                    </Button>
                </div>
                <div dangerouslySetInnerHTML={{ __html: policy?.legal_policies[currentPolicy].child_legal_policies[currentPolicyItem].content ?? '' }}></div>
            </div >
        </div >

    )
}

export default ListPolicy