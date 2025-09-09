import { api } from "@/lib/axios"
import { PolicyResponse, PolicyVersion } from "@/types/policy"

export async function getPolicyVersion() {
    const {data} = await api.get(
        '/policy/version',
    )
    return data as PolicyVersion[]
}

export async function getPolicyItemsByVersion(version: string) {
    const {data} = await api.get(
        `/policy/version/details/${version}`,
    )
    return data as PolicyResponse 
  }