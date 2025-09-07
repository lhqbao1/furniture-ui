import { useQuery } from "@tanstack/react-query";
import { getPolicyItemsByVersion, getPolicyVersion } from "./api";

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