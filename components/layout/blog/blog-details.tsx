import { BlogItem } from "@/types/blog";
import { Calendar, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import BlogBreadcrumb from "./blog-breadcrumb";
import BlogListKeywords from "./list-keyword";

export function stripImagesAndHeadings(content: string): string {
  return (
    content
      // xoá mọi heading HTML H1
      .replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, "")
      // xoá heading markdown "# Title"
      .replace(/^#\s.*$/gim, "")
  );
}

export default function BlogDetails({ post }: { post: BlogItem }) {
  return (
    <article className="space-y-6">
      <div>
        <div className="mt-4">
          <BlogBreadcrumb
            parentPage={{
              link: "/blog",
              title: "Blog",
            }}
            currentPage={{
              link: post.slug,
              title: post?.title ?? "",
            }}
          />
        </div>
        {/* Title */}
        <h1 className="text-4xl font-bold">{post.title}</h1>
        {/* Meta info */}
        <div className="text-muted-foreground text-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <User className="size-6 text-secondary" />
            <span className="mt-0.5">{"Prestige Home"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-6 text-secondary" />
            <span className="mt-0.5">
              {new Date(post.created_at).toLocaleDateString("de-DE")}
            </span>
          </div>
        </div>
        <hr className="my-5 h-0.5"></hr>
      </div>

      {/* Content */}
      <div className="text-muted-foreground prose overflow-hidden blog-content">
        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
          {stripImagesAndHeadings(post.content)}
        </ReactMarkdown>
      </div>

      <BlogListKeywords />
    </article>
  );
}
