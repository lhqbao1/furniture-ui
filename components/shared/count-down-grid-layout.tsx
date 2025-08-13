'use client'
import { trendingProducts } from '@/data/data'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import ListReviewButton from './list-review-buttons'
import gsap from 'gsap'

const CountDownGridLayout = () => {
    const cardRefs = useRef<HTMLDivElement[]>([])
    const [timeLeft, setTimeLeft] = useState(0); // seconds
    const [barWidth, setBarWidth] = useState(0);

    useEffect(() => {
        // set countdown target (ví dụ 3 giờ từ bây giờ)
        const target = new Date().getTime() + 3 * 60 * 60 * 1000;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((target - now) / 1000)); // tính giây còn lại            
            setTimeLeft(diff);
        }, 1000);

        const updateWidth = () => {
            const now = new Date().getTime();
            const targetSecond = 3 * 60 * 60;
            const diff = Math.max(0, Math.floor((target - now) / 1000));
            const percentLeft = (diff / targetSecond) * 100;
            setBarWidth(percentLeft);
        };

        // gọi ngay lần đầu
        updateWidth();

        // sau đó chạy interval mỗi 5 giây
        const widthInterval = setInterval(updateWidth, 5000);

        return () => {
            clearInterval(interval);
            clearInterval(widthInterval);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    useEffect(() => {
        cardRefs.current.forEach((card) => {
            const btn = card.querySelector<HTMLDivElement>('.list-review-btn')
            if (!btn) return

            gsap.set(btn, { display: 'none', opacity: 0 })

            card.addEventListener('mouseenter', () => {
                gsap.fromTo(btn, { x: 20 }, { display: 'block', opacity: 1, duration: 0.5, x: 0 })
            })
            card.addEventListener('mouseleave', () => {
                gsap.fromTo(btn, { x: 0 }, { x: 20, opacity: 0, duration: 0.5, onComplete: () => { gsap.set(btn, { display: 'none' }); } })
            })
        })
    }, [])
    return (
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 sm:mt-6 mt-4'>
            {trendingProducts.map((product, idx) => {
                return (
                    <div
                        key={product.id}
                        className='bg-white p-4 rounded-2xl shadow relative'
                        ref={el => { if (el) cardRefs.current[idx] = el }}
                    >
                        <Image
                            width={200}
                            height={200}
                            src={product.image}
                            alt={product.name}
                            className='w-full h-48 object-contain mb-2 rounded'
                        />

                        <div className='absolute top-4 right-0 list-review-btn'>
                            <ListReviewButton />
                        </div>

                        <div className='flex flex-col items-end gap-2'>
                            <p className='text-sm text-gray-500 font-bold'>{product.price}$</p>

                            <div className='relative w-full'>

                                <div className='absolute -top-9' style={{ left: `${100 - barWidth - 26}px` }}>
                                    <div className="relative w-fit bg-primary text-white p-1 rounded min-w-[60px]">
                                        <p className="text-center text-sm font-bold">
                                            {(product.salePrice + (100 - barWidth) / 100 * (product.price - product.salePrice)).toFixed(2)}$
                                        </p>

                                        {/* Mũi tên */}
                                        <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-primary -translate-x-1/2"></div>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full bg-gray-300 relative overflow-hidden rounded-full">
                                    <div style={{ width: `${100 - barWidth}%` }} className={`absolute top-0 left-0 h-full bg-red-500 animate-stripes rounded-full`}></div>
                                </div>
                            </div>

                            <div className='flex flex-row gap-1 text-sm text-gray-500'>
                                <p className='text-sm'>ends in: </p>
                                <div className='cout-down text-sm'>{formatTime(timeLeft)}</div>
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>
    )
}

export default CountDownGridLayout