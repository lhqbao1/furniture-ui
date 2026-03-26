"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useGetProductGroup } from "@/features/product-group/hook";
import { useAtom } from "jotai";
import { currentProductGroup } from "@/store/product-group";
import DeleteGroupDialog from "./delete-group-dialog";
import AddOrEditParentDialog from "./add-or-edit-parent-dialog";

const SelectProductGroup = () => {
  const [groupName, setGroupName] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogAddOpen, setDialogAddOpen] = React.useState(false);
  const [, setCurrentGroup] = useAtom(currentProductGroup);

  const { data: groups, isLoading, isError } = useGetProductGroup();
  const form = useFormContext();

  return (
    <Controller
      control={form.control}
      name="parent_id"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <FormLabel className="text-sm font-semibold">Groups</FormLabel>
            <AddOrEditParentDialog
              dialogOpen={dialogAddOpen}
              setDialogOpen={setDialogAddOpen}
              groupName={groupName}
              setGroupName={setGroupName}
            />
          </div>

          <FormControl>
            <div className="rounded-xl border bg-background/80">
              <Command className="bg-transparent">
                <CommandInput placeholder="Search groups…" className="h-11" />

                {isLoading ? (
                  <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading groups…
                  </div>
                ) : isError ? (
                  <div className="px-4 py-6 text-sm text-destructive">
                    Failed to load groups.
                  </div>
                ) : (
                  <>
                    <CommandEmpty>No group found.</CommandEmpty>
                    <CommandGroup className="max-h-[460px] overflow-y-auto p-2">
                      {groups?.map((g) => (
                        <CommandItem
                          key={g.id}
                          value={`${g.name}-${g.id}`}
                          onSelect={() => {
                            setCurrentGroup(g.name);
                            field.onChange(g.id);
                          }}
                          className="group cursor-pointer rounded-md px-2 py-2"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Check
                              className={cn(
                                "size-4",
                                field.value === g.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <span className="truncate text-sm font-medium">
                              {g.name}
                            </span>
                          </div>

                          <div className="ml-2 hidden items-center gap-2 group-hover:flex">
                            <DeleteGroupDialog parentId={g.id} />
                            <AddOrEditParentDialog
                              dialogOpen={dialogOpen}
                              setDialogOpen={setDialogOpen}
                              groupName={groupName}
                              setGroupName={setGroupName}
                              defaultValues={{ id: g.id, name: g.name }}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </Command>
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectProductGroup;
