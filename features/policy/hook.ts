import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChildLegalInput, createChildLegalPolicy, createLegalPolicy, createVersion, getPolicyItemsByVersion, getPolicyVersion } from "./api";

export function useGetPolicyVersion(){
    return useQuery({
       queryKey: ["policy-version"],
       queryFn: () => getPolicyVersion(),
       retry: false,
     })
}

export function useGetPolicyItemsByVersion(version: string) {
  return useQuery({
    queryKey: ["policy-items", version],
    queryFn: () => getPolicyItemsByVersion(version),
    enabled: !!version,
    retry: false,
  })
}

export function useCreateVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createVersion(name),
    onSuccess: (data) => {
      console.log("Tạo version thành công:", data)
      qc.invalidateQueries({queryKey: ['policy-version']})
      // chỗ này bạn có thể refetch list version, hoặc show toast
    },
    onError: (error) => {
      console.error("Lỗi khi tạo version:", error)
    },
  })
}

export function useCreateLegalPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({name, version_id} : {name: string, version_id: string}) => createLegalPolicy(name,version_id),
    onSuccess: (data) => {
      console.log("Tạo legal policy thành công:", data)
      qc.invalidateQueries({queryKey: ['policy-items']})
      // chỗ này bạn có thể refetch list version, hoặc show toast
    },
    onError: (error) => {
      console.error("Lỗi khi tạo legal policy:", error)
    },
  })
}

export function useCreateChildLegalPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({input, legal_policy_id} : {input: ChildLegalInput[], legal_policy_id: string}) => createChildLegalPolicy(input,legal_policy_id),
    onSuccess: (data) => {
      console.log("Tạo child legal policy thành công:", data)
      qc.invalidateQueries({queryKey: ['policy-items']})
      // chỗ này bạn có thể refetch list version, hoặc show toast
    },
    onError: (error) => {
      console.error("Lỗi khi tạo child legal policy:", error)
    },
  })
}