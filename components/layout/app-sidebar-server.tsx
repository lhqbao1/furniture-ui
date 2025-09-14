import { serverGetCategories } from "@/features/category/api"
import AppSidebarClient from "./app-sidebar"

export default async function AppSidebarServer() {
    const categories = await serverGetCategories()
    return <AppSidebarClient categories={categories} />
}