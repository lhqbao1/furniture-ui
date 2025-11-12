"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { getPolicyItemsByVersion } from "@/features/policy/api";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChildLegalPolicy, PolicyVersion } from "@/types/policy";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateChildLegalPolicy,
  useCreateLegalPolicy,
  useCreateVersion,
} from "@/features/policy/hook";
import { toast } from "sonner";
import RichEditor from "@/components/shared/tiptap/tiptap-editor";
import { Textarea } from "@/components/ui/textarea";

interface ListPolicyAdminProps {
  versionId: string;
  versionData: PolicyVersion[];
  policyId?: string;
  versionName?: string;
  isAdmin?: boolean;
}

// Helper: Convert children policies -> HTML
function buildHtmlFromPolicies(
  children: { label: string; content: string; tt: number }[]
): string {
  return children
    .map(
      (cl) =>
        `<h2>${cl.label || ""}</h2>${
          cl.content || "<p></p> || <strong></strong>"
        }`
    )
    .join("");
}

function parseEditorContent(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const h2s = Array.from(doc.querySelectorAll("h2"));

  const results: { label: string; content: string; tt: number }[] = [];

  h2s.forEach((h2) => {
    const label = h2.textContent?.trim() || "";
    let content = "";
    let sibling = h2.nextSibling;

    while (sibling && sibling.nodeName.toLowerCase() !== "h2") {
      if ((sibling as HTMLElement).outerHTML) {
        content += (sibling as HTMLElement).outerHTML;
      } else {
        content += sibling.textContent || "";
      }
      sibling = sibling.nextSibling;
    }

    // Regex: tìm số đầu tiên trong label
    const match = label.match(/\d+/);
    const tt = match ? parseInt(match[0], 10) : 0; // convert string -> number

    results.push({ label, content, tt });
  });

  return results;
}

