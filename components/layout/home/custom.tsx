import ImagePicker from '@/components/shared/image-picker'
import { useTranslations } from 'next-intl'
import React from 'react'

const Custom = () => {
    const t = useTranslations()
    return (
        <div className='section-padding'>
            <h2 className='text-secondary text-4xl font-bold text-center capitalize'>
                {t('customRequest')}
            </h2 >
            <p className='text-primary text-2xl text-center font-semibold'>
                {t('getCustom')}
            </p>
            <ImagePicker />
        </div>
    )
}

export default Custom