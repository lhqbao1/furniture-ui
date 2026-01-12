import { BlogItem } from "@/types/blog";
import React from "react";
import { Link } from "@/src/i18n/navigation";
import Image from "next/image";
import { Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShowAllBlogButton from "./show-all-blogs-button";

interface RelatedBlogsProps {
  blogs: BlogItem[];
  author?: string;
  slug: string;
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "") ?? "";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const RelatedBlogs = ({
  blogs,
  slug,
  author = "Prestige Home",
}: RelatedBlogsProps) => {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="">
      <h3 className="text-2xl text-secondary font-semibold mb-6">
        Related Articles
      </h3>

      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-4 
          gap-6
        "
      >
        {blogs.map((blog) => (
          <Link
            key={blog.blog_id}
            href={`/blog/${blog.slug}`}
            className="
              group 
              border 
              rounded-xl 
              p-5 
              flex 
              flex-col 
              justify-between 
              hover:shadow-md 
              transition
            "
          >
            {/* CONTENT */}
            <div>
              <h4
                className="
                  font-semibold 
                  text-base 
                  mb-3 
                  line-clamp-2 
                  group-hover:text-secondary
                  transition
                "
              >
                {blog.title}
              </h4>

              <p className="text-sm text-muted-foreground line-clamp-3">
                {stripHtml(blog.content).slice(0, 140)}…
              </p>
            </div>

            {/* META */}
            <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex gap-0.5 items-center text-secondary">
                <User className="size-4 text-secondary" /> {author}
              </span>
              <span className="flex gap-0.5 items-center text-secondary">
                <Calendar className="size-4 text-secondary" />
                {formatDate(blog.created_at)}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="w-full flex justify-center">
        {" "}
        <ShowAllBlogButton slug={slug} />
      </div>
    </section>
  );
};

export default RelatedBlogs;
