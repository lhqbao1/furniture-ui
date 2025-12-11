"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/src/i18n/navigation";
import { BlogItem } from "@/types/blog";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export function extractFirstImage(content: string): string | null {
  const match = content.match(/<img[^>]+src="([^">]+)"/i);
  return match ? match[1] : null;
}

export function stripImagesAndHeadings(content: string): string {
  return (
    content
      // xoá mọi thẻ img
      .replace(/<img[^>]*>/gi, "")
      // xoá mọi heading HTML <h1>...</h1> (không cần flag s)
      .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, "")
      // xoá heading markdown "# Title"
      .replace(/^[#]{1,6}\s.*$/gim, "")
  );
}

export default function FeaturedPost({ post }: { post: BlogItem }) {
  const imageUrl = extractFirstImage(post.content);

  const cleanContent = stripImagesAndHeadings(post.content);

  return (
    <section className="">
      <Card className="border-none">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold leading-snug">{post.title}</h1>
            {/* Markdown + line clamp */}
            <div className="text-muted-foreground max-w-md line-clamp-3 overflow-hidden">
              <ReactMarkdown skipHtml>{cleanContent}</ReactMarkdown>
            </div>
            <Link href={`/blog/${post.slug}`}>
              <Button
                type="button"
                variant="secondary"
              >
                Beitrag lesen
              </Button>
            </Link>
          </div>

          {imageUrl && (
            <Image
              src={imageUrl}
              width={500}
              height={500}
              alt={post.title}
              className="rounded-xl object-contain w-full"
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
