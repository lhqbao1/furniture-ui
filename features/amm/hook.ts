import { useMutation, useQueryClient } from "@tanstack/react-query"
import { importAmmProduct } from "./api"

export function useImportAmmProducts() {
    // const qc = useQueryClient()
    return useMutation({
      mutationFn: (file: FormData) => importAmmProduct(file),
    //   onSuccess: () => {
    //     qc.refetchQueries({queryKey: ["products"]})
    //   },
    })
  }