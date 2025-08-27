import React, { useCallback } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Account, accountSchema } from '@/lib/schema/account'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { addresses } from '@/data/data'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'


const AccountDetails = () => {
    const form = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            first_name: "William",
            last_name: "Gate",
            email: "william.gate@gmail.com",
            phone: "+49-32131 6546",
            mobile: "+49 6546 7898",
            shipping_address: "Mauereweg 15A, 10117 Berlin",
            invoice_address: "Musterweg 7, 20095 Hamburg",
            language: "English",
            dob: "1996-07-31",
            current_password: "",
            new_password: "",
            confirm_password: "",
            promotions: true,
        },
    })

    const onSubmit = useCallback((data: Account) => {
        console.log("Selected shipping address:", data)
    }, [])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="first_name" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="last_name" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                    <FormField name="phone" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="mobile" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mobile</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                {/* Addresses */}
                <FormField name="shipping_address" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            <span>Shipping Address</span>
                            <div className="flex justify-center items-center">
                                <Button className="bg-secondary hover:bg-secondary">Add shipping address</Button>
                            </div>
                        </FormLabel>
                        <FormControl>
                            <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-4" aria-labelledby="shipping-address-label">
                                {addresses.slice(0, 2).map((address) => (
                                    <Card key={address.id} className={field.value === address.id ? "border-primary" : ""}>
                                        <CardHeader className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem value={address.id} id={address.id} />
                                                <Label htmlFor={address.id} className="text-lg font-semibold">
                                                    {address.label}
                                                </Label>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground space-y-1">
                                            <p>{address.street}</p>
                                            <p>{address.city}</p>
                                            <p>{address.country}</p>
                                            {address.recipient && <p>Recipient: {address.recipient}</p>}
                                            {address.phone && <p>{address.phone}</p>}
                                        </CardContent>
                                        <CardFooter>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">Edit</Button>
                                                <Button variant="outline" size="sm" className="text-red-500">Remove</Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField name="invoice_address" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Invoice Address</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* Preferences */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="language" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Language</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="dob" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                {/* Notifications */}
                <FormField name="promotions" control={form.control} render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="mb-0">Receive Promotions</FormLabel>
                    </FormItem>
                )} />

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-6">
                    <Button variant="destructive" type="button">Delete Account</Button>
                    <Button variant="outline" type="button" className='bg-gray-400 text-white hover:bg-gray-400 hover:text-white'>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Form>

    )
}

export default AccountDetails