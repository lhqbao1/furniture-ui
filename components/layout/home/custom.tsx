import ImagePicker from '@/components/shared/image-picker'
import React from 'react'

const Custom = () => {
    return (
        <div className='section-padding'>
            < h2 className='text-secondary text-4xl font-bold text-center uppercase' >
                CUSTOM REQUEST
            </h2 >
            <p className='text-primary text-2xl text-center font-semibold'>
                Get a free 3D mock-up in 24hours
            </p>

            <ImagePicker />
        </div>
    )
}

export default Custom