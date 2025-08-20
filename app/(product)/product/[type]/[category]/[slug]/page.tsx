'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ColorPickerButton from '@/components/shared/color-picker-button'
import ImageSinglePicker, { SizeType } from '@/components/shared/image-single-picker'
import { NumberInput } from '@/components/shared/number-input'
import ProductVoucher from '@/components/shared/product-voucher'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { allProducts, colors, dimension, materials, vouchers } from '@/data/data'
import { cn } from '@/lib/utils'
import { Product } from '@/types/products'
import { Equal, Facebook, Heart, Instagram, Plus, Star, Twitter, Youtube } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { ProductDetailsTab } from '@/components/layout/single-product/product-tab'
import ListStars from '@/components/shared/list-stars'
import BoughtTogetherSection from '@/components/layout/single-product/bought-together'

const ProductDetails = () => {
    const params = useParams()
    const { type, category, slug } = params
    const [selectedVoucher, setSelectedVoucher] = useState<number>()
    const [productDetails, setProductDetails] = useState<Product | null>(null)
    const [choosedMaterial, setChoosedMaterial] = useState<string>('')
    const [choosedColor, setChoosedColor] = useState<string>('')
    const [choosedDimension, setChoosedDimension] = useState<string>('')
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isHover, setIsHover] = useState(false)

    const handleZoomImage = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
        const x = ((e.pageX - left) / width) * 100
        const y = ((e.pageY - top) / height) * 100
        setPosition({ x, y })
    }

    const chooseMaterial = (material: string) => {
        setChoosedMaterial(material)
    }

    const chooseDimension = (dimension: string) => {
        setChoosedDimension(dimension)
    }

    const chooseColor = (color: string) => {
        setChoosedColor(color)
    }
    useEffect(() => {
        const found = allProducts.find((product) => product.id.toString() === slug)
        setProductDetails(found || null)
    }, [slug])

    const handleSelectVoucher = (item: number) => {
        setSelectedVoucher(item)
    }


    return (
        <div className='py-3'>
            <CustomBreadCrumb />
            {productDetails ?
                <div className='flex flex-col gap-8'>
                    {/*Product details */}
                    <div className='grid grid-cols-12 xl:gap-16 gap-8'>
                        {/*Product details images */}
                        <div className='xl:col-span-7 col-span-12 flex flex-col gap-6'>
                            {/*Product details main image */}
                            <div
                                className='2xl:p-24 xl:p-20 md:p-6 overflow-hidden main-image'
                                onMouseMove={handleZoomImage}
                                onMouseEnter={() => setIsHover(true)}
                                onMouseLeave={() => setIsHover(false)}
                            >
                                <Image
                                    src={`${productDetails.image}`}
                                    width={600}
                                    height={400}
                                    alt={`${productDetails.name}`}
                                    className='transition-transform duration-300'
                                    style={{
                                        transformOrigin: `${position.x}% ${position.y}%`,
                                        transform: isHover ? "scale(1.5)" : "scale(1)",
                                    }}
                                />
                            </div>
                            {/*Product details sub images */}
                            <div className='flex flex-row px-12'>
                                <Carousel opts={{ loop: true }}>
                                    <CarouselContent>
                                        {[1, 2, 3, 4, 5, 6].map((item, index) => {
                                            return (
                                                <CarouselItem key={index} className='md:basis-1/2 lg:basis-1/3 flex justify-center'>
                                                    <Image
                                                        src={`/${item}.png`}
                                                        width={100}
                                                        height={100}
                                                        alt=''

                                                    />
                                                </CarouselItem>
                                            )
                                        })}
                                    </CarouselContent>
                                    <CarouselPrevious className='text-primary border-primary' />
                                    <CarouselNext className='text-primary border-primary' />
                                </Carousel>
                            </div>

                            {/*Product details voucher */}
                            <div className='flex flex-row justify-center gap-2 mt-6'>
                                {vouchers.map((item, index) => {
                                    return (
                                        <ProductVoucher item={item} key={index} isSelected={selectedVoucher === item.id} onSelect={() => handleSelectVoucher(item.id)} />
                                    )
                                })}
                            </div>
                        </div>

                        {/*Product details */}
                        <div className='xl:col-span-5 col-span-12 flex flex-col gap-6'>
                            <h2 className='text-3xl font-semibold text-secondary'>{productDetails.name}</h2>
                            <div className='flex gap-2'>
                                <p className='text-primary text-3xl font-semibold'>€{productDetails.salePrice}</p>
                                <p className='text-gray-300 line-through text-3xl font-semibold'>€{productDetails.price}</p>
                            </div>
                            <div className='flex flex-row justify-start gap-4 items-center'>
                                <div
                                    className='rounded-xl text-xs py-1 uppercase px-2 text-white'
                                    style={{ backgroundColor: `${productDetails.tag.color}` }}
                                >
                                    {productDetails.tag.name}
                                </div>
                                <div className='flex gap-1 items-center'>
                                    <p className='text-xl text-gray-500 font-bold'>{productDetails.rating}</p>
                                    <ListStars rating={productDetails.rating} />
                                </div>
                            </div>

                            <div className='flex flex-row gap-6 items-center'>
                                <p className='text-black font-semibold text-base xl:basis-1/7'>Material</p>
                                <div className='item-color flex flex-row gap-4 flex-1'>
                                    {materials.map((item, index) => {
                                        return (
                                            <ImageSinglePicker key={index} size={SizeType.Icon} item={item} onClick={() => chooseMaterial(item)} active={choosedMaterial === item} />
                                        )
                                    })}
                                </div>
                            </div>

                            <div className='flex flex-row gap-6 items-center'>
                                <p className='text-black font-semibold text-base xl:basis-1/7'>Color</p>
                                <div className='item-color flex flex-row gap-4 flex-1'>
                                    {colors.map((item, index) => {
                                        return (
                                            <ColorPickerButton color={item} key={index} onClick={() => chooseColor(item)} active={choosedColor === item} />
                                        )
                                    })}
                                </div>
                            </div>

                            <div className='flex flex-row gap-6 items-center'>
                                <p className='text-black font-semibold text-base xl:basis-1/7'>Dimension</p>
                                <div className='item-color flex flex-row gap-4 flex-1'>
                                    {dimension.map((item, index) => {
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => item.available && chooseDimension(item.name)}
                                                className={cn(
                                                    "text-base px-2 py-1 border cursor-pointer rounded-sm ",
                                                    item.name === choosedDimension
                                                        ? "border-primary text-primary"
                                                        : "border-gray-400 text-gray-600",
                                                    !item.available && "text-gray-200 border-gray-300 cursor-not-allowed relative"
                                                )}
                                            >
                                                {item.name}
                                                {!item.available ?
                                                    <span className='absolute top-1/2 right-0 border-t border-gray-300 h-1 w-full'></span>
                                                    : ''}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox id="terms" defaultChecked />
                                <div className="grid gap-2">
                                    <Label htmlFor="terms">Removing service <span className='text-2xl font-bold text-primary'>+30€</span></Label>
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-2'>
                                <div className='flex flex-row gap-1 items-center'>
                                    <Image
                                        src={'/1.svg'}
                                        width={36}
                                        height={36}
                                        alt='1'
                                        style={{ width: 40 }}
                                    />
                                    <p className='text-base'>Lorem ipsum</p>
                                </div>
                                <div className='flex flex-row gap-1 items-center'>
                                    <Image
                                        src={'/2.svg'}
                                        width={36}
                                        height={36}
                                        alt='1'
                                        style={{ width: 40 }}

                                    />
                                    <p className='text-base'>Lorem ipsum</p>
                                </div>
                                <div className='flex flex-row gap-1 items-center'>
                                    <Image
                                        src={'/3.svg'}
                                        width={36}
                                        // sizes={16}
                                        height={36}
                                        alt='1'
                                        style={{ width: 40 }}
                                    />
                                    <p className='text-base'>Lorem ipsum</p>
                                </div>
                                <div className='flex flex-row gap-1 items-center'>
                                    <Image
                                        src={'/4.svg'}
                                        width={36}
                                        height={36}
                                        alt='1'
                                        style={{ width: 40 }}

                                    />
                                    <p className='text-base'>Lorem ipsum</p>
                                </div>
                            </div>

                            <div className='flex flex-row gap-6'>
                                <div className='basis-1/3'>
                                    <NumberInput min={1} placeholder='1' className='rounded-none h-10' />
                                </div>
                                <Button className='rounded-full px-10 font-bold text-lg basis-2/5 relative'>
                                    Quick BUY
                                    <div className='absolute bg-white rounded-full aspect-square h-full text-gray-500 font-bold flex items-center justify-center border border-primary right-0'><Heart /></div>
                                    <div className='absolute bg-white rounded-full aspect-square h-full text-gray-500 font-bold flex items-center justify-center border border-primary left-0'><Plus /></div>
                                </Button>
                            </div>

                            <p className='text-gray-500 font-bold italic'><span className='text-primary'>20</span> people are viewing this product</p>

                            <div className='relative pt-2'>
                                <div className="h-2.5 w-full rounded-full overflow-hidden relative 
                                            bg-[radial-gradient(circle,_#d1d5db_2px,_transparent_2px)] 
                                            [background-size:10px_10px]">
                                    <div
                                        style={{ width: `60%` }}
                                        className="absolute top-0 right-0 h-full bg-primary animate-stripes rounded-full"
                                    ></div>
                                </div>
                                <div className='absolute left-2/5 -translate-y-2/3 -translate-x-[20px]'>
                                    <Image
                                        src={'/game.png'}
                                        height={32}
                                        width={32}
                                        alt=''
                                        className=''
                                    />
                                </div>
                                <div className='text-end font-semibold text-gray-500 mt-1'><span className='text-primary'>Hurry up,</span> only <span className='text-primary'>7</span> items left</div>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <p>SKU: BE45VGRT</p>
                                <p>Category: Indoor</p>
                                <p>Tags: Chair, Airm chair</p>
                            </div>

                            <div className='flex flex-row items-center'>
                                <p className=''>Shared:</p>
                                <div className='flex flex-row gap-2 items-center'>
                                    <Facebook size={20} />
                                    <Twitter size={20} />
                                    <Youtube size={20} />
                                    <Instagram size={20} />
                                </div>
                            </div>


                        </div>
                    </div>

                    {/*Product bought together */}
                    <BoughtTogetherSection productDetails={productDetails} />

                    {/*Product tabs */}
                    <div className='xl:mt-12 mt-8'>
                        <ProductDetailsTab />
                    </div>

                    {/*Product related */}
                    <div></div>

                    {/*Product voucher */}
                    <div></div>
                </div>
                : ''}
        </div>
    )
}

export default ProductDetails