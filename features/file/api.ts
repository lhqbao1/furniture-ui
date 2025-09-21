import {  apiPublic } from "@/lib/axios";
import {  StaticFileResponse } from "@/types/products";


export async function uploadStaticFile(file: FormData){
    const {data} = await apiPublic.post('/static/upload', file, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    })
    return data as StaticFileResponse
}
