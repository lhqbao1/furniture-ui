"use client";

import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useGetVariants } from "@/features/variant/hook";
import AttributesModal from "./attribute-modal";

const SelectProductAttributes = () => {
  const [openAddAttr, setOpenAddAttr] = React.useState(false);
  const form = useFormContext();
  const { isLoading } = useGetVariants();

  if (isLoading) return <div>Loading</div>;

  return (
    <Controller
      control={form.control}
      name="attr"
      render={() => {
        return (
          <FormItem className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <FormLabel className="text-base font-medium">Attributes</FormLabel>
              <FormControl>
                <div className="w-full sm:w-auto">
                  <AttributesModal
                    dialogOpen={openAddAttr}
                    setDialogOpen={setOpenAddAttr}
                  />
                </div>
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default SelectProductAttributes;
