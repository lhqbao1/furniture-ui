import { CustomPagination } from '@/components/shared/custom-pagination'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useMemo, useRef, useState } from 'react'

const reviewCount = [
    {
        title: 5,
        percent: 70
    },
    {
        title: 4,
        percent: 18
    },
    {
        title: 3,
        percent: 10
    },
    {
        title: 2,
        percent: 0
    },
    {
        title: 1,
        percent: 2
    }
]

const listComments = [
    {
        name: 'Olivia Grace',
        status: 'purchased',
        date: 'March 20,2025',
        company: 'ebay.png',
        comment: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.Ut wisi enim adminim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquipex ea commodo consequat',
        rating: 4
    },
    {
        name: 'Harry Poster',
        status: 'purchased',
        date: 'March 20,2025',
        company: 'amazon.png',
        comment: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.Ut wisi enim adminim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquipex ea commodo consequatLorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.Ut wisi enim adminim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquipex ea commodo consequatLorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.Ut wisi enim adminim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquipex ea commodo consequat',
        rating: 5
    },
    {
        name: 'Kitty',
        status: 'purchased',
        date: 'March 20,2025',
        // company: 'ebay.png',
        comment: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.Ut wisi enim adminim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquipex ea commodo consequat',
        rating: 1,
        reply: {
            name: 'Thao',
            role: 'Customer Service',
            comment: 'Sorry for your experience. we would like to give you a Free voucher for the next transaction.'
        }
    }
]

