import api from "@/lib/axios";
import { StaticFile, StaticFileResponse } from "@/types/products";


export async function uploadStaticFile(file: FormData){
    const {data} = await api.post('/static/upload', file, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    })
    return data as StaticFileResponse
}