"use client";

import { Copy, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGenerateAffiliateLink } from "@/features/affiliate/hook";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GenerateAffiliateLinkDialogProps {
  affiliateId: string;
  affiliateName?: string;
}

export default function GenerateAffiliateLinkDialog({
  affiliateId,
  affiliateName,
}: GenerateAffiliateLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [expireIn, setExpireIn] = useState<string>("24");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const generateAffiliateLinkMutation = useGenerateAffiliateLink();

  function handleGenerateLink() {
    const parsedExpireIn = Number(expireIn);

    generateAffiliateLinkMutation.mutate(
      {
        affiliate_id: affiliateId,
        ...(Number.isFinite(parsedExpireIn) && parsedExpireIn > 0
          ? { expire_in: parsedExpireIn }
          : {}),
      },
      {
        onSuccess: (link) => {
          setGeneratedLink(link);
          toast.success("Affiliate link generated successfully");
        },
        onError: () => {
          toast.error("Failed to generate affiliate link");
        },
      },
    );
  }

  async function handleCopy() {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Copied link to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Generate affiliate link"
        >
          <Link2 className="h-4 w-4 text-secondary" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Affiliate Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-dashed border-secondary/40 bg-secondary/5 px-3 py-2 text-sm text-muted-foreground">
            {affiliateName ? (
              <span>
                Affiliate: <strong className="text-foreground">{affiliateName}</strong>
              </span>
            ) : (
              <span>Affiliate ID: {affiliateId}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`expire-hours-${affiliateId}`}>Expire Hours</Label>
            <Input
              id={`expire-hours-${affiliateId}`}
              type="number"
              min={1}
              max={720}
              value={expireIn}
              onChange={(event) => setExpireIn(event.target.value)}
              placeholder="24"
            />
          </div>

          <Button
            variant="secondary"
            onClick={handleGenerateLink}
            disabled={generateAffiliateLinkMutation.isPending}
            className="w-full"
          >
            {generateAffiliateLinkMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Generate Link
          </Button>

          {generatedLink ? (
            <div className="space-y-2 rounded-md border bg-muted/20 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Generated Query String
              </p>
              <p className="break-all text-sm text-foreground">{generatedLink}</p>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
