import { useMutation } from "@tanstack/react-query"
import { uploadStaticFile } from "./api"

export function useUploadStaticFile() {
    return useMutation({
      mutationFn: (file: FormData) => uploadStaticFile(file),
      onSuccess: (res) => {
        // toast.success('Image is choose')
      },
    })
  }