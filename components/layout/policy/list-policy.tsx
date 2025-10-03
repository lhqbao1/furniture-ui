'use client'
import React, { useState, useRef, useEffect } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useQuery } from '@tanstack/react-query'
import { getPolicyItemsByVersion } from '@/features/policy/api'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PolicyVersion } from '@/types/policy'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from '@/src/i18n/navigation'
import { formatDate } from '@/lib/date-formated'
import { usePathname } from 'next/navigation'
import { useSmoothScrollToRef } from '@/hooks/scrollToRef'

interface ListPolicyProps {
    versionId: string;
    versionData: PolicyVersion[];
    policyId?: string;
    versionName?: string
    isAdmin?: boolean
}

const ListPolicy = ({ versionId, versionData, policyId, versionName, isAdmin = false }: ListPolicyProps) => {
    const t = useTranslations()
    const [openAccordion, setOpenAccordion] = useState<string>("")
    const [currentPolicyItem, setCurrentPolicyItem] = useState(0)
    const router = useRouter()
    const locale = useLocale()
    const [currentVersion, setCurrentVersion] = useState(versionId)
    const pathname = usePathname()
    const { scrollTo, registerRef, setContainer } = useSmoothScrollToRef<HTMLDivElement>()
    // Khi click vào item
    const handleClick = (key: string) => {
        scrollTo(key, -80) // scroll lên trên một chút để tránh bị che bởi header
    }

    const { data: policy, isLoading } = useQuery({
        queryKey: ["policy-items", currentVersion],
        queryFn: () => getPolicyItemsByVersion(currentVersion),
        enabled: !!currentVersion,
    })

    const filteredPolicies = policy?.legal_policies ?? []

    useEffect(() => {
        const path = pathname?.toLowerCase()

        const matchedItem = filteredPolicies.find((item) => {
            const name = item.name.toLowerCase()
            return (
                (path.includes("agb") && name.includes("agb")) ||
                (path.includes("impressum") && name.includes("impressum")) ||
                (path.includes("cancellation") && name.includes("widerruf")) ||
                (path.includes("privacy-policy") && name.includes("datenschutzer"))
            )
        })

        if (matchedItem) {
            setOpenAccordion(matchedItem.id)
            // setCurrentPolicyItem(0)
        }
    }, [pathname, filteredPolicies])

    // tìm current policy dựa trên accordion đang mở
    const currentPolicy = filteredPolicies.find(p => p.id === openAccordion) || filteredPolicies[0]

    if (isLoading) return <div className=''><Loader2 className='animate-spin' /></div>
    if (!versionId) return <></>

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
                            >
                                <AccordionTrigger
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()

                                        if (isAdmin) {
                                            setOpenAccordion(item.id)
                                        } else {
                                            setTimeout(() => {
                                                switch (true) {
                                                    case item.name.toLowerCase().includes("agb"):
                                                        router.push("/agb", { locale })
                                                        break

                                                    case item.name.toLowerCase().includes("impressum"):
                                                        router.push("/impressum", { locale })
                                                        break

                                                    case item.name.toLowerCase().includes("widerruf"):
                                                        router.push("/cancellation", { locale })
                                                        break

                                                    case item.name.toLowerCase().includes("datenschutzer"):
                                                        router.push("/privacy-policy", { locale })
                                                        break

                                                    default:
                                                        router.push("/agb", { locale })
                                                }
                                            }, 150)
                                        }
                                    }}
                                >
                                    <div className='pr-6 cursor-pointer font-bold'>{item.name}</div>
                                </AccordionTrigger>
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
                                                // delay 1 tick để đảm bảo DOM ổn định rồi mới scroll
                                                setTimeout(() => {
                                                    scrollTo(`${item.id}-${policyItemIndex}`, -80)
                                                }, 200)
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
            <div
                // ref={setContainer}
                className='w-full lg:w-2/3 px-3 lg:px-12 space-y-6 lg:pb-8 pb-3 overflow-x-hidden content-scroll min-h-screen flex-1 max-h-full overflow-y-auto'>
                <h1 className='text-center lg:text-3xl text-2xl text-secondary font-semibold uppercase text-wrap'>
                    {currentPolicy?.name}
                </h1>

                {currentPolicy?.child_legal_policies.map((cl, clIndex) => {
                    // const refKey = `${cl.id}-${clIndex}`
                    return (
                        <div
                            key={cl.id}
                            ref={(el) => registerRef(`${currentPolicy.id}-${clIndex}`, el)}
                        >
                            <div className='text-xl text-secondary font-bold'>{cl.label ?? ''}</div>
                            {typeof cl?.content === 'string' && cl.content.trim() !== '' ? (
                                <div dangerouslySetInnerHTML={{ __html: cl.content }} />
                            ) : (
                                <p className="text-gray-500 italic">Updated...</p>
                            )}
                        </div>
                    )
                })}

                <div className='lg:mt-12 mt-6'>
                    {currentPolicy.name.toLowerCase().includes("widerruf") && <div className='flex justify-center col-span-12'> <Button variant={'outline'} className='border border-black rounded-sm'> <a href="/file/widderuf.pdf" download className="cursor-pointer flex gap-1 items-center"> {t('download')} <Image src={'/pdf.png'} width={15} height={15} alt='' unoptimized /> </a> </Button> </div>}
                    {currentPolicy.name.toLowerCase().includes("agb") && <div className='flex justify-center col-span-12'> <Button variant={'outline'} className='border border-black rounded-sm'> <a href="/file/ABG2.pdf" download className="cursor-pointer flex gap-1 items-center"> {t('download')} <Image src={'/pdf.png'} width={15} height={15} alt='' unoptimized /> </a> </Button> </div>}
                </div>

                {/* Version section */}
                <div className='flex flex-col items-end col-span-12 lg:mt-12 mt-4 mb-3 lg:mb-0'>
                    <div className={`text-secondary cursor-pointer ${versionData[0].id === currentVersion ? 'font-bold' : ''}`} onClick={() => setCurrentVersion(versionData[0].id)}>Stand: {formatDate(versionData[0].created_at)}</div>
                </div>
            </div>
        </div>
    )
}

export default ListPolicy


