import React from 'react'
import GiveCommentSection from './review/give-comment-section'
import QAInput from './q&a/q&a-input'
import QAAccordion from './q&a/q&a-accordion'

const QASection = () => {
    return (
        <div className='grid grid-cols-12 gap-8 xl:py-4 pt-0'>
            <div className='col-span-7 flex flex-col gap-6 py-2'>
                {/* <QAInput /> */}
                {/* <QAAccordion /> */}
            </div>
            {/* <div className='col-span-5 flex flex-col gap-6'>
                <GiveCommentSection />
            </div> */}
        </div>
    )
}

export default QASection