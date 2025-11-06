import RichEditor from "@/components/shared/tiptap/tiptap-editor";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface EbayFormFieldsProps {
  form: any;
}

export default function EbayFormFields({ form }: EbayFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter product name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Price + Stock */}
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="final_price"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Final Price (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.valueAsNumber
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="min_stock"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Min Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.valueAsNumber
                    )
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_stock"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Max Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.valueAsNumber
                    )
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black font-semibold text-sm">
              Description
            </FormLabel>
            <FormControl>
              <RichEditor
                disabled
                value={field.value || ""}
                onChangeValue={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
