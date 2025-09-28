'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { useQuery, useMutation } from '@tanstack/react-query'
import { createVersion, getPolicyItemsByVersion } from '@/features/policy/api'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChildLegalPolicy, PolicyVersion } from '@/types/policy'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { formatDate } from '@/lib/date-formated'
import RichTextEditor from '@/components/shared/editor'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useCreateChildLegalPolicy, useCreateLegalPolicy, useCreateVersion } from '@/features/policy/hook'
import { toast } from 'sonner'
import RichEditor from '@/components/shared/tiptap/tiptap-editor'


interface ListPolicyAdminProps {
    versionId: string;
    versionData: PolicyVersion[];
    policyId?: string;
    versionName?: string
    isAdmin?: boolean
}

const ListPolicyAdmin = ({ versionId, versionData, policyId, versionName, isAdmin = false }: ListPolicyAdminProps) => {
    const t = useTranslations()
    const [openAccordion, setOpenAccordion] = useState<string | null>(null)
    const [currentPolicyItem, setCurrentPolicyItem] = useState(0)
    const [openDialog, setOpenDialog] = useState(false)
    const [versionNameInput, setVersionNameInput] = useState("")

    const { data: policy, isLoading } = useQuery({
        queryKey: ["policy-items", versionId],
        queryFn: () => getPolicyItemsByVersion(versionId),
        enabled: !!versionId,
    })

    const createVersionMutation = useCreateVersion()
    const createLegalPolicyMutation = useCreateLegalPolicy()
    const createChildLegalPolicyMutation = useCreateChildLegalPolicy()

    const filteredPolicies = policy?.legal_policies ?? []
    const currentPolicy = filteredPolicies.find(p => p.id === openAccordion) || filteredPolicies[0]

    const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})

    const [policies, setPolicies] = useState<Record<string, Record<string, { label: string; content: string }>>>({})

    useEffect(() => {
        if (filteredPolicies.length > 0) {
            const initial: Record<string, Record<string, { label: string; content: string }>> = {}
            filteredPolicies.forEach(lp => {
                const children: Record<string, { label: string; content: string }> = {}
                lp.child_legal_policies.forEach((cl: ChildLegalPolicy) => {
                    children[cl.id] = {
                        label: cl.label || "",
                        content: cl.content || ""
                    }
                })
                initial[lp.id] = children
            })
            setPolicies(initial)
        }
    }, [filteredPolicies])

    const handleLabelChange = (policyId: string, childId: string, newLabel: string) => {
        setPolicies(prev => ({
            ...prev,
            [policyId]: {
                ...prev[policyId],
                [childId]: { ...prev[policyId]?.[childId], label: newLabel }
            }
        }))
    }

    const handleContentChange = (policyId: string, childId: string, newContent: string) => {
        setPolicies(prev => ({
            ...prev,
            [policyId]: {
                ...prev[policyId],
                [childId]: { ...prev[policyId]?.[childId], content: newContent }
            }
        }))
    }

    const handleSaveClick = () => {
        setOpenDialog(true)
    }

    const handleSubmitVersion = async () => {
        if (!versionNameInput) return

        try {
            const versionRes = await createVersionMutation.mutateAsync(versionNameInput)

            // Sau khi tạo version thành công → tạo lần lượt các legal policy
            for (const lp of filteredPolicies) {
                try {
                    const legalPolicyRes = await createLegalPolicyMutation.mutateAsync({
                        name: lp.name,
                        version_id: versionRes.id, // lấy id từ version vừa tạo
                    })

                    // sau khi tạo legal policy xong → tạo child legal policies
                    const childInputs = lp.child_legal_policies.map(cl => ({
                        label: policies[lp.id]?.[cl.id]?.label || cl.label,
                        content: policies[lp.id]?.[cl.id]?.content || cl.content,
                    }))

                    await createChildLegalPolicyMutation.mutateAsync({
                        input: childInputs,
                        legal_policy_id: legalPolicyRes.id,
                    })

                } catch (err) {
                    console.error("Lỗi khi tạo legal policy hoặc child:", err)
                }
            }

            setOpenDialog(false)
            setVersionNameInput('')
            toast.success("Create new policy version successful")

        } catch (err) {
            console.error("Lỗi khi tạo version:", err)
        }
    }

    if (isLoading) return <div className=''><Loader2 className='animate-spin' /></div>
    if (!versionId) return <></>

    return (
        <div className='grid grid-cols-12 pt-3 lg:h-[calc(100vh-100px)] h-fit pb-4'>
            <div className='space-x-2 col-span-12 mb-12'>
                <Button className='text-xl' onClick={handleSaveClick}>Save</Button>
                <Button className='text-xl' variant={'outline'}>Cancel</Button>
            </div>

            {/* Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className='w-[400px]'>
                    <DialogHeader>
                        <DialogTitle>Enter Version Name</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={versionNameInput}
                        onChange={(e) => setVersionNameInput(e.target.value)}
                        placeholder="Enter version name..."
                    />
                    <DialogFooter>
                        <Button
                            onClick={handleSubmitVersion}
                            disabled={createVersionMutation.isPending}
                        >
                            {createVersionMutation.isPending || createLegalPolicyMutation.isPending || createChildLegalPolicyMutation.isPending ? <Loader2 className='animate-spin' /> : "Submit"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sidebar */}
            <div className='col-span-4 border-r overflow-y-auto lg:block hidden'>
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
                                setOpenAccordion(item.id)
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
                                                ? 'bg-secondary/20 px-2 py-1 font-semibold'
                                                : ''
                                        )}
                                        onClick={() => {
                                            setCurrentPolicyItem(policyItemIndex)
                                            const refKey = `${item.id}-${policyItemIndex}`
                                            const el = contentRefs.current[refKey]
                                            if (el) {
                                                el.scrollIntoView({ behavior: "smooth", block: "start" })
                                            }
                                        }}
                                    >
                                        {policies[item.id]?.[child.id]?.label || child.label}
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            {/* Nội dung bên phải */}
            <div className='lg:col-span-8 col-span-12 px-3 lg:px-12 space-y-6 lg:pb-8 pb-3 overflow-x-hidden content-scroll lg:overflow-y-auto'>
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
                            <Input
                                type="text"
                                value={policies[currentPolicy.id]?.[cl.id]?.label || ""}
                                onChange={(e) => handleLabelChange(currentPolicy.id, cl.id, e.target.value)}
                                className="w-full text-xl text-secondary font-bold border rounded px-2 py-1 mb-2"
                            />

                            <RichEditor
                                value={policies[currentPolicy.id]?.[cl.id]?.content || ""}
                                onChangeValue={(val) => handleContentChange(currentPolicy.id, cl.id, val)}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ListPolicyAdmin
