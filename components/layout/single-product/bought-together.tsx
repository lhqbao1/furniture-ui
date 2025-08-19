import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Product } from '@/types/products'
import { Equal, Heart, Plus } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

interface BoughtTogetherSectionProps {
    productDetails: Product
}

const BoughtTogetherSection = ({ productDetails }: BoughtTogetherSectionProps) => {
    return (
        <div>
            <h3 className='text-2xl text-secondary font-semibold xl:mb-6 mb-3'>Frequenly bought togheter</h3>
            <div className='flex flex-row items-center justify-start gap-0'>
                <div className='flex flex-col items-center gap-4'>
                    <Image
                        src={productDetails.image}
                        alt=''
                        width={300}
                        height={200}
                        className=''
                    />
                    <div className='flex flex-col items-center'>
                        <p>{productDetails.name}</p>
                        <div className="flex items-center gap-2">
                            <Checkbox id="terms" defaultChecked />
                            <div className="flex items-center gap-2">
                                <Label htmlFor="terms" className='text-primary text-xl font-semibold'>{productDetails.salePrice}€</Label>
                                <p className='text-xl text-gray-300 line-through font-semibold'>{productDetails.price}€</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Plus size={100} fill='gray' className='text-gray-400' />

                <div className='flex flex-col items-center gap-4'>
                    <Image
                        src={productDetails.image}
                        alt=''
                        width={300}
                        height={200}
                        className=''
                    />
                    <div className='flex flex-col items-center relative w-full'>
                        <p>{productDetails.name}</p>
                        <div className="flex items-center gap-2">
                            <Checkbox id="terms" defaultChecked />
                            <div className="flex items-center gap-2">
                                <Label htmlFor="terms" className='text-primary text-xl font-semibold'>{productDetails.salePrice}€</Label>
                                <p className='text-xl text-gray-300 line-through font-semibold'>{productDetails.price}€</p>
                            </div>
                        </div>
                        <div className='absolute -bottom-2 translate-y-full w-fit'>
                            <Select>
                                <SelectTrigger className="w-full text-gray-600 border border-gray-400 data-[placeholder]:text-gray-600" iconColor='#4a5565'>
                                    <SelectValue placeholder="Round" className='text-gray-600' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Round</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                </div>
                <Plus size={100} fill='gray' className='text-gray-400' />

                <div className='flex flex-col items-center gap-4'>
                    <Image
                        src={productDetails.image}
                        alt=''
                        width={300}
                        height={200}
                        className=''
                    />
                    <div className='flex flex-col items-center'>
                        <p>{productDetails.name}</p>
                        <div className="flex items-center gap-2">
                            <Checkbox id="terms" defaultChecked />
                            <div className="flex items-center gap-2">
                                <Label htmlFor="terms" className='text-primary text-xl font-semibold'>{productDetails.salePrice}€</Label>
                                <p className='text-xl text-gray-300 line-through font-semibold'>{productDetails.price}€</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Equal size={100} fill='gray' className='text-gray-400' />

                <div className='flex flex-col gap-4 ml-2 flex-1'>
                    <div className='flex gap-2'>
                        <p className='text-primary text-3xl font-semibold'>€310</p>
                        <p className='text-gray-300 line-through text-3xl font-semibold'>€370</p>
                    </div>
                    <div className='text-gray-500 text-xl font-semibold'>
                        <p>Item saved €130</p>
                        <p>Combo saved €50</p>
                        <p>Total saved €180</p>
                    </div>
                    <Button className='rounded-full px-10 font-bold text-lg basis-2/5 relative'>
                        Order
                        <div className='absolute bg-white rounded-full aspect-square h-full text-gray-500 font-bold flex items-center justify-center border border-primary right-0'><Heart /></div>
                        <div className='absolute bg-white rounded-full aspect-square h-full text-gray-500 font-bold flex items-center justify-center border border-primary left-0'><Plus /></div>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default BoughtTogetherSection