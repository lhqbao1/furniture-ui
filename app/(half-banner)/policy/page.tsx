// import ListPolicy from '@/components/layout/policy/list-policy'
// import { getPolicyItemsByVersion, getPolicyVersion } from '@/features/policy/api'
// import { QueryClient } from '@tanstack/react-query'
// import React from 'react'

// export default async function Policy() {
//     const queryClient = new QueryClient()

//     // fetchQuery để lấy data và cache luôn
//     const version = await queryClient.fetchQuery({
//         queryKey: ["policy-version"],
//         queryFn: () => getPolicyVersion(),
//         retry: false,
//     })
//     const firstVersion = version[0].id

//     await queryClient.prefetchQuery({
//         queryKey: ["policy-items", firstVersion],
//         queryFn: () => getPolicyItemsByVersion(firstVersion),
//         retry: false,
//     })

//     return (
//         <div className='w-full min-h-screen overflow-scroll'>
//             <ListPolicy versionId={firstVersion} />
//         </div>
//     )
// }

// app/policy/page.tsx
import ListPolicy from '@/components/layout/policy/list-policy'
import { getPolicyItemsByVersion, getPolicyVersion } from '@/features/policy/api'

export const revalidate = 3600 // ISR: regenerate mỗi 1h

export default async function Policy() {
    const version = await getPolicyVersion()
    const firstVersion = version[0].id
    const items = await getPolicyItemsByVersion(firstVersion)

    return (
        <div className="w-full min-h-screen overflow-scroll">
            <ListPolicy versionId={firstVersion} initialData={items} />
        </div>
    )
}
