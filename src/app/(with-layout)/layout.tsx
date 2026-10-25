"use client";
import { Suspense } from "react";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-[70px] shrink-0 border-b items-center px-6 justify-between gap-2">
            <div className="flex-1 flex items-center gap-4">
              <SidebarTrigger className="flex md:hidden -ml-1" />
              <Suspense
                fallback={
                  <div className="h-9 max-w-[400px] flex-1 animate-pulse rounded-md bg-muted" />
                }
              >
                <SearchInput />
              </Suspense>
            </div>

            {isLoaded && !isSignedIn && (
              <Link href="/auth/sign-in">
                <Button size="sm">
                  <LogIn />
                  Entrar
                </Button>
              </Link>
            )}
          </header>

          <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
