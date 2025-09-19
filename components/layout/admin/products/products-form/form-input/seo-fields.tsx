'use client'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useGenerateSEO } from '@/features/products/hook'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

const SeoFields = () => {
    const form = useFormContext()
    // const { watch } = useFormContext()

    const generateSEOMutation = useGenerateSEO()
    const title = form.watch('name')
    const description = form.watch('description')


    const handleGenerateSEO = () => {
        generateSEOMutation.mutate({
            title: title,
            description: description
        },
            {
                onSuccess(data, variables, context) {
                    toast.success("Generate SEO fields success")
                },
                onError(error, variables, context) {
                    toast.error("Generate SEO fields fail")
                },
            },
        )
    }

    return (
        <div className='space-y-4'>
            <div className='flex gap-4 items-center'>
                <Button onClick={() => handleGenerateSEO()} disabled={!title || !description ? true : false}>
                    Generate SEO
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
                            <Input placeholder="" {...field} />
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
                            <Input placeholder="" {...field} />
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
                            <Textarea placeholder="" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}

export default SeoFields