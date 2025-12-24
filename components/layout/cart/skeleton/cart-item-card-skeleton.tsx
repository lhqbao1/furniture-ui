"use client";

export default function CartItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex gap-6 border-b py-6 items-center animate-pulse"
        >
          {/* IMAGE */}
          <div className="w-[120px] h-[120px] shrink-0 bg-muted rounded-xl" />

          {/* CONTENT */}
          <div className="w-full">
            {/* TITLE + META */}
            <div className="space-y-3">
              <div className="h-5 w-3/4 bg-muted rounded-xl" />
              <div className="h-4 w-1/2 bg-muted rounded-xl" />
              <div className="h-4 w-1/3 bg-muted rounded-xl" />

              {/* DELIVERY */}
              <div className="h-4 w-2/3 bg-muted rounded-xl mt-6" />
            </div>

            {/* BOTTOM */}
            <div className="flex md:flex-row flex-col-reverse md:items-end items-start justify-between mt-6">
              {/* QUANTITY */}
              <div className="flex items-center gap-3 mt-2">
                <div className="h-4 w-14 bg-muted rounded-xl" />

                {/* quantity control */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-xl" />
                  <div className="w-10 h-8 bg-muted rounded-xl" />
                  <div className="w-8 h-8 bg-muted rounded-xl" />
                </div>

                {/* icons */}
                <div className="flex gap-2">
                  <div className="w-5 h-5 bg-muted rounded-full" />
                  <div className="w-5 h-5 bg-muted rounded-full" />
                </div>
              </div>

              {/* PRICE */}
              <div className="h-6 w-24 bg-muted rounded-xl mb-2 md:mb-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
