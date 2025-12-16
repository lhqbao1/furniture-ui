import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importProduct, importProductSupplier, uploadStaticFile } from "./api";

export function useUploadStaticFile() {
  return useMutation({
    mutationFn: (file: FormData) => uploadStaticFile(file),
    onSuccess: (res) => {
      // toast.success('Image is choose')
    },
  });
}

export function useImportProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: FormData) => importProduct(file),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["products"] });
    },
  });
}

export function useImportProductsSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      supplier_id,
    }: {
      file: FormData;
      supplier_id: string;
    }) => importProductSupplier(file, supplier_id),
    onSuccess: () => {
      qc.refetchQueries({ queryKey: ["products"] });
    },
  });
}
