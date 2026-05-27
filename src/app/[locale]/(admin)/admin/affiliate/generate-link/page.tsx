"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGenerateAffiliateLink,
  useGetAffiliates,
} from "@/features/affiliate/hook";
import {
  affiliateGenerateLinkSchema,
  AffiliateGenerateLinkValues,
} from "@/lib/schema/affiliate";

export default function GenerateAffiliateLinkPage() {
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const { data: affiliates = [], isLoading } = useGetAffiliates();
  const generateAffiliateLinkMutation = useGenerateAffiliateLink();

  const form = useForm<AffiliateGenerateLinkValues>({
    resolver: zodResolver(affiliateGenerateLinkSchema),
    defaultValues: {
      affiliate_id: "",
      expire_in: 24,
    },
  });

  const selectedAffiliateId = form.watch("affiliate_id");

  const selectedAffiliate = useMemo(
    () => affiliates.find((item) => item.id === selectedAffiliateId),
    [affiliates, selectedAffiliateId],
  );

  function handleSubmit(values: AffiliateGenerateLinkValues) {
    generateAffiliateLinkMutation.mutate(values, {
      onSuccess: (response) => {
        setGeneratedLink(response);
        toast.success("Affiliate link generated successfully");
      },
      onError: () => {
        toast.error("Failed to generate affiliate link");
      },
    });
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
    <div className="space-y-6">
      <div className="section-header">Generate Affiliate Link</div>

      <Card className="mx-auto w-full max-w-3xl border-secondary/20">
        <CardHeader>
          <CardTitle>Link Generator</CardTitle>
          <CardDescription>
            Create tracking query string with `affiliate_id` and optional expire
            hours.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="affiliate_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliate</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="border-input border">
                          <SelectValue
                            placeholder={
                              isLoading
                                ? "Loading affiliates..."
                                : "Select affiliate"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {affiliates.map((affiliate) => (
                            <SelectItem key={affiliate.id} value={affiliate.id}>
                              {affiliate.name} ({affiliate.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expire_in"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expire Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={720}
                        value={field.value ?? ""}
                        onChange={(event) => {
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : event.target.valueAsNumber,
                          );
                        }}
                        placeholder="24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="secondary"
                disabled={generateAffiliateLinkMutation.isPending}
              >
                {generateAffiliateLinkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Link
              </Button>
            </form>
          </Form>

          {generatedLink ? (
            <div className="space-y-3 rounded-lg border border-dashed border-secondary/40 bg-secondary/5 p-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Affiliate
                </p>
                <p className="font-medium">
                  {selectedAffiliate
                    ? `${selectedAffiliate.name} (${selectedAffiliate.code})`
                    : selectedAffiliateId}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Query String
                </p>
                <p className="break-all rounded-md bg-background p-3 font-mono text-sm">
                  {generatedLink}
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
