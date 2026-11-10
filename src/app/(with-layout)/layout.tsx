import { ReactNode, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import LayoutContent from "@/components/layout-content";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <Suspense fallback={<Skeleton />}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
