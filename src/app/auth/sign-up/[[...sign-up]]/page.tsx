import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Carregando cadastro...</div>}>
      <SignUp signInUrl="/auth/sign-in" />
    </Suspense>
  );
}
