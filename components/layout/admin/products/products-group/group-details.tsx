import React from "react";
import SelectProductAttributes from "./select-attributes";
import { useAtom } from "jotai";
import { currentProductGroup } from "@/store/product-group";
import ListVariantOption from "./list-variant-options";

const GroupDetails = () => {
  const [currentGroup] = useAtom(currentProductGroup);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Current Group
        </p>
        <p className="mt-2 text-2xl font-semibold text-secondary">
          {currentGroup || "None Selected"}
        </p>
      </section>

      <section className="rounded-xl border p-4 lg:p-5">
        <h2 className="text-base font-semibold">Attributes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the attributes that define this product group.
        </p>
        <div className="mt-4">
          <SelectProductAttributes />
        </div>
      </section>

      <section className="rounded-xl border p-4 lg:p-5">
        <h2 className="text-base font-semibold">Variant Options</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure options and combinations for selected attributes.
        </p>
        <div className="mt-4">
          <ListVariantOption />
        </div>
      </section>
    </div>
  );
};

export default GroupDetails;
