'use client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { brands, colors, materials, originFilter, spaceFilter, specialFeatures, tags } from '@/data/data'
import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import RangePicker from '@/components/shared/range-picker'
import ColorPickerButton from '@/components/shared/color-picker-button'
import ImageSinglePicker, { SizeType } from '@/components/shared/image-single-picker'
import Image from 'next/image'
import { Input } from '@/components/ui/input'

const FilterSection = () => {
    const [selectedFeature, setSelectedFeature] = useState<string[]>([])
    const [choosedColor, setChoosedColor] = useState<string>('')
    const [choosedMaterial, setChoosedMaterial] = useState<string>('')
    const [choosedBrand, setChoosedBrand] = useState<string>('')
    const [isOldest, setIsOldest] = React.useState(false)
    const [isPriceLowest, setIsPriceLowest] = React.useState(false)
    const [isSearchedLowest, setIsSearchedLowest] = React.useState(false)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)

    const chooseColor = (color: string) => {
        setChoosedColor(color)
    }

    const chooseBrand = (brand: string) => {
        setChoosedBrand(brand)
    }

    const chooseMaterial = (material: string) => {
        setChoosedMaterial(material)
    }

    const toggleSelect = (item: string) => {
        setSelectedFeature(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item) // bỏ chọn
                : [...prev, item] // thêm chọn
        )
    }
    return (
        <div className='border border-gray-400 rounded-2xl w-full grid xl:grid-cols-12 grid-cols-2 p-6 pt-8 gap-8'>
            {/* First column*/}
            <div className='flex flex-col gap-10 xl:col-span-3 col-span-1'>
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
                    <p className='text-black font-bold text-base'>Size (cm)</p>
                    <div className='relative flex flex-row justify-center'>
                        <Image
                            src={'/Asset10.png'}
                            width={100}
                            height={100}
                            alt=''
                            className='scale-115'
                        />
                        <Input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="absolute -top-8 right-19 w-18 h-6 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="length"
                        />
                        <Input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="absolute top-2.5 -left-1 w-16 h-6 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="width"
                        />
                        <Input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="absolute top-9 -right-2 w-18 h-6 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="height"
                        />


                    </div>
                </div>

                {/* Status sort*/}
                <div className='flex flex-col'>
                    <p className='text-black font-bold text-base'>Status</p>
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

            {/* Fourth column*/}
            <div className='flex flex-col gap-8 xl:col-span-3 col-span-1 xl:pr-4 pr-0'>
                {/* Categories filter*/}
                <div className='flex flew-row items-center gap-2'>
                    <p className='text-black font-bold text-base'>Categories</p>
                    <Select>
                        <SelectTrigger className="!text-primary border w-full justify-between" iconColor='black'>
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
                                <div key={index} className='flex flex-row gap-2.5 items-center'>
                                    <Checkbox id="terms" />
                                    <Label htmlFor="terms" className='text-sm'>{item}</Label>
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
                                <div key={index} className='flex flex-row gap-2.5 items-center'>
                                    <Checkbox id="terms" />
                                    <Label htmlFor="terms" className='text-sm'>{item}</Label>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Third column*/}
            <div className='flex flex-col gap-8 xl:col-span-3 col-span-1'>
                <div className='flex flex-col gap-2'>
                    <p className='text-black font-bold text-base'>Tag</p>
                    <div className='flex flex-row gap-2 flex-wrap'>
                        {tags.map((item, index) => {
                            const isSelected = selectedTag === item.name
                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedTag(item.name)}
                                    style={{ background: item.color }}
                                    className={`
          rounded-xl text-xs py-1 uppercase px-2 text-white cursor-pointer
          ${isSelected ? "ring ring-primary ring-offset-2" : ""}
        `}
                                >
                                    {item.name}
                                </div>
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



            <div className='col-span-12 flex flex-row justify-center gap-2'>
                <Button variant='outline' className='rounded-full px-8 text-lg text-gray-600'>Clear</Button>
                <Button className='rounded-full px-20 text-lg font-bold'>Apply</Button>
            </div>
        </div>
    )
}

export default FilterSection