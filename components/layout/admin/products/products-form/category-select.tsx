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

export function MultiSelectField({
  fieldName,
  label,
  placeholder = "Select categories",
}: MultiSelectProps) {
  const { control } = useFormContext();
  const { data: options, isLoading, isError } = useGetCategories();

  // hàm flatten chỉ lấy leaf nodes
  const flattenCategories = (
    categories: CategoryResponse[]
  ): CategoryResponse[] => {
    let result: CategoryResponse[] = [];
    for (const cat of categories) {
      if (cat.children && cat.children.length > 0) {
        // nếu có children -> lấy children đệ quy
        result = [...result, ...flattenCategories(cat.children)];
      } else {
        // nếu không có children -> leaf node
        result.push(cat);
      }
    }
    return result;
  };

  const leafOptions: CategoryResponse[] = React.useMemo(() => {
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

        const orderedOptions = React.useMemo(() => {
          if (!leafOptions) return [];
          // Các category đã chọn
          const selectedItems = leafOptions.filter((opt) =>
            selected.includes(opt.id)
          );
          // Các category chưa chọn
          const unselectedItems = leafOptions.filter(
            (opt) => !selected.includes(opt.id)
          );
          // Ghép lại: chọn trước, chưa chọn sau
          return [...selectedItems, ...unselectedItems];
        }, [leafOptions, selected]);

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
              <PopoverContent className="w-[200px] max-h-[400px] overflow-y-scroll p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : isError || !leafOptions || leafOptions.length === 0 ? (
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
                      {orderedOptions.map((opt) => (
                        <CommandItem
                          key={opt.id}
                          onSelect={() => toggleSelect(opt.id)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={selected.includes(opt.id)}
                            onCheckedChange={() => toggleSelect(opt.id)}
                            className="pointer-events-none"
                          />
                          <span>{opt.name}</span>
                        </CommandItem>
                      ))}
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
