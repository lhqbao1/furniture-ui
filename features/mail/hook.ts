import { MailFormValues } from "@/types/mail";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMail } from "./api";

export function useSendMail(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (item: MailFormValues) => sendMail(item),
        onSuccess: () => {
            // qc.refetchQueries({ queryKey: ["checkout"] })
        },
    })
}