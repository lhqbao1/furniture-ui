import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import { categorySchema } from "@/lib/schema/category";
import ImagePickerInput from "@/components/layout/single-product/tabs/review/image-picker-input";
import {
  useCreateCategory,
  useEditCategory,
  useGetCategories,
} from "@/features/category/hook";
import { toast } from "sonner";
import { CategoryInput } from "@/types/categories";
import { Loader2, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { CategoryResponse } from "@/types/categories";

interface AddCategoryDrawerProps {
  categoryId?: string;
  categoryValues?: CategoryInput;
}

type CategoryOption = {
  id: string;
  name: string;
  path: string;
  depth: number;
  level: number;
};

const buildCategoryOptions = (
  categories: CategoryResponse[],
  isEconelo: boolean,
  parentPath: string[] = [],
  depth = 1,
): CategoryOption[] => {
  return categories.flatMap((cat) => {
    const nextPath = [...parentPath, cat.name];
    const include = !isEconelo || cat.is_econelo === true;
    const self: CategoryOption[] = include
      ? [
          {
            id: cat.id.toString(),
            name: cat.name,
            path: nextPath.join(" / "),
            depth,
            level: cat.level ?? depth,
          },
        ]
      : [];

    const children = cat.children?.length
      ? buildCategoryOptions(cat.children, isEconelo, nextPath, depth + 1)
      : [];

    return [...self, ...children];
  });
};

export default function AddCategoryDrawer({
  categoryId,
  categoryValues,
}: AddCategoryDrawerProps) {
  const [open, setOpen] = useState(false);
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useEditCategory();
  const { data: categories, isLoading, isError } = useGetCategories();
  const [parentOpen, setParentOpen] = useState(false);

  const defaultValues: CategoryInput = {
    name: "",
    level: 1,
    is_econelo: false,
  };
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      ...defaultValues,
      ...(categoryValues ?? {}),
      is_econelo: categoryValues?.is_econelo ?? false,
    },
  });

  const isEconelo = form.watch("is_econelo");
  const parentId = form.watch("parent_id");

  const categoryOptions = useMemo(() => {
    return categories ? buildCategoryOptions(categories, isEconelo) : [];
  }, [categories, isEconelo]);

  const selectedParent = parentId
    ? categoryOptions.find((option) => option.id === parentId)
    : null;

  const onSubmit = (data: CategoryInput) => {
    const payload: CategoryInput = { ...data };

    if (payload.parent_id) {
      const parentOption = categoryOptions.find(
        (option) => option.id === payload.parent_id,
      );
      payload.level = (parentOption?.level ?? 1) + 1;
    } else {
      delete payload.parent_id; // nếu không có parent, remove parent_id
      payload.level = 1; // level mặc định là 1
    }

    if (categoryValues) {
      updateCategoryMutation.mutate(
        { id: categoryId ?? "", input: payload },
        {
          onSuccess(data, variables, context) {
            toast.success("Category is updated successful");
            form.reset(defaultValues);
            setOpen(false);
          },
          onError(error, variables, context) {
            toast.error("Category is updated fail");
          },
        },
      );
    } else {
      createCategoryMutation.mutate(payload, {
        onSuccess(data, variables, context) {
          toast.success("Category is created successful");
          form.reset(defaultValues);
          setOpen(false);
        },
        onError(error, variables, context) {
          toast.error("Category is created fail");
        },
      });
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction="right"
    >
      <DrawerTrigger asChild>
        {categoryValues ? (
          <Button
            variant="ghost"
            size="icon"
          >
            <Pencil
              size={18}
              className="cursor-pointer"
            />
          </Button>
        ) : (
          <Button variant={"secondary"}>Add Category</Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="overflow-y-scroll pb-4">
        <DrawerHeader>
          <DrawerTitle>Add Category</DrawerTitle>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-4 py-2"
          >
            <FormField
              control={form.control}
              name="is_econelo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <FormLabel className="text-base">Econelo Product</FormLabel>
                  <FormControl>
                    <Switch
                      className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary cursor-pointer"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={categoryValues ? true : false}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Chair"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ImagePickerInput
              fieldName="img_url"
              form={form}
              isSingle
            />

            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent category</FormLabel>
                  <FormControl>
                    <Popover
                      open={parentOpen}
                      onOpenChange={setParentOpen}
                    >
                      <PopoverTrigger asChild>
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
                          ) : selectedParent ? (
                            selectedParent.path
                          ) : (
                            "Select parent category"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[320px] p-0"
                        align="start"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : isError ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Error loading categories
                          </div>
                        ) : (
                          <Command>
                            <CommandInput placeholder="Search categories..." />
                            <CommandList className="max-h-[320px]">
                              <CommandEmpty>
                                No categories found.
                              </CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="no-parent"
                                  onSelect={() => {
                                    field.onChange(undefined);
                                    setParentOpen(false);
                                  }}
                                >
                                  No parent
                                </CommandItem>
                                {categoryOptions.map((option) => (
                                  <CommandItem
                                    key={option.id}
                                    value={`${option.path}`}
                                    onSelect={() => {
                                      field.onChange(option.id);
                                      setParentOpen(false);
                                    }}
                                  >
                                    <span
                                      className="truncate"
                                      style={{
                                        paddingLeft: `${
                                          (option.depth - 1) * 12
                                        }px`,
                                      }}
                                    >
                                      {option.name}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        )}
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meta_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meta_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meta_keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta keywords</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DrawerFooter>
              <Button type="submit">
                {updateCategoryMutation.isPending ||
                createCategoryMutation.isPending ? (
                  <Loader2 className="animated-spin" />
                ) : (
                  <div>{categoryValues ? "Update" : "Add"}</div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset(defaultValues);
                }}
              >
                Discard
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
