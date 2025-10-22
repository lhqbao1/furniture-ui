"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImagePlus, SendHorizonal, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { getMe } from "@/features/auth/api"
import { useCreateQA, useGetQAByProduct } from "@/features/qa/hook"
import { formatDateTime } from "@/lib/date-formated"
import { QAFormValues } from "@/lib/schema/qa"
import { toast } from "sonner"
import QASkeleton from "./qa-skeleton"
import Image from "next/image"
import { useUploadStaticFile } from '@/features/file/hook'
import { StaticFileResponse } from '@/types/products'

interface QAInputProps {
    productId: string
}

const QAInput = ({ productId }: QAInputProps) => {
    const t = useTranslations()
    const postQAMutation = useCreateQA()
    const uploadImageMutation = useUploadStaticFile() // ✅ Hook upload image

    // Text inputs
    const [qaInputs, setQaInputs] = React.useState<Record<string, string>>({})
    // Show/hide reply input
    const [showReply, setShowReply] = React.useState<Record<string, boolean>>({})
    // Images selected per key
    const [qaImages, setQaImages] = React.useState<Record<string, File[]>>({})


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

    const handleImageChange = (key: string, files: FileList | null) => {
        if (!files) return
        const newFiles = Array.from(files)
        setQaImages((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), ...newFiles],
        }))
    }

    const removeImage = (key: string, index: number) => {
        setQaImages((prev) => ({
            ...prev,
            [key]: prev[key].filter((_, i) => i !== index),
        }))
    }

    // const handleSendQa = (parent_id?: string, key?: string) => {
    //     const idKey = key || parent_id || "root"
    //     const comment = qaInputs[idKey] || ""
    //     if (!comment.trim()) return

    //     const payload: QAFormValues = {
    //         comment,
    //         product_id: productId,
    //     }

    //     if (parent_id) payload.parent_id = parent_id

    //     postQAMutation.mutate(payload, {
    //         onSuccess: () => {
    //             toast.success(t("QAsuccess")) // ✅ message theo ngôn ngữ hiện tại
    //             setQaInputs((prev) => ({ ...prev, [idKey]: "" }))
    //             if (parent_id) {
    //                 setShowReply((prev) => ({ ...prev, [idKey]: false }))
    //             }
    //         },
    //         onError: (error) => {
    //             console.error(error)
    //             toast.error(t("QAerror"))
    //         },
    //     })

    //     setQaInputs((prev) => ({ ...prev, [idKey]: "" }))
    //     if (parent_id) setShowReply((prev) => ({ ...prev, [idKey]: false }))
    // }

    const handleSendQa = async (parent_id?: string, key?: string) => {
        const idKey = key || parent_id || "root"
        const comment = qaInputs[idKey] || ""
        const images = qaImages[idKey] || []

        if (!comment.trim() && images.length === 0) return

        try {
            let uploadedUrls: string[] = []

            // 🟢 Nếu có ảnh thì upload trước
            if (images.length > 0) {
                const formData = new FormData()
                images.forEach((file) => formData.append("files", file))

                const uploadRes = await new Promise<string[]>((resolve, reject) => {
                    uploadImageMutation.mutate(formData, {
                        onSuccess: (data: StaticFileResponse) => {
                            const urls = data.results?.map((r) => r.url) || []
                            resolve(urls)
                        },
                        onError: reject,
                    })
                })

                uploadedUrls = uploadRes
            }

            // 🟠 Tạo payload
            const payload: QAFormValues = {
                comment,
                product_id: productId,
            }

            if (uploadedUrls.length > 0) payload.static_files = uploadedUrls
            if (parent_id) payload.parent_id = parent_id

            postQAMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success(t("QAsuccess"))
                    setQaInputs((prev) => ({ ...prev, [idKey]: "" }))
                    setQaImages((prev) => ({ ...prev, [idKey]: [] }))
                    if (parent_id) setShowReply((prev) => ({ ...prev, [idKey]: false }))
                },
                onError: (error) => {
                    console.error(error)
                    toast.error(t("QAerror"))
                },
            })
        } catch (error) {
            console.error(error)
            toast.error(t("QAerror"))
        }
    }


    const handleInputChange = (key: string, value: string) => {
        setQaInputs((prev) => ({ ...prev, [key]: value }))
    }

    const toggleReply = (key: string) => {
        if (!userId) {
            toast.error(t("QAerror"))
            return
        }
        setShowReply((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const renderImagePreview = (key: string) => {
        const images = qaImages[key]
        if (!images || images.length === 0) return null

        return (
            <div className="flex flex-wrap gap-3 mt-2">
                {images.map((file, i) => (
                    <div key={i} className="relative">
                        <Image
                            src={URL.createObjectURL(file)}
                            alt={`preview-${i}`}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover border"
                        />
                        <button
                            onClick={() => removeImage(key, i)}
                            className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-14">
            <div>
                <div className="flex gap-1.5 text-xl font-semibold mb-2">
                    <div className="text-secondary">{t('haveQuestion')}</div>
                    <div className="text-primary">{t('justAsk')}</div>
                </div>
                {user && <div className="text-lg font-bold mb-2">{user.first_name}</div>}
                <div className="relative flex">
                    <Textarea
                        placeholder={t('qaSearch')}
                        className="rounded-lg h-30"
                        value={qaInputs["root"] || ""}
                        onChange={(e) => handleInputChange("root", e.target.value)}
                    />

                    <div className="absolute right-0 bottom-0 flex gap-3">
                        <Button
                            onClick={() => handleSendQa()}
                            type="button"
                            variant="ghost"
                            className="cursor-pointer  text-secondary size-12"
                        >
                            <SendHorizonal className="size-6" />
                        </Button>
                        <label className="cursor-pointer text-secondary size-12 flex items-center justify-center">
                            <ImagePlus className="size-6" />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleImageChange("root", e.target.files)}
                            />
                        </label>
                    </div>
                </div>
                {renderImagePreview("root")}
            </div>

            {/* Danh sách câu hỏi và trả lời */}
            <div>
                {isLoading ? (
                    <QASkeleton />
                ) : listQA && listQA.length > 0 ? (
                    listQA.map((item) => (
                        <div key={item.id} className="mb-8">
                            {/* 🟢 Câu hỏi cha */}
                            <div className="px-4 py-2 border rounded-lg">
                                <div className="flex gap-6 items-center">
                                    <div className="flex gap-2 items-center">
                                        <span className="font-bold">{item.user.first_name} {item.user.last_name}</span>
                                        {item.user.is_admin ?
                                            <Image
                                                src="/new-logo.svg"
                                                width={20}
                                                height={20}
                                                alt=""
                                            />
                                            : ''}
                                    </div>
                                    <div className="text-sm text-gray-600">{formatDateTime(item.created_at)}</div>
                                </div>
                                <div>{item.comment}</div>
                                <div className='flex gap-2 mt-2'>
                                    {item.static_files.map((image, imageIndex) => {
                                        return (
                                            <div key={imageIndex}>
                                                <Image
                                                    src={image}
                                                    height={100}
                                                    width={100}
                                                    alt=''
                                                    className='rounded-md w-20 h-20 object-cover'
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
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
                                        {showReply[item.id] ? t('cancel') : t('reply')}
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
                                    <div className="absolute right-0 bottom-0 flex gap-3">
                                        <Button
                                            onClick={() => handleSendQa(item.id)}
                                            type="button"
                                            variant="ghost"
                                            className="cursor-pointer text-secondary size-12"
                                        >
                                            <SendHorizonal className="size-6" />
                                        </Button>
                                        <label className="cursor-pointer text-secondary size-12 flex items-center justify-center">
                                            <ImagePlus className="size-6" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => handleImageChange(item.id, e.target.files)}
                                            />
                                        </label>
                                    </div>
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
                                                <div className="px-4 py-2 border-2 rounded-lg">
                                                    <div className="flex gap-6 items-center">
                                                        <div className="flex gap-2 items-center">
                                                            <span className="font-bold">{reply.user.first_name} {reply.user.last_name}</span>
                                                            {reply.user.is_admin ?
                                                                <Image
                                                                    src="/new-logo.svg"
                                                                    width={20}
                                                                    height={20}
                                                                    alt=""
                                                                />
                                                                : ''}
                                                        </div>
                                                        <div className="text-sm text-gray-600">{formatDateTime(reply.created_at)}</div>
                                                    </div>
                                                    <div>{reply.comment}</div>
                                                    {reply.static_files.map((image, imageIndex) => {
                                                        return (
                                                            <div key={imageIndex}>
                                                                <Image
                                                                    src={image}
                                                                    height={60}
                                                                    width={60}
                                                                    alt=''
                                                                />
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {/* Nút Reply riêng cho từng reply con */}
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="text-sm !text-blue-500 mt-1 hover:bg-blue-50"
                                                        onClick={() => toggleReply(reply.id)}
                                                    >
                                                        {showReply[reply.id] ? t('cancel') : t('reply')}
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
                                                        <div className="absolute right-0 bottom-0 flex gap-3">
                                                            <Button
                                                                onClick={() => handleSendQa(item.id)}
                                                                type="button"
                                                                variant="ghost"
                                                                className="cursor-pointer text-secondary size-12"
                                                            >
                                                                <SendHorizonal className="size-6" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleSendQa(item.id)}
                                                                type="button"
                                                                variant="ghost"
                                                                className="cursor-pointer text-secondary size-12"
                                                            >
                                                                <ImagePlus className="size-6" />
                                                            </Button>
                                                        </div>
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
