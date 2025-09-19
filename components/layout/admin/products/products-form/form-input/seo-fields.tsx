'use client'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useGenerateSEO } from '@/features/products/hook'
import { Loader2 } from 'lucide-react'
import React, { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

interface SEOFieldsProps {
    onLoadingGenerate: (loading: boolean) => void
}

const SeoFields = ({ onLoadingGenerate }: SEOFieldsProps) => {
    const form = useFormContext()
    // const { watch } = useFormContext()

    const generateSEOMutation = useGenerateSEO()
    const title = form.watch('name')
    const description = form.watch('description')


    const handleGenerateSEO = () => {
        generateSEOMutation.mutateAsync({
            title: title,
            description: JSON.stringify(description)
        },
            {
                onSuccess(data, variables, context) {
                    toast.success("Generate SEO fields success")
                    form.setValue("url_key", data.url_key)
                    form.setValue("meta_title", data.meta_title)
                    form.setValue("meta_description", data.meta_description)
                },
                onError(error, variables, context) {
                    toast.error("Generate SEO fields fail")
                },
            },
        )
    }

    // mỗi lần mutation.isPending thay đổi thì báo về cha
    useEffect(() => {
        onLoadingGenerate(generateSEOMutation.isPending)
    }, [generateSEOMutation.isPending, onLoadingGenerate])

    return (
        <div className='space-y-4'>
            <div className='flex gap-4 items-center'>
                <Button type='button' onClick={() => handleGenerateSEO()} disabled={!title || !description ? true : false}>
                    {generateSEOMutation.isPending ? <Loader2 className='animate-spin' /> : "Generate SEO"}
                </Button>
                {!title || !description ? <p className='text-red-500'>You need to enter product name and product description</p> : ''}
            </div>
            <FormField
                control={form.control}
                name="url_key"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-[#666666] text-sm'>
                            URL Key
                        </FormLabel>
                        <FormControl>
                            <Input placeholder="" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="meta_title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-[#666666] text-sm'>
                            Meta Title
                        </FormLabel>
                        <FormControl>
                            <Input placeholder="" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-[#666666] text-sm'>
                            Meta Description
                        </FormLabel>
                        <FormControl>
                            <Textarea placeholder="" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}

export default SeoFields