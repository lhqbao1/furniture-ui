'use client'
import ColorPickerButton from '@/components/shared/color-picker-button'
import { Button } from '@/components/ui/button'
import { preOrderItems } from '@/data/data'
import { PreOrderProduct } from '@/types/products'
import { Upload } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

const PreOrder = () => {
    const [activeIndex, setActiveIndex] = useState(0) // thẻ đang ở giữa
    const [currentItem, setCurrentItem] = useState<PreOrderProduct | undefined>(preOrderItems[0])
    const [choosedColor, setChoosedColor] = useState<string>('')
    const chooseColor = (color: string) => {
        setChoosedColor(color)
    }
    return (
        <div className='container-padding'>
            <h2 className='text-secondary text-4xl font-bold text-center uppercase'>PRE-ORDER</h2>
            <p className='text-primary text-lg text-center font-semibold'>
                start delivery from Sep 10 to Sep 15
            </p>

            <div className='grid grid-cols-12 xl:min-h-[700px] min-h-0'>
                <div className='col-span-5 flex justify-center items-center'>
                    <div className="relative w-[380px] h-[420px]" style={{ perspective: '700px' }}>
                        <div
                            className="absolute inset-0"
                            style={{ transformStyle: 'preserve-3d', transform: 'rotateY(0deg)', isolation: 'isolate' }}
                        >
                            {preOrderItems.map((item, index) => {
                                const total = preOrderItems.length
                                const step = 360 / total
                                let isCenter = false
                                // Tính góc dựa trên activeIndex
                                const angle = step * ((index - activeIndex + total) % total)
                                const rad = (angle * Math.PI) / 180
                                let opacity = 1

                                const radiusY = 170
                                const radiusZ = 230
                                let ty = Math.sin(rad) * radiusY
                                let tz = Math.cos(rad) * radiusZ

                                const isBack = tz < 0
                                let tx = 0

                                if (isBack) {
                                    opacity = 0.4
                                    tx = -150
                                }

                                const norm = (tz + radiusZ) / (2 * radiusZ)
                                let scale = 0.85 + 0.30 * norm

                                const near = (a: number, b: number, tol = step / 2) => {
                                    let d = Math.abs((((a - b) % 360) + 360) % 360)
                                    d = d > 180 ? 360 - d : d
                                    return d <= tol
                                }
                                const isFront = near(angle, 0)
                                const isTop = near(angle, step)
                                const isBottom = near(angle, 360 - step)
                                let tilt = 0

                                if (isBottom) {
                                    ty -= 50
                                    tilt += 5
                                }
                                if (isTop) {
                                    ty += 40
                                    tilt -= 5
                                }

                                if (isFront) {
                                    tz += 80
                                    scale = 1.15
                                    opacity = 1
                                    tx = 25
                                    isCenter = true
                                }
                                const zIndex = isFront ? 999 : Math.round(tz)

                                return (
                                    <div key={item.id} className="absolute top-1/2 left-1/2">
                                        <div
                                            onClick={() => {
                                                setActiveIndex(index);
                                                setCurrentItem(item)
                                            }}
                                            className="w-[220px] h-[160px] rounded-2xl border-2 overflow-hidden  bg-white cursor-pointer transition-transform duration-500 absolute"
                                            style={{
                                                transform: `
                                                    translate(-50%, -50%)
                                                    translateX(${tx}px)
                                                    translateY(${ty}px)
                                                    translateZ(${tz}px)
                                                    skewX(${tilt}deg)
                                                    rotateY(0deg)
                                                    scale(${scale})
                                                `,
                                                transformOrigin: 'bottom center',
                                                opacity,
                                                zIndex,
                                                willChange: 'transform',
                                                border: isCenter ? `2px solid #f15a24` : ''
                                            }}
                                        >
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={300}
                                                height={200}
                                                className="w-full h-full object-contain p-4"
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className='col-span-5 h-full flex flex-col justify-center xl:gap-6'>
                    <div className='item-title'>
                        <h3 className='text-3xl font-bold text-gray-600 capitalize'>{currentItem?.name}</h3>
                        <p className='font-bold text-gray-400 text-2xl'>{currentItem?.award ? currentItem?.award : 'description'}</p>
                    </div>
                    <p className='text-primary text-4xl font-bold'>€{currentItem?.price}</p>
                    <p className=''>{currentItem?.desc}</p>
                    <p className=''>{currentItem?.desc}</p>
                    {/* <div className='item-color flex flex-row gap-2'>
                        {currentItem?.color.map((item, index) => {
                            return (
                                <ColorPickerButton color={item} key={index} onClick={() => chooseColor(item)} active={choosedColor === item} />
                            )
                        })}
                    </div> */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='flex flex-row gap-3 items-center mb-4'>
                            <Upload size={40} stroke='#f15a24' />
                            <p className='text-xl'>Lorem ipsum</p>
                        </div>
                        <div className='flex flex-row gap-3 items-center mb-4'>
                            <Upload size={40} stroke='#f15a24' />
                            <p className='text-xl'>Lorem ipsum</p>
                        </div>
                        <div className='flex flex-row gap-3 items-center mb-4'>
                            <Upload size={40} stroke='#f15a24' />
                            <p className='text-xl'>Lorem ipsum</p>
                        </div>
                        <div className='flex flex-row gap-3 items-center mb-4'>
                            <Upload size={40} stroke='#f15a24' />
                            <p className='text-xl'>Lorem ipsum</p>
                        </div>
                    </div>
                    <div className='flex flex-row xl:gap-6 gap-3 justify-start items-center'>
                        <Button className='w-fit px-6 py-7 text-2xl uppercase rounded-2xl'>
                            Pre-order
                        </Button>
                        <div className='text-gray-500'>
                            <p>340 Customers have placed orders</p>
                            <p>Pre-order before Aug 31</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default PreOrder
