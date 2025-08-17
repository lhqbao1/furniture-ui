import CountDownGridLayout from '@/components/shared/count-down-grid-layout'
import React from 'react'

const FlashSale = () => {
    return (
        <div className='section-padding'>
            <h2 className='text-secondary text-4xl font-bold text-center uppercase'>Flash Sale</h2>
            <p className='text-primary text-lg text-center uppercase'>up to 50%</p>
            <CountDownGridLayout />
        </div>
    )
}

export default FlashSale