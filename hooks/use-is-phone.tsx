import React from "react"
import { useMediaQuery } from "react-responsive"

export function useIsPhone() {
    const [mounted, setMounted] = React.useState(false)
    const isPhone = useMediaQuery({ maxWidth: 650 })

    React.useEffect(() => {
        setMounted(true)
    }, [])

    return mounted ? isPhone : undefined
}
