"use client";

import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";

interface CustomPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CustomPagination({
  page,
  totalPages,
  onPageChange,
}: CustomPaginationProps) {
  const [inputPage, setInputPage] = useState<string>(String(page));

  // sync khi page đổi từ bên ngoài
  useEffect(() => {
    setInputPage(String(page));
  }, [page]);

  const getPageNumbers = () => {
    const delta = 2;
    const pages: (number | string)[] = [];

    pages.push(1);

    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    if (left > 2) pages.push("...");

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = getPageNumbers();

  const commitInputPage = () => {
    let value = Number(inputPage);

    if (!Number.isFinite(value)) return;

    value = Math.floor(value);

    if (value < 1) value = 1;
    if (value > totalPages) value = totalPages;

    if (value !== page) {
      onPageChange(value);
    } else {
      setInputPage(String(page)); // reset nếu không đổi
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 w-full justify-center mt-6">
      <Pagination className="flex flex-wrap justify-center gap-2">
        <PaginationContent>
          {/* Prev */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) onPageChange(page - 1);
              }}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {pages.map((p, i) => (
            <PaginationItem key={i}>
              {p === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={page === p}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(Number(p));
                  }}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) onPageChange(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* 🔢 Jump to page (chỉ hiện khi nhiều trang) */}
      {totalPages > 6 && (
        <div className="flex items-center gap-2 text-sm">
          <span>Go to page</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={inputPage}
            onChange={(e) => {
              const val = e.target.value;
              // chỉ cho số hoặc rỗng
              if (/^\d*$/.test(val)) {
                setInputPage(val);
              }
            }}
            onBlur={commitInputPage}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitInputPage();
                e.currentTarget.blur();
              }
            }}
            className="w-20 text-center"
          />
          <span className="text-muted-foreground">/ {totalPages}</span>
        </div>
      )}
    </div>
  );
}
