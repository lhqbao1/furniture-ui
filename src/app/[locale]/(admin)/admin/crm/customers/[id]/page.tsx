'use client'
import CustomerInformation from "@/components/layout/admin/customer-detail/customer-infomation"
import InvoiceAddress from "@/components/layout/admin/customer-detail/invoice-address"
import ListOrder from "@/components/layout/admin/customer-detail/list-order"
import Question from "@/components/layout/admin/customer-detail/question"
import Review from "@/components/layout/admin/customer-detail/review"
import ShippingAddress from "@/components/layout/admin/customer-detail/shipping-address"
import { useGetUserByIdAdmin } from "@/features/users/hook"
import { useParams } from "next/navigation"

const CustomerDetail = () => {
    const { id } = useParams<{ id: string }>() // Lấy id từ params
    const { data, isLoading, isError } = useGetUserByIdAdmin(id!)

    if (isLoading || !data) return <p>Đang tải dữ liệu...</p>
    if (isError) return <p>Có lỗi khi tải dữ liệu.</p>

    return (
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-3 space-y-8">
                <CustomerInformation
                    email={data.email}
                    first_name={data.first_name}
                    last_name={data.last_name}
                    language={data.language}
                    phone_number={data.phone_number}
                    user_code={data.user_code}
                    created_at={data.created_at}
                    currentUser={data}
                />
                <ShippingAddress
                    userId={data.id}
                />

                <InvoiceAddress
                    userId={data.id}
                />
            </div>
            <div className="col-span-9 space-y-8">
                <ListOrder userId={data.id} />
                <div className="grid grid-cols-2 gap-4">
                    <Question userId={data.id} />
                    <Review />
                </div>
            </div>
        </div>
    )
}

export default CustomerDetail