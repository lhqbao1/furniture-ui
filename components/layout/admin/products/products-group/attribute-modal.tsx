import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateVariant } from '@/features/variant/hook'
import { toast } from 'sonner'
import { useFormContext } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface AttributesModalProps {
    dialogOpen: boolean
    setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AttributesModal = ({ dialogOpen, setDialogOpen }: AttributesModalProps) => {
    const { watch } = useFormContext()
    const parent_id = watch('parent_id')
    const [attr, setAttr] = useState("")
    const [isImage, setIsImage] = useState<boolean>(false)


    const createVariantMutation = useCreateVariant()

    const handleCreateVariant = (name: string) => {
        createVariantMutation.mutate({ parent_id, name, is_img: isImage }, {
            onSuccess(data, variables, context) {
                toast.success("Product attributes created")
                setDialogOpen(false)
                setAttr('')
            },
            onError(error, variables, context) {
                toast.error("Product attributes created fail")
            },
        })
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button
                type="button"
                variant={'ghost'}
                className='text-secondary hover:bg-secondary hover:text-white'
                onClick={() => {
                    if (!parent_id) {
                        toast.error("You need to choose a parent before choose or create an attributes")
                        return
                    } else {
                        setDialogOpen(true)
                    }
                }}
            >
                Add Attributes
            </Button>
            <DialogContent className="w-1/3">
                <DialogHeader>
                    <DialogTitle>Add Product Attributes</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label className="mb-2 block text-sm font-medium">Variant type</Label>
                        <RadioGroup
                            className="flex gap-4"
                            value={isImage ? "image" : "text"}
                            onValueChange={(val) => setIsImage(val === 'image')}
                        >
                            <div className="flex items-center gap-1">
                                <RadioGroupItem value="image" id="image" />
                                <Label htmlFor="image">Image option</Label>
                            </div>
                            <div className="flex items-center gap-1">
                                <RadioGroupItem value="text" id="text" />
                                <Label htmlFor="text">Text option</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <Input
                        value={attr}
                        onChange={(e) => setAttr(e.target.value)}
                        placeholder="Product Attributes ex: Materials"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                if (attr.trim()) {
                                    handleCreateVariant(attr.trim())
                                } else {
                                    toast.error("Please enter group name")
                                }
                            }
                        }}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={createVariantMutation.isPending}
                            onClick={() => {
                                if (attr.trim()) {
                                    handleCreateVariant(attr.trim())
                                } else {
                                    toast.error("Please enter group name")
                                }
                            }}
                        >
                            {createVariantMutation.isPending ? <Loader2 className="animate-spin" /> : "Save"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AttributesModal