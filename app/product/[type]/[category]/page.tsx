'use client'
import CustomBreadCrumb from '@/components/shared/breadcrumb'
import ColorPickerButton from '@/components/shared/color-picker-button'
import ImageSinglePicker, { SizeType } from '@/components/shared/image-single-picker'
import MaterialPicker from '@/components/shared/image-single-picker'
import ProductsGridLayout from '@/components/shared/products-grid-layout'
import RangePicker from '@/components/shared/range-picker'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

const colors = ['#28abe2', '#009244', '#c1282d', '#93278f']
const materials = ['Asset1.png', 'Asset2.png', 'Asset3.png', 'Asset4.png']
const brands = ['Asset11.png', 'Asset12.png', 'Asset13.png']
const tags = [
    {
        name: 'Top Rated',
        color: '#fba707'
    },
    {
        name: 'Featured',
        color: '#8cc63f'
    },
    {
        name: 'Sale',
        color: '#f15454',
    },
    {
        name: 'Trending',
        color: '#af01ff'
    },
    {
        name: 'New',
        color: '#2dc4b6',
    },
    {
        name: 'Best Seller',
        color: '#01bfff'
    }
]

const specialFeatures = ['waterproof', 'reclining', 'dustproof', 'natural fragrance', 'anti-moth', 'antifading']
const spaceFilter = ['Living room', 'Dining room', 'Outdoor', 'Office']
const originFilter = ['China (10-15 days)', 'Vietnam (7-10 days)', 'Thailand (12-17 days)', 'Malaysia (30-35 days)']


