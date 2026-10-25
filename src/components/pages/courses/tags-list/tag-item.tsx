"use client";

import { Badge } from "@/components/ui/badge";
import { CourseTag } from "@/generated/prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";

type TagItemProps = {
  tag: CourseTag;
};

export const TagItem = ({ tag }: TagItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentIds = searchParams.getAll("tags");
  const currentQuery = searchParams.get("query");

  const isSelected = currentIds?.includes(tag.id);

  const onSelect = () => {
    const url = queryString.stringifyUrl(
      {
        url: pathname,
        query: {
          query: currentQuery,
          tags: isSelected
            ? currentIds.filter((id) => id !== tag.id)
            : [...currentIds, tag.id],
        },
      },
      { skipEmptyString: true, skipNull: true },
    );

    router.push(url);
  };

  return (
    <Badge
      variant={isSelected ? "default" : "outline"}
      className="whitespace-nowrap hover:border-primary cursor-pointer!"
      onClick={onSelect}
    >
      {tag.name}
    </Badge>
  );
};