const ProductReviewTab = () => {
    const [selectedRate, setSelectedRate] = useState<number>()
    const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
    const [showButtonIndexes, setShowButtonIndexes] = useState<number[]>([]);
    const textRefs = useRef<(HTMLDivElement | null)[]>([]);


    useEffect(() => {
        textRefs.current.forEach((el, idx) => {
            if (el) {
                const lineHeight = parseInt(getComputedStyle(el).lineHeight);
                const lines = el.scrollHeight / lineHeight;
                if (lines > 5) {
                    setShowButtonIndexes(prev => [...prev, idx]);
                }
            }
        });
    }, []);

    const toggleExpand = (idx: number) => {
        setExpandedIndexes(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };


    const randomAngles = useMemo(() => {
        return [20, 21, 22, 23, 24].map(() => {
            return (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 20) // -30 đến -10 hoặc 10 đến 30
        })
    }, [])

    return (
        <div className='grid grid-cols-12 gap-4'>
            <div className='col-span-7 flex flex-col gap-6'>
                {/*Review main */}
                <div className='grid grid-cols-12 gap-4'>
                    <div className='col-span-3 flex flex-col items-center justify-center'>
                        <h3 className='flex flex-row gap-1'>4.8 <Star /></h3>
                        <p className='text-center'><span className='text-primary font-semibold'>120</span> happy customer</p>
                        <p className='text-gray-500'>70 reviews</p>
                    </div>

                    <div className='col-span-6'>
                        {reviewCount.map((item, index) => {
                            return (
                                <div key={index} className='flex flex-row gap-2 items-center'>
                                    <div className='flex gap-1 items-center'>
                                        <p className='min-w-2.5'>{item.title}</p>
                                        <Star className='text-primary' stroke='#f15a24' fill='#f15a24' size={20} />
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-300 relative overflow-hidden rounded-full">
                                        <div
                                            style={{ width: `${item.percent}%` }}
                                            className="absolute top-0 left-0 h-full bg-secondary rounded-full"
                                        ></div>
                                    </div>
                                    <p className='text-gray-600 font-semibold xl:w-4'>{item.percent}%</p>
                                </div>
                            )
                        })}
                    </div>

                    <div className='col-span-3'>
                        <div className='relative'>
                            {[20, 21, 22, 23, 24].map((item, index) => {
                                // Random góc từ -30 đến -10 hoặc 10 đến 30
                                const angle = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 10)
                                return (
                                    <div key={index} className='absolute right-0 top-5'
                                        style={{ transform: `rotate(${randomAngles[index]}deg)` }}
                                    >
                                        <Image
                                            src={`/${item}.png`}
                                            width={100}
                                            height={100}
                                            alt=''
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>


                </div>

                <div className='grid grid-cols-12 gap-8 border-b border-gray-300 pb-6'>
                    <div className='col-span-6 flex flex-row justify-between'>
                        <p>All</p>
                        {[...reviewCount].reverse().map((item, index) => {
                            return (
                                <div key={index} className='flex gap-1'>
                                    <p>{item.title}</p>
                                    <Star stroke='#f15a24' onClick={() => setSelectedRate(item.title)} fill={selectedRate === item.title ? "#f15a24" : "white"}
                                    />
                                </div>
                            )
                        })}
                    </div>
                    <div className='col-span-6 flex gap-8'>
                        <div className="flex flex-row-reverse items-center gap-2 col-span-6">
                            <Checkbox id="pic" defaultChecked />
                            <div className="grid gap-2">
                                <Label htmlFor="pic">pictures/video</Label>
                            </div>
                        </div>
                        <div className="flex flex-row-reverse items-center gap-2 col-span-6">
                            <Checkbox id="comments" defaultChecked />
                            <div className="grid gap-2">
                                <Label htmlFor="comments">comments</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='pt-6'>
                    {listComments.map((item, index) => (
                        <div key={index} className='border-b border-gray-300 py-4'>
                            <div className='flex justify-between items-center'>
                                <div>
                                    <div className='flex items-center gap-2'>
                                        <p className='text-gray-600 font-bold'>{item.name}</p>
                                        {item.company && (
                                            <Image
                                                src={`/${item.company}`}
                                                width={40}
                                                height={40}
                                                alt=''
                                            />
                                        )}
                                    </div>
                                    <div className='flex gap-2'>
                                        <p className='text-secondary font-semibold text-sm'>{item.status}</p>
                                        <p className='text-gray-400 text-sm'>{item.date}</p>
                                    </div>
                                </div>
                                <div className='flex flex-row gap-1'>
                                    {reviewCount.map((star, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            fill={star.title <= item.rating ? '#f15a24' : 'white'}
                                            stroke='#f15a24'
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div
                                    ref={el => {
                                        textRefs.current[index] = el; // chỉ gán thôi
                                    }} className={`mt-2 ${!expandedIndexes.includes(index) ? 'line-clamp-5' : ''}`}
                                >
                                    {item.comment}
                                </div>
                                {showButtonIndexes.includes(index) && (
                                    <button
                                        className="text-primary mt-1 cursor-pointer font-bold text-sm"
                                        onClick={() => toggleExpand(index)}
                                    >
                                        {expandedIndexes.includes(index) ? 'See less' : 'Read more'}
                                    </button>
                                )}
                            </div>

                            {/*Show comment reply */}
                            {item.reply ?
                                <div className='pl-12 pt-2 relative'>
                                    <div className='flex gap-2 items-center'>
                                        <p className='text-gray-600 font-bold'>{item.reply.name}</p>
                                        <div className='flex gap-1 items-center'>
                                            <p className='text-secondary text-sm font-semibold'>{item.reply.role}</p>
                                            <Image
                                                src={'/logo.svg'}
                                                height={30}
                                                width={30}
                                                alt=''
                                                className='size-4'
                                            />
                                        </div>
                                    </div>
                                    <p>{item.reply.comment}</p>

                                    <div className='absolute w-6 h-14 left-4  border-l border-b top-0'></div>
                                </div>

                                : ''}

                        </div>
                    ))}
                    <div className='py-6 text-center'>
                        <Button hasEffect className='rounded-full font-bold'>Load More</Button>
                    </div>
                    <CustomPagination />

                </div>

            </div>
            <div className='col-span-5'></div>
        </div>
    )
}

export default ProductReviewTab