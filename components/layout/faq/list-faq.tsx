'use client'
import { useGetFAQItem, useGetFAQTopic } from '@/features/faq/hook'
import { Loader2, Mic, Search } from 'lucide-react'
import React, { useState } from 'react'
import { getIcon } from './icon'
import { BannerInput } from '@/components/shared/banner-input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ListFAQQuestion } from './list-question'

interface ListFAQProps {
    topic_id: string
    height?: number
}

const ListFAQ = ({ topic_id, height }: ListFAQProps) => {
    const [currentTopic, setCurrentTopic] = useState(topic_id)

    const { data: topic, isLoading: isLoadingTopic, isError: isErrorTopic } = useGetFAQTopic()
    const { data: question, isLoading: isLoadingQuestion, isError: isErrorQuestion } = useGetFAQItem(currentTopic)

    if (isLoadingTopic) return <div className=''><Loader2 className='animate-spin' /></div>

    return (
        <div className='grid grid-cols-12 gap-8 lg:pt-12 pt-4 items-start'>
            <div className='col-span-5 grid grid-cols-3 gap-10'>
                <h2 className='text-4xl font-semibold text-secondary col-span-3 text-center'>Topic</h2>
                {topic?.map((topic, topicIndex) => {
                    return (
                        <div
                            key={topicIndex}
                            className={cn('flex flex-col justify-center items-center gap-1.5 cursor-pointer py-4',
                                currentTopic === topic.id ? 'bg-primary/20 rounded-sm' : ''
                            )}
                            onClick={() => setCurrentTopic(topic.id)}
                        >
                            {getIcon(topic.name)}
                            <p className='text-center'>{topic.name}</p>
                        </div>
                    )
                })}
            </div>
            <div className='col-span-7 space-y-8'>
                <div className="flex justify-center items-center gap-2 relative pt-6">
                    <div className={cn('w-full relative flex')}>
                        <BannerInput type="email" placeholder="" className='w-full xl:h-12 h-10' />
                        <Button type="submit" variant="default" className='absolute right-0 rounded-full bg-primary text-white xl:text-lg text-sm px-0 xl:pr-10 xl:h-12 pl-1 h-10'>
                            <Mic stroke='white' size={24} className='xl:bg-secondary xl:size-3 size-5 xl:h-11 xl:w-11 rounded-full' />
                            Search
                        </Button>
                        <Search size={24} className='absolute left-3 xl:top-3 top-2' stroke='gray' />
                    </div>
                </div>
                <div className=''>
                    <ListFAQQuestion question={question} />
                </div>
            </div>
        </div>
    )
}

export default ListFAQ