const ListPolicyAdmin = ({
  versionId,
  versionData,
  policyId,
  versionName,
  isAdmin = false,
}: ListPolicyAdminProps) => {
  const t = useTranslations();
  const [openDialog, setOpenDialog] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  // const [editorValue, setEditorValue] = useState("")
  const [editorValues, setEditorValues] = useState<Record<string, string>>({});

  const { data: policy, isLoading } = useQuery({
    queryKey: ["policy-items", versionId],
    queryFn: () => getPolicyItemsByVersion(versionId),
    enabled: !!versionId,
  });

  const createVersionMutation = useCreateVersion();
  const createLegalPolicyMutation = useCreateLegalPolicy();
  const createChildLegalPolicyMutation = useCreateChildLegalPolicy();

  const filteredPolicies = useMemo(() => {
    return policy?.legal_policies ?? [];
  }, [policy]);

  const currentPolicy =
    filteredPolicies.find((p) => p.id === openAccordion) || filteredPolicies[0];

  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [policies, setPolicies] = useState<
    Record<
      string,
      Record<string, { label: string; content: string; tt: number }>
    >
  >({});

  // ✅ Khi filteredPolicies thay đổi, tạo sẵn HTML cho tất cả policy (đặc biệt là index 0)
  useEffect(() => {
    if (filteredPolicies.length === 0) return;

    setEditorValues((prev) => {
      const newValues = { ...prev };

      filteredPolicies.forEach((lp) => {
        // chỉ khởi tạo nếu chưa có trong state
        if (!newValues[lp.id]) {
          newValues[lp.id] = buildHtmlFromPolicies(
            lp.child_legal_policies.map((cl) => ({
              label: cl.label,
              content: cl.content,
              tt: cl.tt,
            }))
          );
        }
      });

      return newValues;
    });
  }, [filteredPolicies]);

  useEffect(() => {
    if (currentPolicy && !editorValues[currentPolicy.id]) {
      const html = buildHtmlFromPolicies(
        currentPolicy.child_legal_policies.map((cl) => ({
          label: cl.label,
          content: cl.content,
          tt: cl.tt,
        }))
      );
      setEditorValues((prev) => ({ ...prev, [currentPolicy.id]: html }));
    }
  }, [currentPolicy, editorValues]);

  const handleSaveClick = () => {
    setOpenDialog(true);
  };

  const handleSubmitVersion = async () => {
    try {
      setIsCreating(true);
      // 1. Tạo version trước
      const id = crypto.randomUUID();

      const versionRes = await createVersionMutation.mutateAsync(id);

      //   2. Lặp qua từng policy
      for (const lp of filteredPolicies) {
        const legalPolicyRes = await createLegalPolicyMutation.mutateAsync({
          name: lp.name,
          version_id: versionRes.id,
        });

        // 3. Parse content theo editor riêng từng policy
        const editorContent = editorValues[lp.id] || "";
        const parsedChildren = parseEditorContent(editorContent);

        // 4. Merge parsed content với child gốc (để giữ tt, fallback)
        const childInputs = parsedChildren.map((parsed) => ({
          label: parsed.label,
          content: parsed.content,
          tt: parsed.tt,
        }));

        // 5. Gửi API tạo child policies
        await createChildLegalPolicyMutation.mutateAsync({
          input: childInputs,
          legal_policy_id: legalPolicyRes.id,
        });
      }

      // 6. Reset state + toast
      setIsCreating(false);
      toast.success("Create new policy version successful");
    } catch (err) {
      console.error("Lỗi khi tạo version:", err);
      toast.error("Failed to create new policy version");
    }
  };

  if (isLoading || isCreating)
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin" />
        Creating
      </div>
    );
  if (!versionId) return <></>;

  return (
    <div className="grid grid-cols-12 pt-3 lg:h-[calc(100vh-100px)] h-fit pb-4">
      <div className="space-x-2 col-span-12 mb-12">
        <Button className="text-xl" onClick={handleSubmitVersion}>
          Save
        </Button>
        <Button className="text-xl" variant={"outline"}>
          Cancel
        </Button>
      </div>

      {/* Dialog */}
      {/* <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-[400px]">
          <DialogHeader>
            <DialogTitle>Enter Version Name</DialogTitle>
          </DialogHeader>
          <Input
            value={versionNameInput}
            onChange={(e) => setVersionNameInput(e.target.value)}
            placeholder="Enter version name..."
          />
          <DialogFooter>
            <Button
              onClick={handleSubmitVersion}
              disabled={createVersionMutation.isPending}
            >
              {createVersionMutation.isPending ||
              createLegalPolicyMutation.isPending ||
              createChildLegalPolicyMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Sidebar */}
      <div className="col-span-4 border-r overflow-y-auto lg:block hidden">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={openAccordion ?? undefined}
          onValueChange={(val) => setOpenAccordion(val)}
        >
          {filteredPolicies.map((item) => (
            <AccordionItem
              value={item.id}
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenAccordion(item.id);
              }}
            >
              <div className="pr-6 px-2 py-3 cursor-pointer font-bold">
                {item.name}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Nội dung bên phải */}
      <div className="lg:col-span-8 col-span-12 px-3 lg:px-12 space-y-6 lg:pb-8 pb-3 overflow-x-hidden content-scroll lg:overflow-y-auto">
        <h1 className="text-center lg:text-3xl text-2xl text-secondary font-semibold uppercase text-wrap">
          {currentPolicy?.name}
        </h1>
        <div className="col-span-12">
          {editorValues[currentPolicy?.id] ? (
            <RichEditor
              value={editorValues[currentPolicy.id]}
              onChangeValue={(val) =>
                setEditorValues((prev) => ({
                  ...prev,
                  [currentPolicy.id]: val,
                }))
              }
            />
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <Loader2 className="animate-spin mr-2" /> Loading editor
              content...
            </div>
          )}
        </div>

        {/* <div className="col-span-12"> <RichEditor value={editorValue} onChangeValue={(val) => setEditorValue(val)} /> </div> */}
      </div>
    </div>
  );
};

export default ListPolicyAdmin;
