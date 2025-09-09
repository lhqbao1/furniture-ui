import { apiFlexible } from "@/lib/axios";
import {  StaticFileResponse } from "@/types/products";


export async function uploadStaticFile(file: FormData){
    const {data} = await apiFlexible.post('/static/upload', file, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    })
    return data as StaticFileResponse
}
