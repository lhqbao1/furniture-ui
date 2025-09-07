'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUploadStaticFile } from '@/features/file/hook'
import { User } from '@/types/user'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import React, { useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
interface AvatarProps {
    user: User
}


const AccountAvatar = ({ user }: AvatarProps) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(user && user.avatar_url ? user.avatar_url : '/default-avatar.jpg')

    const formData = new FormData()
    const uploadStaticFileMutation = useUploadStaticFile()
    const qc = useQueryClient()

    const { setValue } = useFormContext()


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setSelectedFile(file)

        formData.append("file", file)
        uploadStaticFileMutation.mutate(formData, {
            onSuccess(data, variables, context) {
                console.log(data)
                setValue("avatar_url", data.url, { shouldValidate: true })
                qc.invalidateQueries({ queryKey: ['user'] })
            },
        })

        // tạo preview từ file vừa chọn
        const url = URL.createObjectURL(file)
        setPreview(url)
    }

    return (
        <div className='col-span-12 lg:col-span-4 flex flex-col justify-start items-center gap-4'>
            <Image
                src={`${user.avatar_url || preview}`}
                height={150}
                width={150}
                alt=''
                className='rounded-xl'
            />
            <div className='flex gap-3'>
                <Input
                    id="picture"
                    type="file"
                    className='hidden'
                    onChange={handleFileChange}
                    ref={fileInputRef}
                />
                <Button variant={'secondary'} onClick={() => fileInputRef.current?.click()} type='button'>Change</Button>
                <Button variant={'secondary'}>Remove</Button>
            </div>
            <span className='text-sm text-gray-500'>allowed JPG, PNG. Max 2M</span>
        </div>
    )
}

export default AccountAvatar