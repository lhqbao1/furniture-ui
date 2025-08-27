import { useMutation } from "@tanstack/react-query"
import { uploadStaticFile } from "./api"
import { toast } from "sonner"

export function useUploadStaticFile() {
    return useMutation({
      mutationFn: (file: FormData) => uploadStaticFile(file),
      onSuccess: (res) => {
        toast.success('Image is choose')
      },
    })
  }