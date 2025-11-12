export const config = {
  regions: ['fra1'],
};

import { api, apiAdmin } from "@/lib/axios"
import { PolicyResponse, PolicyVersion } from "@/types/policy"

export interface ChildLegalInput {
    label: string
    content: string
    tt?: number
}

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

  export async function createVersion(name?: string | null) {
    const { data } = await apiAdmin.post("/policy/version", { name })
    return data
  }

  export async function createLegalPolicy(name: string, version_id:string) {
    const { data } = await apiAdmin.post(`/policy/legal/${version_id}`, { name })
    return data
  }

  export async function createChildLegalPolicy(input: ChildLegalInput[], legal_policy_id: string) {
    const { data } = await apiAdmin.post(`/policy/child-legal/${legal_policy_id}`, input)
    return data
  }
  