import React from 'react'

interface TagBadgeProps {
    color: string;
    name: string;
}

const TagBadge = ({ color, name }: TagBadgeProps) => {
    return (
        <div
            className='absolute top-3 left-4 rounded-xl text-xs py-1 uppercase px-2 text-white'
            style={{ backgroundColor: `${color}` }}
        >
            {name}
        </div>
    )
}

export default TagBadge