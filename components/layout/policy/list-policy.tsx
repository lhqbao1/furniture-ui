'use client'
import React, { useState, useRef, useEffect } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
} from "@/components/ui/accordion"
import { useQuery } from '@tanstack/react-query'
import { getPolicyItemsByVersion } from '@/features/policy/api'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PolicyVersion } from '@/types/policy'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from '@/src/i18n/navigation'
import { formatDate } from '@/lib/date-formated'

interface ListPolicyProps {
    versionId: string;
    versionData: PolicyVersion[];
    policyId?: string;
    versionName?: string
    isAdmin?: boolean
}

const ListPolicy = ({ versionId, versionData, policyId, versionName, isAdmin = false }: ListPolicyProps) => {
    const t = useTranslations()
    const [openAccordion, setOpenAccordion] = useState<string | null>(null)
    const [currentPolicyItem, setCurrentPolicyItem] = useState(0)
    const router = useRouter()
    const [currentVersion, setCurrentVersion] = useState(versionId)

    const { data: policy, isLoading } = useQuery({
        queryKey: ["policy-items", currentVersion],
        queryFn: () => getPolicyItemsByVersion(currentVersion),
        enabled: !!currentVersion,
    })

    const filteredPolicies = policy?.legal_policies ?? []

    // refs cho content bên phải
    const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})

    // khi policyId thay đổi, set accordion mở
    useEffect(() => {
        if (policyId) {
            const exists = filteredPolicies.find(p => p.id === policyId)
            if (exists) {
                setOpenAccordion(policyId)
                const index = filteredPolicies.indexOf(exists)
                setCurrentPolicyItem(0)
            }
        }
    }, [policyId, filteredPolicies])

    if (isLoading) return <div className=''><Loader2 className='animate-spin' /></div>
    if (!versionId) return <></>

    // tìm current policy dựa trên accordion đang mở
    const currentPolicy = filteredPolicies.find(p => p.id === openAccordion) || filteredPolicies[0]

    return (
        <div className="flex lg:pt-12 pt-3 pb-4 gap-6">
            {/* Sidebar bên trái */}
            <div className="hidden lg:block w-1/3 border-r sticky top-10">
                <div className="sticky top-30 max-h-[calc(100vh-2.5rem)] overflow-y-auto">
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                        value={openAccordion ?? undefined}
                        onValueChange={(val) => setOpenAccordion(val)}
                    >
                        {filteredPolicies.map((item) => (
                            <AccordionItem
                                value={item.id}
                                key={item.id}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (isAdmin) {
                                        setOpenAccordion(item.id)
                                    } else {
                                        setTimeout(() => {
                                            switch (item.id) {
                                                case '19aa3344-f577-41e6-acbd-f0fe8ea92ce5':
                                                    router.push('/agb')
                                                    break
                                                case '9fc87bb9-44d2-428d-9960-1b6074e11d76':
                                                    router.push('/impressum')
                                                    break
                                                case '9fc87bb9-44d2-428d-9960-1b6074e11d75':
                                                    router.push('/widerruf')
                                                    break
                                                case '808a37bc-2ead-4a90-8a24-73a431df55d0':
                                                    router.push('/datenschutzerklarung')
                                                    break
                                                default:
                                                    router.push('/agb')
                                            }
                                        }, 150)
                                    }
                                }}
                            >
                                <div className='pr-6 px-2 py-3 cursor-pointer font-bold'>{item.name}</div>
                                <AccordionContent className="flex flex-col gap-1.5 text-balance">
                                    {item.child_legal_policies.map((child, policyItemIndex) => (
                                        <div
                                            key={child.id}
                                            className={cn(
                                                'cursor-pointer hover:underline lg:pl-6 pl-2 relative',
                                                currentPolicy?.id === item.id && currentPolicyItem === policyItemIndex
                                                    ? 'bg-secondary/20 hover:bg-secondary-20 px-2 py-1 font-semibold'
                                                    : ''
                                            )}
                                            onClick={() => {
                                                setCurrentPolicyItem(policyItemIndex)

                                                const refKey = `${item.id}-${policyItemIndex}`
                                                const el = contentRefs.current[refKey]
                                                if (el) {
                                                    const parent = el.closest(".content-scroll") as HTMLElement
                                                    if (parent) {
                                                        const top = el.offsetTop - 330
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
                                                    currentPolicy?.id === item.id && currentPolicyItem === policyItemIndex
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
            </div>

            {/* Nội dung bên phải */}
            <div className='w-full lg:w-2/3 px-3 lg:px-12 space-y-6 lg:pb-8 pb-3 overflow-x-hidden'>
                <h1 className='text-center lg:text-3xl text-2xl text-secondary font-semibold uppercase text-wrap'>
                    {currentPolicy?.name}
                </h1>

                {currentPolicy?.child_legal_policies.map((cl, clIndex) => {
                    const refKey = `${currentPolicy.id}-${clIndex}`
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

                <div className='lg:mt-12 mt-6'>
                    {policyId === "9fc87bb9-44d2-428d-9960-1b6074e11d75" && <div className='flex justify-center col-span-12'> <Button variant={'outline'} className='border border-black rounded-sm'> <a href="/file/widderuf.pdf" download className="cursor-pointer flex gap-1 items-center"> {t('download')} <Image src={'/pdf.png'} width={15} height={15} alt='' unoptimized /> </a> </Button> </div>}
                    {policyId === "19aa3344-f577-41e6-acbd-f0fe8ea92ce5" && <div className='flex justify-center col-span-12'> <Button variant={'outline'} className='border border-black rounded-sm'> <a href="/file/ABG2.pdf" download className="cursor-pointer flex gap-1 items-center"> {t('download')} <Image src={'/pdf.png'} width={15} height={15} alt='' unoptimized /> </a> </Button> </div>}
                </div>

                {/* Version section */}
                <div className='flex flex-col items-end col-span-12 lg:mt-12 mt-4 mb-3 lg:mb-0'>
                    {versionData.map((item) => (
                        <div key={item.id} className={`text-secondary cursor-pointer ${item.id === currentVersion ? 'font-bold' : ''}`} onClick={() => setCurrentVersion(item.id)}>Stand: {formatDate(item.created_at)}</div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ListPolicy