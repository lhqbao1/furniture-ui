'use client'
import React, { useState, useRef } from 'react'
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

interface ListPolicyProps {
    versionId: string
}

const ListPolicy = ({ versionId }: ListPolicyProps) => {
    const [currentPolicy, setCurrentPolicy] = useState(0)
    const [currentPolicyItem, setCurrentPolicyItem] = useState(0)

    const { data: policy, isLoading } = useQuery({
        queryKey: ["policy-items", versionId],
        queryFn: () => getPolicyItemsByVersion(versionId),
        enabled: !!versionId,
    })

    // refs cho content bên phải
    const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})

    if (isLoading) return <div className=''><Loader2 className='animate-spin' /></div>

    return (
        <div className='grid grid-cols-12 lg:pt-12 pt-3 h-[calc(100vh-200px)]'>
            {/* Sidebar bên trái */}
            <div className='col-span-4 border-r overflow-y-auto'>
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue="item-1"
                >
                    {policy?.legal_policies.map((item, policyIndex) => (
                        <AccordionItem value={item.id} key={item.id}>
                            <AccordionTrigger className='pr-6 cursor-pointer'>{item.name}</AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-1.5 text-balance">
                                {item.child_legal_policies.map((child, policyItemIndex) => (
                                    <div
                                        key={child.id}
                                        className={cn(
                                            'cursor-pointer hover:underline lg:pl-6 pl-2 relative',
                                            currentPolicy === policyIndex && currentPolicyItem === policyItemIndex
                                                ? 'bg-secondary/20 hover:bg-secondary-20 px-2 py-1 font-semibold'
                                                : ''
                                        )}
                                        onClick={() => {
                                            setCurrentPolicy(policyIndex)
                                            setCurrentPolicyItem(policyItemIndex)

                                            const refKey = `${policyIndex}-${policyItemIndex}`
                                            const el = contentRefs.current[refKey]
                                            if (el) {
                                                const parent = el.closest(".content-scroll") as HTMLElement // thêm class cho container scroll của bạn
                                                if (parent) {
                                                    const top = el.offsetTop - 250 // trừ 250
                                                    parent.scrollTo({
                                                        top,
                                                        behavior: "smooth",
                                                    })
                                                } else {
                                                    el.scrollIntoView({ behavior: "smooth", block: "start" })
                                                }
                                            }
                                        }}

                                    >
                                        {child.label}
                                        <div
                                            className={cn(
                                                'absolute w-1 h-full bg-secondary right-0 top-0',
                                                currentPolicy === policyIndex && currentPolicyItem === policyItemIndex
                                                    ? 'block'
                                                    : 'hidden'
                                            )}
                                        />
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            {/* Nội dung bên phải */}
            <div className='col-span-8 px-3 lg:px-12 space-y-6 pb-8 content-scroll overflow-y-auto'>
                <h1 className='text-center text-3xl text-secondary font-semibold uppercase'>
                    {policy?.legal_policies[currentPolicy].name}
                </h1>

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

                {policy?.legal_policies[currentPolicy].child_legal_policies.map((cl, clIndex) => {
                    const refKey = `${currentPolicy}-${clIndex}`
                    return (
                        <div
                            key={cl.id}
                            ref={(el) => {
                                contentRefs.current[refKey] = el
                            }}
                        >
                            <div className='text-xl text-secondary font-bold'>{cl.label ?? ''}</div>
                            {cl?.content ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: cl.content }}
                                />
                            ) : (
                                <p className="text-gray-500 italic">Updated...</p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ListPolicy
