"use client";

import * as React from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateCheckoutMainTag,
  useGetCheckoutMainTags,
  useUpdateCheckoutMainTag,
} from "@/features/checkout-tag/hook";
import { CheckOutMain } from "@/types/checkout";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const normalizeTagValue = (value?: string | null) =>
  typeof value === "string" ? value.trim() : "";

const getUniqueTags = (tags: string[]) => Array.from(new Set(tags));

const TAG_COLOR_BY_LABEL: Record<string, string> = {
  "exchange in progress": "bg-[#1E3A8A]",
  "exchange completed": "bg-[#14532D]",
  "no refund needed": "bg-[#B45309]",
  "different carrier": "bg-[#0F766E]",
};

const getTagColorClass = (tag: string) =>
  TAG_COLOR_BY_LABEL[tag.toLowerCase()] ?? "bg-[#334155]";

export default function OrderTagSelector({
  order,
}: {
  order: CheckOutMain;
}) {
  const updateTagMutation = useUpdateCheckoutMainTag();
  const createTagMutation = useCreateCheckoutMainTag();
  const { data: tagOptionsRaw = [], isLoading: isLoadingTags } =
    useGetCheckoutMainTags();

  const tagOptions = React.useMemo(
    () =>
      (Array.isArray(tagOptionsRaw) ? tagOptionsRaw : [])
        .filter((item) => typeof item?.tag === "string" && item.tag.trim())
        .map((item) => ({
          id: item.id,
          tag: item.tag.trim(),
          code: item.code,
        })),
    [tagOptionsRaw],
  );

  const selectedTags = React.useMemo(() => {
    const tagsFromArray = Array.isArray(order.tags)
      ? order.tags
          .map((item) => normalizeTagValue(item?.tag))
          .filter(Boolean)
      : [];

    if (tagsFromArray.length > 0) {
      return getUniqueTags(tagsFromArray);
    }

    const legacyTag = normalizeTagValue(order.tag);
    return legacyTag ? [legacyTag] : [];
  }, [order.tag, order.tags]);

  const [openSelect, setOpenSelect] = React.useState(false);
  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
  const [newTag, setNewTag] = React.useState("");
  const [newCode, setNewCode] = React.useState("");

  const selectedTagKeys = React.useMemo(
    () => new Set(selectedTags.map((item) => item.toLowerCase())),
    [selectedTags],
  );

  const isSubmitting =
    updateTagMutation.isPending ||
    createTagMutation.isPending;

  const updateOrderTags = React.useCallback(
    (tags: string[]) => {
      const normalizedTags = getUniqueTags(
        tags.map((item) => normalizeTagValue(item)).filter(Boolean),
      );
      const currentTagKeys = new Set(selectedTags.map((item) => item.toLowerCase()));
      const nextTagKeys = new Set(normalizedTags.map((item) => item.toLowerCase()));

      if (
        nextTagKeys.size === currentTagKeys.size &&
        Array.from(nextTagKeys).every((item) => currentTagKeys.has(item))
      ) {
        return;
      }

      const actionLabel =
        normalizedTags.length === 0
          ? "Order tags cleared successfully"
          : normalizedTags.length > selectedTags.length
            ? "Order tag updated successfully"
            : "Order tag removed successfully";

      updateTagMutation.mutate(
        {
          mainCheckoutId: order.id,
          tags: normalizedTags,
        },
        {
          onSuccess: () => {
            toast.success(actionLabel);
          },
          onError: () => {
            toast.error("Failed to update order tag");
          },
        },
      );
    },
    [order.id, selectedTags, updateTagMutation],
  );

  const toggleTag = React.useCallback(
    (tag: string) => {
      const normalizedTag = normalizeTagValue(tag);
      if (!normalizedTag || isSubmitting) {
        return;
      }

      const normalizedKey = normalizedTag.toLowerCase();
      const hasTag = selectedTagKeys.has(normalizedKey);
      const nextTags = hasTag
        ? selectedTags.filter((item) => item.toLowerCase() !== normalizedKey)
        : [...selectedTags, normalizedTag];

      updateOrderTags(nextTags);
    },
    [isSubmitting, selectedTagKeys, selectedTags, updateOrderTags],
  );

  const selectedTagBadges = React.useMemo(
    () =>
      selectedTags.map((tag) => {
        return {
          tag,
          bgClass: getTagColorClass(tag),
        };
      }),
    [selectedTags],
  );

  const handleCreateTag = React.useCallback(() => {
    const normalizedTag = newTag.trim();
    const normalizedCode = newCode.trim();

    if (!normalizedTag || !normalizedCode) {
      toast.error("Tag and code are required");
      return;
    }

    createTagMutation.mutate(
      {
        tag: normalizedTag,
        code: normalizedCode,
      },
      {
        onSuccess: () => {
          toast.success("Tag created successfully");
          setOpenCreateDialog(false);
          setOpenSelect(true);
          setNewTag("");
          setNewCode("");
        },
        onError: () => {
          toast.error("Failed to create tag");
        },
      },
    );
  }, [createTagMutation, newCode, newTag]);

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="font-medium text-slate-500">Tag:</div>
            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTagBadges.map((item) => (
                  <div
                    key={item.tag}
                    title={item.tag}
                    className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-xs font-semibold text-white ${item.bgClass}`}
                  >
                    <span>{item.tag}</span>
                    <button
                      type="button"
                      onClick={() => toggleTag(item.tag)}
                      disabled={isSubmitting}
                      className="rounded p-0.5 text-white/90 transition hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Remove tag ${item.tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <Popover open={openSelect} onOpenChange={setOpenSelect}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                disabled={isLoadingTags || isSubmitting}
                className="size-8 min-h-8 min-w-8 justify-center rounded-md border border-slate-200 bg-white p-0 text-slate-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-[300px] p-0"
              usePortal={false}
            >
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList className="max-h-72">
                  <CommandEmpty>No tags found.</CommandEmpty>
                  <CommandGroup>
                    {tagOptions.map((option) => {
                      const checked = selectedTagKeys.has(option.tag.toLowerCase());

                      return (
                        <CommandItem
                          key={option.id}
                          value={`${option.tag} ${option.code ?? ""}`}
                          onSelect={() => toggleTag(option.tag)}
                          className="cursor-pointer"
                        >
                          <span className="flex h-4 w-4 items-center justify-center">
                            {checked ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : null}
                          </span>
                          <span className="truncate">{option.tag}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value="add-new-tag"
                      onSelect={() => {
                        setOpenSelect(false);
                        setOpenCreateDialog(true);
                      }}
                      className="cursor-pointer text-emerald-600"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add new tag</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Dialog
        open={openCreateDialog}
        onOpenChange={(nextOpen) => {
          setOpenCreateDialog(nextOpen);
          if (!nextOpen) {
            setNewTag("");
            setNewCode("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create new tag</DialogTitle>
            <DialogDescription>
              Add a new tag option for main checkout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Tag</Label>
              <Input
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                placeholder="e.g. High Priority"
                disabled={createTagMutation.isPending}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Code</Label>
              <Input
                value={newCode}
                onChange={(event) => setNewCode(event.target.value)}
                placeholder="e.g. high-priority"
                disabled={createTagMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                type="button"
                className="bg-gray-400 text-white hover:bg-gray-500"
                disabled={createTagMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="secondary"
              hasEffect
              onClick={handleCreateTag}
              disabled={createTagMutation.isPending}
            >
              {createTagMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
