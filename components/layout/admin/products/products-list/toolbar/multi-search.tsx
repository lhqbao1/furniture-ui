import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";

const MultiSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(searchParams.get("multi_search") ?? "");
  }, [searchParams]);

  const handleSearch = () => {
    const normalized = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .join(",");

    const params = new URLSearchParams(searchParams);
    if (normalized) {
      params.set("multi_search", normalized);
      params.set("page", "1");
    } else {
      params.delete("multi_search");
    }

    router.push(
      {
        pathname,
        query: Object.fromEntries(params.entries()),
      },
      { scroll: false },
    );
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("multi_search");
    params.set("page", "1");
    setValue("");
    router.push(
      {
        pathname,
        query: Object.fromEntries(params.entries()),
      },
      { scroll: false },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Multiple search">
          <Search className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[320px] p-4 space-y-3">
        <DropdownMenuLabel>Multiple search</DropdownMenuLabel>
        <Textarea
          placeholder='Example: "123,234,456"'
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MultiSearch;
