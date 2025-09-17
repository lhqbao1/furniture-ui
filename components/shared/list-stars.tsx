import { Star } from 'lucide-react'
import React from 'react'

interface ListStarsProps {
    size?: number
    rating?: number
}

const ListStars = ({ size = 20, rating = 0 }: ListStarsProps) => {
    return (
        <div className='flex gap-1'>
            {[1, 2, 3, 4, 5].map((item, index) => {
                return (
                    <div key={item}>
                        <Star size={size} stroke='black' fill={item <= rating ? '#f15a24' : 'white'} />
                    </div>
                )
            })}
        </div>
    )
}

export default ListStars