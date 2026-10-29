"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/preferences";
import * as Accordion from "@radix-ui/react-accordion";
import { PanelRightOpen } from "lucide-react";
import { useEffect, useRef } from "react";
import { ModuleItem } from "./module-item";
import { useQuery } from "@tanstack/react-query";
import { getCourseProgress } from "@/actions/course-progress";
import { useParams } from "next/navigation";
import { queryKeys } from "@/constants/query-keys";

type ModulesListProps = {
  modules: CourseModuleWithLessons[];
};

export const ModulesList = ({ modules }: ModulesListProps) => {
  const params = useParams();
  const courseSlug = params.slug as string;
  const moduleId = params.moduleId as string;

  const {
    expandedModule,
    setExpandedModule,
    modulesListCollapsed,
    setModulesListCollapsed,
  } = usePreferencesStore();

  const initialCollapsedIsSet = useRef(false);

  useEffect(() => {
    if (initialCollapsedIsSet.current) return;

    initialCollapsedIsSet.current = true;

    setModulesListCollapsed(window.innerWidth < 768);
  }, [setModulesListCollapsed]);

  const handleToggleCollapsed = () => {
    setModulesListCollapsed(!modulesListCollapsed);
  };

  const { data: courseProgress } = useQuery({
    queryKey: queryKeys.courseProgress(courseSlug),
    queryFn: () => getCourseProgress(courseSlug),
    enabled: !!courseSlug,
    staleTime: 0,
  });

  useEffect(() => {
    console.log("Progresso atualizado:", courseProgress?.completedLessons);
  }, [courseProgress]);

  const completedLessons = courseProgress?.completedLessons ?? [];

  console.log(completedLessons);

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col items-center overflow-x-hidden border-l border-border bg-sidebar transition-all duration-300",
        !modulesListCollapsed &&
          "fixed top-0 bottom-0 z-10 right-0 sm:relative",
        modulesListCollapsed
          ? "hidden w-[72px] min-w-[72px] max-w-[72px] p-2 sm:flex"
          : "w-[380px] min-w-[380px] max-w-[380px] overflow-y-auto p-4",
      )}
    >
      {!modulesListCollapsed && (
        <div
          className={cn(
            "group absolute bottom-0 left-0",
            "top-0 z-10 flex w-2 cursor-e-resize justify-start",
            modulesListCollapsed && "cursor-w-resize",
          )}
          onClick={handleToggleCollapsed}
          title="Recolher lista de módulos"
        >
          <div className="h-full w-0.5 transition-colors group-hover:bg-sidebar-border" />
        </div>
      )}

      {modulesListCollapsed ? (
        <Button
          size="icon"
          variant="outline"
          onClick={handleToggleCollapsed}
          className="h-10 w-10 shrink-0"
          title="Expandir lista de módulos"
          aria-label="Expandir lista de módulos"
        >
          <PanelRightOpen className="h-5 w-5" />
        </Button>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={handleToggleCollapsed}
            className="w-full flex sm:hidden mb-4"
          >
            Fechar módulos
          </Button>
          <Accordion.Root
            type="single"
            value={expandedModule ?? ""}
            onValueChange={setExpandedModule}
            className="flex h-full w-full flex-col gap-3"
            collapsible
            defaultValue={moduleId}
          >
            {modules.map((courseModule) => (
              <ModuleItem
                key={courseModule.id}
                data={courseModule}
                completedLessons={completedLessons}
              />
            ))}
          </Accordion.Root>
        </>
      )}
    </aside>
  );
};
