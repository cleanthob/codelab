import { Skeleton } from "@/components/ui/skeleton";
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-[22px] min-h-[22px]" />}>
      <SignIn signUpUrl="/auth/sign-up" />
    </Suspense>
  );
}
