'use client'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ControllerRenderProps } from "react-hook-form"

const addresses = [
    {
        id: "home",
        label: "Home (default)",
        street: "Mauerweg 15A",
        city: "10117 Berlin",
        country: "Germany",
        recipient: "Jane (Mom)",
        phone: "+49 321316546",
    },
    {
        id: "office",
        label: "Office",
        street: "Schillerstraße 28",
        city: "80336 München",
        country: "Germany",
        recipient: "Marry (Secretary)",
        phone: "+49 32106546",
    },
    {
        id: "invoice",
        label: "Invoice address",
        street: "Mauerweg 15A",
        city: "10117 Berlin",
        country: "Germany",
        recipient: null,
        phone: null,
    },
]

type AddressSelectorProps = {
    field: {
        value: string
        onChange: (value: string) => void
    }
}

export default function AddressSelector({ field }: AddressSelectorProps) {
    return (
        <div className="space-y-2">
            <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-4" aria-labelledby="shipping-address-label">
                {addresses.map((address) => (
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
                <div className="flex justify-center items-center">
                    <Button className="bg-secondary hover:bg-secondary">Add shipping address</Button>
                </div>
            </RadioGroup>
        </div>
    )
}
