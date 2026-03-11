import React from "react";
import BlogScrollToTop from "@/components/layout/blog/blog-scroll-to-top";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogScrollToTop />
      {children}
    </>
  );
}
