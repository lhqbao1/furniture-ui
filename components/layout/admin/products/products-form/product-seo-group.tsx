import React from 'react'
import SeoFields from './form-input/seo-fields'

interface ProductSEOGroupProps {
    setIsLoadingSEO: (loading: boolean) => void
}

const ProductSEOGroup = ({ setIsLoadingSEO }: ProductSEOGroupProps) => {
    return (
        <div className='space-y-6'>
            {/*Product SEO */}
            <SeoFields onLoadingGenerate={setIsLoadingSEO} />
        </div>
    )
}

export default ProductSEOGroup