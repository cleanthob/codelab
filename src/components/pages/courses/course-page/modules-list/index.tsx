import * as Accordion from "@radix-ui/react-accordion";
import { cn } from "cn";
import { ModuleItem } from "./module-item";

type ModulesListProps = {
  modules: CourseModuleWithLessons[];
};

export const ModulesList = ({ modules }: ModulesListProps) => {
  return (
    <aside
      className={cn(
        "h-full border-l border-border bg-sidebar",
        "p-4 overflow-y-auto overflow-x-hidden min-w-[380px] max-w-[380px]",
        "transition-all flex flex-col items-center",
      )}
    >
      <Accordion.Root
        type="single"
        className="w-full h-full flex flex-col gap-3"
        collapsible
      >
        {modules.map((courseModule) => (
          <ModuleItem key={courseModule.id} data={courseModule} />
        ))}
      </Accordion.Root>
    </aside>
  );
};
