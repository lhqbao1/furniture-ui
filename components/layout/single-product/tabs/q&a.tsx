import React from 'react'
import GiveCommentSection from './review/give-comment-section'
import QAInput from './q&a/q&a-input'
import QAAccordion from './q&a/q&a-accordion'

interface QASectionProps {
    productId: string
}

const QASection = ({ productId }: QASectionProps) => {
    return (
        <div className='w-1/2'>
            <QAInput productId={productId} />
        </div>
    )
}

export default QASection