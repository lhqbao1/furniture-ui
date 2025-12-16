"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getPolicyItemsByVersion } from "@/features/policy/api";
import { useGetPolicyVersion } from "@/features/policy/hook";
import { useQuery } from "@tanstack/react-query";

export default function AGBDialogTrigger({ t }: { t: any }) {
  const {
    data: versions,
    isLoading: isLoadingVersions,
    isError: isErrorVersions,
  } = useGetPolicyVersion();

  const firstVersionId = versions?.[0]?.id;

  const {
    data: policyList,
    isLoading: isLoadingPolicyList,
    isError: isErrorPolicyList,
  } = useQuery({
    queryKey: ["policy-items", firstVersionId],
    queryFn: () => getPolicyItemsByVersion(firstVersionId ?? ""),
    enabled: !!firstVersionId,
    retry: false,
  });

  return (
    <Dialog>
      <DialogTrigger className="text-secondary underline cursor-pointer">
        {t("agb")}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("agb")}</DialogTitle>
        </DialogHeader>

        {/* 📌 Bạn bỏ nội dung AGB vào đây */}
        <div className="prose">
          {policyList
            ? policyList.legal_policies
                .filter((l) => l.name.includes("AGB"))
                .map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      className="space-y-4"
                    >
                      {item.child_legal_policies.map((child, index) => {
                        return (
                          <div key={child.id}>
                            <div className="text-xl text-secondary font-semibold mb-2">
                              {child.label}
                            </div>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: child.content,
                              }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
            : ""}
        </div>
      </DialogContent>
    </Dialog>
  );
}