const ProductCategory = () => {
    const [choosedColor, setChoosedColor] = useState<string>('')
    const [choosedMaterial, setChoosedMaterial] = useState<string>('')
    const [choosedBrand, setChoosedBrand] = useState<string>('')
    const [isOldest, setIsOldest] = React.useState(false)
    const [isPriceLowest, setIsPriceLowest] = React.useState(false)
    const [isSearchedLowest, setIsSearchedLowest] = React.useState(false)
    const [selectedFeature, setSelectedFeature] = useState<string[]>([])

    const toggleSelect = (item: string) => {
        setSelectedFeature(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item) // bỏ chọn
                : [...prev, item] // thêm chọn
        )
    }



    const chooseColor = (color: string) => {
        setChoosedColor(color)
    }

    const chooseBrand = (brand: string) => {
        setChoosedBrand(brand)
    }

    const chooseMaterial = (material: string) => {
        setChoosedMaterial(material)
    }

    const params = useParams()
    const paramValues = Object.values(params)
    const category = paramValues[paramValues.length - 1]
    return (
        <div className='py-3'>
            <CustomBreadCrumb />
            <div className=''>
                <h2 className='text-center text-3xl font-bold capitalize text-secondary'>{category}</h2>
                <div className='filter-section'>
                    <div className='flex flex-row justify-end items-center gap-1'>
                        <SlidersHorizontal className='text-primary' />
                        <p className='text-lg'>Filter</p>
                    </div>

                    {/*Filter section */}
                    <div className='border border-gray-400 rounded-2xl w-full grid xl:grid-cols-12 grid-cols-2 p-6 pt-8 gap-6'>
                        {/* First column*/}
                        <div className='flex flex-col gap-10 xl:col-span-4 col-span-1'>
                            <div className='flex flex-row gap-4 items-center'>
                                <p className='text-black font-bold text-base'>Price</p>
                                <RangePicker minValue={0} maxValue={1000} step={10} />
                            </div>
                            <div className='flex flex-row gap-4 items-center'>
                                <p className='text-black font-bold text-base'>Color</p>
                                <div className='item-color flex flex-row gap-4 flex-1 justify-end'>
                                    {colors.map((item, index) => {
                                        return (
                                            <ColorPickerButton color={item} key={index} onClick={() => chooseColor(item)} active={choosedColor === item} />
                                        )
                                    })}
                                </div>
                            </div>
                            <div className='flex flex-row gap-4 items-center'>
                                <p className='text-black font-bold text-base'>Material</p>
                                <div className='item-color flex flex-row gap-4 flex-1 justify-end'>
                                    {materials.map((item, index) => {
                                        return (
                                            <ImageSinglePicker key={index} size={SizeType.Icon} item={item} onClick={() => chooseMaterial(item)} active={choosedMaterial === item} />
                                        )
                                    })}
                                </div>
                            </div>
                            <div className='flex flex-row gap-4 items-center'>
                                <p className='text-black font-bold text-base'>Brand</p>
                                <div className='item-color flex flex-row gap-4 flex-1 justify-end items-center'>
                                    {brands.map((item, index) => {
                                        return (
                                            <ImageSinglePicker key={index} size={SizeType.Image} item={item} onClick={() => chooseBrand(item)} active={choosedBrand === item} />
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Second column*/}
                        <div className='flex flex-col gap-4 xl:col-span-3 col-span-1'>
                            <div className='flex flex-col'>
                                <p className='text-black font-bold text-base'>Size(cm)</p>
                                <div className='relative flex flex-row justify-center'>
                                    <Image
                                        src={'/Asset10.png'}
                                        width={100}
                                        height={100}
                                        alt=''
                                        className='scale-115'
                                    />
                                    <Input className='absolute -top-8 right-19 w-18 h-6' placeholder='length' />
                                    <Input className='absolute top-2.5 -left-1 w-16 h-6' placeholder='width' />
                                    <Input className='absolute top-9 -right-2 w-18 h-6' placeholder='height' />
                                </div>
                            </div>

                            {/* Status sort*/}
                            <div className='flex flex-col'>
                                <p className='text-black font-bold text-base'>Price</p>
                                <div className="flex flex-row items-center gap-4">
                                    {/* Newest */}
                                    <p
                                        className={`text-base font-semibold ${!isPriceLowest ? "text-primary" : "text-gray-600"
                                            }`}
                                    >
                                        Highest
                                    </p>

                                    <Switch checked={isPriceLowest} onCheckedChange={setIsPriceLowest} />

                                    {/* Oldest */}
                                    <p
                                        className={`text-base font-semibold ${isPriceLowest ? "text-primary" : "text-gray-600"
                                            }`}
                                    >
                                        Lowest
                                    </p>
                                </div>
                            </div>

                            {/* Price sort*/}
                            <div className='flex flex-col'>
                                <p className='text-black font-bold text-base'>Price</p>
                                <div className="flex flex-row items-center gap-4">
                                    {/* Newest */}
                                    <p
                                        className={`text-base font-semibold ${!isOldest ? "text-primary" : "text-gray-600"
                                            }`}
                                    >
                                        Newest
                                    </p>

                                    <Switch checked={isOldest} onCheckedChange={setIsOldest} />

                                    {/* Oldest */}
                                    <p
                                        className={`text-base font-semibold ${isOldest ? "text-primary" : "text-gray-600"
                                            }`}
                                    >
                                        Oldest
                                    </p>
                                </div>
                            </div>

                            {/* Searched sort*/}
                            <div className='flex flex-col'>
                                <p className='text-black font-bold text-base'>Searched</p>
                                <div className="flex flex-row items-center gap-4">
                                    {/* Newest */}
                                    <p
                                        className={`text-base font-semibold ${!isSearchedLowest ? "text-primary" : "text-gray-600"
                                            }`}
                                    >
                                        Highest
                                    </p>

                                    <Switch checked={isSearchedLowest} onCheckedChange={setIsSearchedLowest} />

                                    {/* Oldest */}
                                    <p
                                        className={`text-base font-semibold ${isSearchedLowest ? "text-primary" : "text-gray-600"
                                            }`}
                                    >
                                        Lowest
                                    </p>
                                </div>
                            </div>


                        </div>

                        {/* Third column*/}
                        <div className='flex flex-col gap-8 xl:col-span-3 col-span-1'>
                            <div className='flex flex-col gap-2'>
                                <p className='text-black font-bold text-base'>Tag</p>
                                <div className='flex flex-row gap-2 flex-wrap'>
                                    {tags.map((item, index) => {
                                        return (
                                            <div style={{ background: `${item.color}` }} key={index} className='rounded-xl text-xs py-1 uppercase px-2 text-white'>{item.name}</div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <p className='text-black font-bold text-base'>Special Features</p>
                                <div className='flex flex-row gap-2 flex-wrap'>
                                    {specialFeatures.map((item, index) => {
                                        const isSelected = selectedFeature.includes(item)
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => toggleSelect(item)}
                                                className={`cursor-pointer rounded-sm text-xs py-1 px-2 capitalize border ${isSelected
                                                    ? "border-primary text-primary"
                                                    : "border-black text-black"
                                                    }`}
                                            >
                                                {item}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Fourth column*/}
                        <div className='flex flex-col gap-8 xl:col-span-2 col-span-1'>
                            {/* Categories filter*/}
                            <div className='flex flex-col gap-2'>
                                <p className='text-black font-bold text-base'>Categories</p>
                                <Select>
                                    <SelectTrigger className="!text-primary border">
                                        <SelectValue placeholder="Chair" className='!text-primary' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="chair" className='font-semibold '>Chair</SelectItem>
                                        <SelectItem value="table" className='font-semibold '>Table</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Space filter*/}
                            <div className='flex flex-col gap-2'>
                                <p className='text-black font-bold text-base'>Space</p>
                                <div className='flex flex-col gap-2'>
                                    {spaceFilter.map((item, index) => {
                                        return (
                                            <div key={index} className='flex flex-row gap-1.5'>
                                                <Checkbox id="terms" />
                                                <Label htmlFor="terms" className='text-xs'>{item}</Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Origin filter*/}
                            <div className='flex flex-col gap-2'>
                                <p className='text-black font-bold text-base'>Origin</p>
                                <div className='flex flex-col gap-2'>
                                    {originFilter.map((item, index) => {
                                        return (
                                            <div key={index} className='flex flex-row gap-1.5'>
                                                <Checkbox id="terms" />
                                                <Label htmlFor="terms" className='text-xs'>{item}</Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className='col-span-12 flex flex-row justify-center gap-2'>
                            <Button variant='outline' className='rounded-full px-8 text-lg text-gray-600'>Clear</Button>
                            <Button className='rounded-full px-20 text-lg font-bold'>Apply</Button>
                        </div>
                    </div>

                    {/*Products section */}
                    <div className='pt-10 pb-12'>
                        <ProductsGridLayout hasBadge />
                    </div>

                </div>
            </div>
        </div >
    )
}

export default ProductCategory