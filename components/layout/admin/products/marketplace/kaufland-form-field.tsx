import RichEditor from "@/components/shared/tiptap/tiptap-editor";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface KauflandFormFieldsProps {
  form: any;
}

export default function KauflandFormFields({ form }: KauflandFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Kaufland product title" />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price (€)</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <RichEditor
              value={field.value || ""}
              onChangeValue={field.onChange}
            />
          </FormItem>
        )}
      />
    </>
  );
}
