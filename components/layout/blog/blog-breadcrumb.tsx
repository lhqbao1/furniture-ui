import CustomBreadCrumb from "@/components/shared/new-breadcrumb";
import React from "react";

interface BreadcrumbItemType {
  title: string;
  link: string;
}

interface CustomBreadcrumbProps {
  parentPage?: BreadcrumbItemType | null;
  currentPage: BreadcrumbItemType;
}

const BlogBreadcrumb = ({ parentPage, currentPage }: CustomBreadcrumbProps) => {
  return (
    <div className="mb-4">
      <CustomBreadCrumb
        currentPage={currentPage}
        parentPage={parentPage}
      />
    </div>
  );
};

export default BlogBreadcrumb;
