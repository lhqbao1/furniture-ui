import { z } from "zod"


// Định nghĩa schema
export const CreateOrderSchema = z.object({
    shipping_address_id: z.string().optional(),
    invoice_address_id: z.string().optional(),
    cart_id: z.string().optional(),
    payment_method: z.string().min(1, "You need to choose payment method"),
    note: z.string().optional().nullable(),
    voucher_amount: z.number().optional().nullable(),
    terms: z.boolean().refine(val => val === true),

    first_name: z.string().min(1, "First name required"),
    last_name: z.string().min(1, "Last name required"),
    invoice_address_line: z.string().min(1),
    invoice_postal_code: z.string().min(1),
    invoice_city: z.string().min(1),
    email: z.string().min(1).email(),
    phone_number: z.string().min(6),

    shipping_address_line: z.string().min(1),
    shipping_postal_code: z.string().min(1),
    shipping_city: z.string().min(1),

    password: z.string().min(8).optional(),
confirmPassword: z.string().min(1).optional(),
}).refine((data) => {
    if (!data.password && !data.confirmPassword) return true;
    return data.password === data.confirmPassword;
}, {
    path: ["confirmPassword"],
    message: "Passwords must match",
})


// Export type ra ngoài component
export type CreateOrderFormValues = z.infer<typeof CreateOrderSchema>