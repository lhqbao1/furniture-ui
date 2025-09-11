"use client"

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import { Comment } from "@/types/comment"
import { useState } from "react"
import CommentImageDialogContent from "./comment-image-dialog-content"

export default function CommentImageDialog({ listComments, comment }: { listComments: Comment[], comment: Comment }) {

    // Lọc chỉ những comment có listImages
    const commentsWithImages = listComments.filter(c => c.listImages && c.listImages.length > 0)

    // Tìm index của comment hiện tại trong mảng đã lọc
    const commentIndex = commentsWithImages.findIndex(c => c.id === comment.id)

    const [open, setOpen] = useState(false)
    const [current, setCurrent] = useState<number>(commentIndex)



    const handleNext = () => {
        setCurrent(prev => {
            if (prev === null) return 0
            return prev < commentsWithImages.length - 1 ? prev + 1 : prev
        })
    }

    const handlePrev = () => {
        setCurrent(prev => {
            if (prev === null) return 0
            return prev > 0 ? prev - 1 : prev
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex lg:justify-between justify-start gap-3 pt-4 flex-wrap">
                {comment.listImages?.map((image, imgIdx, arr) => {
                    const isLast = imgIdx === arr.length - 1
                    return (
                        <div key={imgIdx}>
                            <DialogTrigger asChild >
                                <div
                                    onClick={() => {
                                        setOpen(true)
                                    }}
                                    className="relative rounded-xl bg-white shadow-sm cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                >
                                    <Image
                                        src={`/${image}`}
                                        alt=""
                                        width={80}
                                        height={80}
                                        className="rounded-xl object-contain"
                                        unoptimized
                                    />
                                    {isLast && (
                                        <div className="absolute inset-0 flex items-center justify-center w-full h-full bg-gray-300/50 rounded-xl">
                                            <span className="text-white font-bold text-xl">+</span>
                                        </div>
                                    )}
                                </div>
                            </DialogTrigger>
                            <DialogTitle></DialogTitle>
                        </div>
                    )
                })}
            </div>

            <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] max-h-fit p-6">
                <CommentImageDialogContent
                    comment={listComments[current]}
                    onNext={handleNext}
                    onPrev={handlePrev}
                />
            </DialogContent>
        </Dialog>
    )
}
