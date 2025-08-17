import React from 'react'

interface ProductVoucherProps {
    isSelected: boolean
    onSelect: () => void
}

const ProductVoucher = ({ isSelected, onSelect }: ProductVoucherProps) => {
    return (
        <div
            onClick={onSelect}
            className={`relative rounded-xl p-4 cursor-pointer transition-colors 
            ${isSelected ? "border border-red-500 bg-red-50" : "border border-gray-300 bg-white"}`}
        >
            {/* notch RIGHT */}
            <span className="absolute -right-[15px] top-[51%] -translate-y-1/2 w-7 h-7 bg-white rounded-full z-30"></span>
            <span
                className={`absolute -right-[15px] top-[51%] -translate-y-1/2 w-7 h-7 rounded-full border z-40 [clip-path:inset(0_50%_0_0)]
                    ${isSelected ? "border border-red-500" : "border border-gray-300"}`}
            ></span>

            {/* notch LEFT */}
            <span className="absolute -left-[15px] top-[51%] -translate-y-1/2 w-7 h-7 bg-white rounded-full z-30"></span>
            <span className={`absolute -left-[15px] top-[51%] -translate-y-1/2 w-7 h-7 rounded-full border border-gray-300 z-40 [clip-path:inset(0_0_0_50%)]
                    ${isSelected ? "border border-red-500" : "border border-gray-300"}`}
            ></span>

            {/* dashed line */}
            <div className='absolute top-1/2 w-full border-t border-dashed border-gray-200'></div>

            {/* content */}
            <div className="grid grid-cols-2 gap-4 items-center mb-8">
                <div className="text-center text-xs">
                    For all orders <br /> from 200$
                </div>
                <div className="text-center text-xs">
                    Discount <br /> <span className="font-bold">OFF 10%</span>
                </div>
            </div>

            {/* footer */}
            <div className="flex justify-between items-center">
                <button className="bg-black text-white text-xs px-3 py-1 rounded-full">
                    Apply Code
                </button>
                <span className="font-bold text-xs">MO234231</span>
            </div>
        </div>
    )
}

export default ProductVoucher