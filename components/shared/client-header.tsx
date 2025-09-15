'use client'
import React from 'react'
import PageHeader from './header'

interface HeaderClientProps {
    hasSideBar?: boolean
}

const HeaderClient = ({ hasSideBar }: HeaderClientProps) => {
    return (
        <PageHeader hasSideBar={hasSideBar} />
    )
}

export default HeaderClient