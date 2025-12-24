import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ContactFormInput,
  getContactForm,
  sendMessageTawk,
  uploadContactForm,
} from "./api";

export function useGetContactForm() {
  return useQuery({
    queryKey: ["contact-form"],
    queryFn: () => getContactForm(),
  });
}

export function useUploadContactForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ContactFormInput) => uploadContactForm(input),
    onSuccess: (res) => {
      qc.refetchQueries({ queryKey: ["contact-form"] });
    },
  });
}

export function useSendTawkMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ message, email }: { message: string; email: string }) =>
      sendMessageTawk({ message, email }),
    onSuccess: (res) => {},
  });
}
