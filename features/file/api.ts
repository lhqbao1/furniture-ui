import api from "@/lib/axios";
export type StaticFileResponse = { status: string; url: string }


export async function uploadStaticFile(file: FormData){
    const {data} = await api.post('/static/upload', file, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    })
    return data as StaticFileResponse
}