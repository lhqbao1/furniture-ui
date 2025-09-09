import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToViewed, getViewedProduct } from "./api";

// GET all viewed
export function useGetViewedProduct() {
    return useQuery({
      queryKey: ["viewed-product"],
      queryFn: () => getViewedProduct(),
    })
  }


// ADD viewed
export function useAddViewedProduct() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ productId }: { productId: string }) =>
        addToViewed(productId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["viewed-product"] })
      },
    })
  }