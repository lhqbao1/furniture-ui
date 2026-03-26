import CategoryAdd from "@/components/layout/admin/products/category-list/category-add";
import ListCategories from "@/components/layout/admin/products/category-list/list-categories";
import React from "react";

const CategoryPage = async () => {
  return (
    <div className="min-h-screen w-full px-2 pb-8 pt-4 sm:px-4 lg:px-6">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-[#f8faf8] p-3 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:mb-6">
          <h1 className="text-xl font-semibold text-[#1f2937] sm:text-2xl">
            Category Manager
          </h1>
          <p className="text-sm text-[#64748b]">
            Organize categories and assign products with a faster workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="min-w-0">
            <ListCategories />
          </aside>
          <section className="min-w-0">
            <CategoryAdd />
          </section>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
