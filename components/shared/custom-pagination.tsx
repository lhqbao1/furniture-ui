"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const getPageNumbers = () => {
    const delta = 2; // số trang hiển thị 2 bên current
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    // Left ellipsis
    if (left > 2) {
      pages.push("...");
    }

    // Middle pages
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    // Right ellipsis
    if (right < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page (if > 1)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

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
    </div>
  );
}
