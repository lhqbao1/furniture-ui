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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
import { useState } from "react";
import { categorySchema } from "@/lib/schema/category";
import ImagePickerInput from "@/components/layout/single-product/tabs/review/image-picker-input";
import { useCreateCategory, useGetCategories } from "@/features/category/hook";
import { toast } from "sonner";
import { CategoryInput } from "@/types/categories";

export default function AddCategoryDrawer() {
    const [open, setOpen] = useState(false)
    const createCategoryMutation = useCreateCategory()
    const { data: categories, isLoading, isError } = useGetCategories()

    const defaultValues: CategoryInput = {
        name: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        level: 1,
        // parent_id: "",
        img_url: "",
    };
    const form = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
        defaultValues,
    });


    const onSubmit = (data: CategoryInput) => {
        const payload: CategoryInput = { ...data };

        if (payload.parent_id) {
            payload.level = 2; // nếu có parent, level = 2
        } else {
            delete payload.parent_id; // nếu không có parent, remove parent_id
            payload.level = 1;       // level mặc định là 1
        }

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
    };



    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
                <Button variant={'secondary'}>Add Category</Button>
            </DrawerTrigger>
            <DrawerContent className="overflow-y-scroll pb-4">
                <DrawerHeader>
                    <DrawerTitle>Add Category</DrawerTitle>
                </DrawerHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 py-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Chair" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <ImagePickerInput fieldName="img_url" form={form} isSingle />


                        {!categories || isError ? '' :
                            <FormField
                                control={form.control}
                                name="parent_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent category</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ""} // nếu chưa chọn thì là empty
                                                disabled={isLoading || isError}
                                            >
                                                <SelectTrigger placeholderColor className="border">
                                                    <SelectValue placeholder="Select parent category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {isLoading && <SelectItem value="">Loading...</SelectItem>}
                                                    {isError && <SelectItem value="">Error loading</SelectItem>}
                                                    {categories?.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        }


                        <FormField
                            control={form.control}
                            name="meta_title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meta title</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
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
                                        <Textarea {...field} />
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
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DrawerFooter>
                            <Button type="submit">
                                Add
                            </Button>
                            <Button type="button" variant="outline" onClick={() => {
                                setOpen(false)
                                form.reset(defaultValues)
                            }}>
                                Discard
                            </Button>
                        </DrawerFooter>
                    </form>
                </Form>
            </DrawerContent>
        </Drawer>
    );
}
