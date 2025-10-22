import React from 'react'

interface CustomerInformation {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    language: string
    user_code: string
}

const CustomerInformation = ({ first_name, last_name, email, phone_number, language, user_code }: CustomerInformation) => {
    return (
        <div className='px-4 py-2 space-y-2 border rounded-xl'>
            <div>Username: {first_name} {last_name}</div>
            <div>Email: {email}</div>
            <div>Phone number: {phone_number}</div>
            <div>Language: {language}</div>
            <div>User ID: {user_code}</div>
        </div>
    )
}

export default CustomerInformation