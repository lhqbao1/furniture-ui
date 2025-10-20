export const config = {
    regions: ['fra1'],
  };
  
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

export async function importProduct(file: FormData){
    const {data} = await apiPublic.post('/import-products', file, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    })
    return data
}
