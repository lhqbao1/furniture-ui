import { BlogItem } from "@/types/blog";
import Image from "next/image";
import { extractFirstImage, stripImagesAndHeadings } from "./featured-post";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Link } from "@/src/i18n/navigation";

export default function BlogCard({ post }: { post: BlogItem }) {
  const imageUrl = extractFirstImage(post.content);
  const cleanContent = stripImagesAndHeadings(post.content);

  return (
    <article className="rounded-lg overflow-hidden shadow hover:shadow-md transition">
      <Link href={`/blog/${post.slug}`}>
        <Image
          src={imageUrl ?? "/blog-placeholder.png"}
          width={500}
          height={300}
          alt={post.title}
          className="w-full h-48 object-contain py-4 transition-all hover:scale-110 duration-300"
        />
      </Link>

      <div className="p-5 space-y-4">
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-semibold text-lg line-clamp-2">{post.title}</h3>
        </Link>
        <div className="text-muted-foreground line-clamp-3 overflow-hidden mt-2">
          <ReactMarkdown skipHtml>{cleanContent}</ReactMarkdown>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <Button type="button" variant="secondary">
            Beitrag lesen
          </Button>
        </Link>
      </div>
    </article>
  );
}
