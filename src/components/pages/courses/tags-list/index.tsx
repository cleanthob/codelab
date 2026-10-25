import { DraggableScroll } from "@/components/shared/draggable-scroll";
import { prisma } from "@/lib/prisma";
import { TagItem } from "./tag-item";

export const CourseTagsList = async () => {
  const tags = await prisma.courseTag.findMany();

  const sortedTags = tags.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <DraggableScroll className="w-full flex gap-2 overflow-auto scroll-hidden pr-28 mask-r-from-80% outline-none">
      {sortedTags.map((tag) => (
        <TagItem key={tag.id} tag={tag} />
      ))}
    </DraggableScroll>
  );
};
