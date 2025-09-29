import { apiAdmin } from "@/lib/axios";

export async function importAmmProduct(file: FormData){
    const {data} = await apiAdmin.post('/amm/import-weavis', file, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    })
    return data
}