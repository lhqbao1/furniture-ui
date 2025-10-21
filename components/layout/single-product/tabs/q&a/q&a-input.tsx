"use client"

import { z } from "zod"
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, SendHorizonal } from "lucide-react"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { getMe } from "@/features/auth/api"
import { useCreateQA, useGetQAByProduct } from "@/features/qa/hook"
import { formatDateTime } from "@/lib/date-formated"
import { QAFormValues } from "@/lib/schema/qa"
import { toast } from "sonner"

interface QAInputProps {
    productId: string
}

const QAInput = ({ productId }: QAInputProps) => {
    const t = useTranslations()
    const postQAMutation = useCreateQA()

    // ❗ Lưu text của từng textarea theo key
    const [qaInputs, setQaInputs] = React.useState<Record<string, string>>({})

    // ❗ Quản lý trạng thái show/ẩn ô reply
    const [showReply, setShowReply] = React.useState<Record<string, boolean>>({})

    const [userId, setUserId] = React.useState<string | null>(
        typeof window !== "undefined" ? localStorage.getItem("userId") : null
    );

    const { data: user } = useQuery({
        queryKey: ["me", userId],
        queryFn: () => getMe(),
        enabled: !!userId,
        retry: false,
    });

    const { data: listQA, isLoading } = useGetQAByProduct(productId)

    const handleSendQa = (parent_id?: string, key?: string) => {
        const idKey = key || parent_id || "root"
        const comment = qaInputs[idKey] || ""
        if (!comment.trim()) return

        const payload: QAFormValues = {
            comment,
            product_id: productId,
        }

        if (parent_id) payload.parent_id = parent_id

        postQAMutation.mutate(payload, {
            onSuccess: () => {
                toast.success(t("QAsuccess")) // ✅ message theo ngôn ngữ hiện tại
                setQaInputs((prev) => ({ ...prev, [idKey]: "" }))
                if (parent_id) {
                    setShowReply((prev) => ({ ...prev, [idKey]: false }))
                }
            },
            onError: (error) => {
                console.error(error)
                toast.error(t("QAerror"))
            },
        })

        setQaInputs((prev) => ({ ...prev, [idKey]: "" }))
        if (parent_id) setShowReply((prev) => ({ ...prev, [idKey]: false }))
    }


    const handleInputChange = (key: string, value: string) => {
        setQaInputs((prev) => ({ ...prev, [key]: value }))
    }

    const toggleReply = (key: string) => {
        setShowReply((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="space-y-14">
            {/* Ô nhập câu hỏi chính */}
            <div>
                {user && <div className="text-lg font-bold mb-2">{user.first_name}</div>}
                <div className="relative flex">
                    <Textarea
                        placeholder={t('qaSearch')}
                        className="rounded-lg h-30"
                        value={qaInputs["root"] || ""}
                        onChange={(e) => handleInputChange("root", e.target.value)}
                    />
                    <Button
                        onClick={() => handleSendQa()}
                        type="button"
                        variant="ghost"
                        className="cursor-pointer absolute text-secondary right-0 bottom-0 size-12"
                    >
                        <SendHorizonal className="size-6" />
                    </Button>
                </div>
            </div>

            {/* Danh sách câu hỏi và trả lời */}
            <div>
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : listQA && listQA.length > 0 ? (
                    listQA.map((item) => (
                        <div key={item.id} className="mb-8">
                            {/* 🟢 Câu hỏi cha */}
                            <div className="px-4 py-2 bg-gray-200 rounded-lg">
                                <div className="flex gap-6">
                                    <div className="font-bold">{item.user.first_name} {item.user.last_name}</div>
                                    <div>{formatDateTime(item.created_at)}</div>
                                </div>
                                <div>{item.comment}</div>
                            </div>

                            {/* Nút Reply ở cha nếu chưa có reply */}
                            {!item.replies?.length && (
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-sm !text-blue-500 mt-1 hover:bg-blue-50"
                                        onClick={() => toggleReply(item.id)}
                                    >
                                        {showReply[item.id] ? "Cancel" : "Reply"}
                                    </Button>
                                </div>
                            )}

                            {/* 🟡 Ô nhập reply nếu show */}
                            {showReply[item.id] && (
                                <div className="relative flex mt-2 ml-10">
                                    <Textarea
                                        placeholder={t("qaSearch")}
                                        className="rounded-lg h-30"
                                        value={qaInputs[item.id] || ""}
                                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                                    />
                                    <Button
                                        onClick={() => handleSendQa(item.id)}
                                        type="button"
                                        variant="ghost"
                                        className="cursor-pointer absolute text-secondary right-0 bottom-0 size-12"
                                    >
                                        <SendHorizonal className="size-6" />
                                    </Button>
                                </div>
                            )}

                            {item.replies && item.replies.length > 0 && (
                                <div className="mt-3 ml-6 relative">
                                    {/* Line dọc nằm bên trái các reply con */}
                                    <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-300"></div>

                                    <div className="space-y-4">
                                        {item.replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className="relative pl-8 before:content-[''] before:absolute before:top-6 before:left-3 before:w-5 before:h-px before:bg-gray-300"
                                            >
                                                {/* Box comment con */}
                                                <div className="px-4 py-2 bg-gray-200 rounded-lg">
                                                    <div className="flex gap-6">
                                                        <div className="font-bold">
                                                            {reply.user.first_name} {reply.user.last_name}
                                                        </div>
                                                        <div>{formatDateTime(reply.created_at)}</div>
                                                    </div>
                                                    <div>{reply.comment}</div>
                                                </div>

                                                {/* Nút Reply riêng cho từng reply con */}
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="text-sm !text-blue-500 mt-1 hover:bg-blue-50"
                                                        onClick={() => toggleReply(reply.id)}
                                                    >
                                                        {showReply[reply.id] ? "Cancel" : "Reply"}
                                                    </Button>
                                                </div>

                                                {/* Ô nhập reply cho reply con */}
                                                {showReply[reply.id] && (
                                                    <div className="relative flex mt-2 ml-8">
                                                        <Textarea
                                                            placeholder={t("qaSearch")}
                                                            className="rounded-lg h-30"
                                                            value={qaInputs[reply.id] || ""}
                                                            onChange={(e) => handleInputChange(reply.id, e.target.value)}
                                                        />
                                                        <Button
                                                            onClick={() => handleSendQa(item.id, reply.id)} // ✅ gửi về cha gốc
                                                            type="button"
                                                            variant="ghost"
                                                            className="cursor-pointer absolute text-secondary right-0 bottom-0 size-12"
                                                        >
                                                            <SendHorizonal className="size-6" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}



                        </div>
                    ))
                ) : null}
            </div>
        </div>
    )
}

export default QAInput
