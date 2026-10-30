import { ClientProviders } from "@/components/shared/client-providers";
import { cn } from "@/lib/utils";
import "@/styles/clerk.css";
import "@/styles/globals.css";
import { ptBR } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { setDefaultOptions } from "date-fns";
import { ptBR as dateFnsPtBR } from "date-fns/locale";

setDefaultOptions({ locale: dateFnsPtBR });

const nunito = Nunito({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Codelab",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      localization={ptBR}
      ui={ui}
      appearance={{
        variables: {
          colorPrimary: "hsl(160 100% 37%)",
        },
      }}
    >
      <html
        lang="pt-BR"
        suppressHydrationWarning
        className={cn("antialiased", "font-sans dark", nunito.variable)}
      >
        <body className="min-h-full flex flex-col">
          <ClientProviders>{children}</ClientProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
