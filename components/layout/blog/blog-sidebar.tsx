"use client";
import { BlogByProductResponse } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { formatDateTimeString } from "@/lib/date-formated";

export default function SidebarBlog({
  items,
}: {
  items: BlogByProductResponse[];
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Neueste Artikel</h3>

      <div className="space-y-5">
        {items.slice(0, 5).map((post) => {
          return (
            <div
              className="flex gap-4"
              key={post.product.id}
            >
              <Image
                src={post.product.static_files[0].url}
                alt={post.product.name}
                width={90}
                height={70}
                className="rounded-md object-cover transition-all hover:scale-110 duration-300"
              />

              <div className="flex-1">
                <Link
                  href={`/blog/category/${post.product.url_key}`}
                  key={post.product.id}
                  className=""
                >
                  <p className="hover:text-secondary transition line-clamp-2 font-semibold">
                    {post.product.name}
                  </p>
                </Link>
                {/* 
                <div className="text-muted-foreground text-sm line-clamp-2 overflow-hidden">
                  <ReactMarkdown skipHtml>{cleanContent}</ReactMarkdown>
                </div> */}
                <div className="flex gap-2 items-center mt-2">
                  <Calendar className="text-secondary size-4" />
                  <div className="text-xs text-gray-400 font-bold">
                    {formatDateTimeString(post.created_at)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
