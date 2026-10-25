"use client";

import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";

export const SearchInput = () => {
  const [value, setValue] = useState("");

  const debouncedValue = useDebounce(value);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentQuery = searchParams.get("query") ?? "";
  const currentTags = searchParams.getAll("tags");

  useEffect(() => {
    if (currentQuery === debouncedValue) return;

    const params = queryString.stringify(
      {
        tags: currentTags,
        query: debouncedValue,
      },
      {
        skipEmptyString: true,
        skipNull: true,
        arrayFormat: "none",
      },
    );

    const url = params ? `${pathname}?${params}` : pathname;

    router.push(url);
  }, [
    currentQuery,
    debouncedValue,
    pathname,
    router,
    searchParams,
    currentTags.join(","),
  ]);

  return (
    <div className="relative max-w-[400px] flex-1">
      <Input
        className="peer h-9 pl-9"
        placeholder="Buscar um curso"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />

      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all peer-focus:text-primary"
        size={16}
      />
    </div>
  );
};
