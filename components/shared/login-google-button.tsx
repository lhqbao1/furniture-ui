import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'

const LoginGoogleButton = () => {
    const handleLoginGoogle = async () => {
        // Gọi thẳng đến backend bằng redirect, không dùng axios
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}google/login`;
    };
    return (
        <div className="flex flex-col gap-4 justify-center items-center mt-8">
            <Button
                className="w-full"
                variant={'outline'}
                onClick={() => handleLoginGoogle()}
            >
                <Image
                    src={'/google.svg'}
                    width={20}
                    height={20}
                    alt=""
                />
                Continue with Google
            </Button>
        </div>
    )
}

export default LoginGoogleButton