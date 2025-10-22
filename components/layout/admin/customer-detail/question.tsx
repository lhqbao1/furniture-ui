import React from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useGetQAByCustomer } from '@/features/qa/hook'

interface QuestionProps {
    userId: string
}

const Question = ({ userId }: QuestionProps) => {
    const { data: questions, isLoading, isError } = useGetQAByCustomer(userId)
    if (isLoading || isError) return <>Loading...</>
    if (!questions) return <>No questions</>

    console.log(questions)
    return (
        <Card>
            <CardHeader>
                <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Card Content</p>
            </CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter>
        </Card>
    )
}

export default Question