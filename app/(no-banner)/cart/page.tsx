'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BadgePercent, Minus, Plus, Trash, X } from "lucide-react"
import Image from 'next/image'
import { Input } from '@/components/ui/input'

type CartItem = {
    id: number
    name: string
    color: string
    size: string
    price: number
    quantity: number
    image: string
}

const sampleData: CartItem[] = [
    {
        id: 1,
        name: "Dining Table",
        color: "White",
        size: "L",
        price: 48,
        quantity: 3,
        image: "1.png",
    },
    {
        id: 2,
        name: "Modern Sofa",
        color: "Brown",
        size: "S",
        price: 67,
        quantity: 6,
        image: "2.png",
    },
    {
        id: 3,
        name: "Versatile Storage",
        color: "Red",
        size: "M",
        price: 42,
        quantity: 4,
        image: "3.png",
    },
    {
        id: 4,
        name: "Floor Lamp",
        color: "Green",
        size: "L",
        price: 39,
        quantity: 2,
        image: "4.png",
    },
]
const CartPage = () => {
    const [cart, setCart] = useState<CartItem[]>(sampleData)

    const increaseQty = (id: number) => {
        setCart((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
        )
    }

    const decreaseQty = (id: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        )
    }

    const removeItem = (id: number) => {
        setCart(cart.filter(item => item.id !== id))
    }

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <div>
            <div className='text-center xl:text-5xl text-3xl bg-gray-100 xl:py-10 py-4'>
                <Link href={'/'} className='cursor-pointer space-x-2'>
                    <span className='text-primary font-libre font-bold'>Prestige</span>
                    <span className='text-secondary font-libre font-bold'>Home</span>
                </Link>
            </div>
            <div className='container-padding'>
                <div className="w-full max-w-6xl mx-auto p-6">
                    <div className="grid grid-cols-12 xl:gap-16 gap-6">

                        {/* Left: Cart Items */}
                        <div className="col-span-12 md:col-span-8">
                            <div className='flex justify-between items-center'>
                                <h2 className="text-xl font-bold mb-6">Shopping Cart</h2>
                                <p className='text-xl font-bold mb-6'>({sampleData.length} items)</p>
                            </div>
                            <Table>
                                <TableHeader className='border-t'>
                                    <TableRow className=''>
                                        <TableHead className='py-4 max-h-none h-fit text-base text-gray-500'>Product Details</TableHead>
                                        <TableHead className='py-4 max-h-none h-fit text-base text-gray-500'>Price</TableHead>
                                        <TableHead className="py-4 max-h-none h-fit text-base text-gray-500 text-start">Quantity</TableHead>
                                        <TableHead className='py-4 max-h-none h-fit text-base text-gray-500'>Total</TableHead>
                                        <TableHead className='py-4 max-h-none h-fit text-base text-gray-500'></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className='xl:py-10 py-3'>
                                                <div className="flex items-center gap-3">
                                                    <Image src={`/${item.image}`} alt={item.name} width={60} height={60} className="rounded" />
                                                    <div>
                                                        <p className="font-semibold">{item.name}</p>
                                                        <p className="text-sm text-gray-500">Color: {item.color}</p>
                                                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-primary">€{item.price.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => decreaseQty(item.id)}>-</Button>
                                                    <span className="px-2">{item.quantity}</span>
                                                    <Button variant="outline" size="sm" onClick={() => increaseQty(item.id)}>+</Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">{(item.price * item.quantity).toFixed(2)}$</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" className="text-red-500 cursor-pointer" onClick={() => removeItem(item.id)}><Trash /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Right: Summary */}
                        <Card className="p-4 col-span-12 md:col-span-4 h-fit px-0 border-0 shadow-none bg-zinc-100/55 rounded-xl">
                            <CardHeader className="pb-0 [.border-b]:pb-0 border-b">
                                <CardTitle className="text-xl font-bold text-center">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Apply Coupon */}
                                <div className="flex items-center gap-2">
                                    <BadgePercent className="w-5 h-5 text-muted-foreground" />
                                    <Input placeholder="Apply Coupons" className="flex-1" />
                                    <Button className='bg-secondary'>Apply</Button>
                                </div>

                                {/* Product Details */}
                                <div className="space-y-2">
                                    <p className="font-semibold">Product Details:</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Sub Total</span>
                                        <span className="font-medium">$792.99</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium">$08.00</span>
                                    </div>
                                </div>

                                {/* Grand Total */}
                                <div className="xl:py-7 py-3 border-t border-b space-y-4">
                                    <div className="flex justify-between text-base font-semibold">
                                        <span>Grand Total</span>
                                        <span className="text-red-500">$800.99</span>
                                    </div>
                                    {/* Checkout Button */}
                                    <Button className="w-full bg-primary py-5">
                                        PROCEED TO CHECKOUT
                                    </Button>
                                </div>


                                {/* Info */}
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>🔒</span> Safe and Secure Payments, Easy Returns. <br />
                                    100% Authentic Products
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage