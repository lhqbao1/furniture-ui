"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, Loader2 } from "lucide-react";
import { useGetCategories } from "@/features/category/hook";
import { CategoryResponse } from "@/types/categories";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiSelectProps {
  fieldName: string;
  label?: string;
  placeholder?: string;
}

type FlattenCategory = CategoryResponse & {
  isParent: boolean;
};

export function MultiSelectField({
  fieldName,
  label,
  placeholder = "Select categories",
}: MultiSelectProps) {
  const { control } = useFormContext();
  const { data: options, isLoading, isError } = useGetCategories();

  const flattenCategories = (
    categories: CategoryResponse[],
    level = 0,
  ): FlattenCategory[] => {
    let result: FlattenCategory[] = [];

    for (const cat of categories) {
      const hasChildren = !!(cat.children && cat.children.length > 0);

      // luôn push category hiện tại (cha hoặc con)
      result.push({
        ...cat,
        isParent: hasChildren,
      });

      if (hasChildren) {
        result = [...result, ...flattenCategories(cat.children!, level + 1)];
      }
    }

    return result;
  };

  const flatOptions = React.useMemo(() => {
    if (!options) return [];
    return flattenCategories(options);
  }, [options]);

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => {
        const selected: string[] = field.value || [];

        const toggleSelect = (id: string) => {
          if (selected.includes(id)) {
            field.onChange(selected.filter((x) => x !== id));
          } else {
            field.onChange([...selected, id]);
          }
        };

        return (
          <FormItem className="flex flex-col w-full">
            {label && (
              <FormLabel className="text-black font-semibold text-sm text-start">
                Categories
              </FormLabel>
            )}

            <Popover>
              <PopoverTrigger asChild className="font-light">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled={isLoading || isError}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </span>
                  ) : selected.length > 0 ? (
                    `${selected.length} selected`
                  ) : (
                    placeholder
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] max-h-[400px] overflow-y-scroll p-0 pointer-events-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : isError || !flatOptions || flatOptions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No categories available
                  </div>
                ) : (
                  <Command>
                    <CommandInput
                      placeholder="Search categories..."
                      className="h-10"
                    />
                    <CommandGroup>
                      {flatOptions.map((opt) => {
                        const isSelected = selected.includes(opt.id);

                        // 👉 CATEGORY CHA
                        if (opt.isParent) {
                          return (
                            <div
                              key={opt.id}
                              className="px-3 py-2 text-sm font-semibold text-muted-foreground cursor-default"
                            >
                              {opt.name}
                            </div>
                          );
                        }

                        // 👉 CATEGORY CON (leaf)
                        return (
                          <CommandItem
                            key={opt.id}
                            onSelect={() => toggleSelect(opt.id)}
                            className="flex items-center gap-2 cursor-pointer pl-6"
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(opt.id)}
                              className="pointer-events-none"
                            />
                            <span>{opt.name}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                )}
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
