// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { useGetUserById } from "@/features/users/hook"
// import { useUploadStaticFile } from "@/features/file/hook"
// import { useSendMail } from "@/features/mail/hook"

// export default function InvoiceClient({ pdfUrl }: { pdfUrl: string }) {
//     const router = useRouter()
//     const [userId, setUserId] = useState<string | null>(null)
//     const [counter, setCounter] = useState(5)

//     // Lấy userId từ localStorage
//     useEffect(() => {
//         const id = localStorage.getItem("userId")
//         if (id) setUserId(id)
//     }, [])

//     const { data: user } = useGetUserById(userId || "")
//     const uploadMutation = useUploadStaticFile()
//     const sendMailMutation = useSendMail()

//     // Xử lý upload + gửi mail
//     useEffect(() => {
//         const process = async () => {
//             if (!user) return
//             try {
//                 const res = await fetch(pdfUrl)
//                 if (!res.ok) throw new Error("Không tải được PDF")
//                 const blob = await res.blob()
//                 const file = new File([blob], "invoice.pdf", { type: "application/pdf" })
//                 const formData = new FormData()
//                 formData.append("file", file)

//                 const uploadRes = await uploadMutation.mutateAsync(formData)
//                 await sendMailMutation.mutateAsync({
//                     to_email: user.email,
//                     attachment_url: uploadRes.url,
//                 })
//             } catch (err) {
//                 console.error(err)
//             }
//         }
//         process()
//     }, [user, pdfUrl, uploadMutation, sendMailMutation])

//     // Redirect sau 5s
//     useEffect(() => {
//         if (counter <= 0) {
//             router.push("/")
//             return
//         }
//         const timer = setTimeout(() => setCounter(prev => prev - 1), 1000)
//         return () => clearTimeout(timer)
//     }, [counter, router])

//     return null
// }
