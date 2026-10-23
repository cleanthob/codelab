"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function SignOutPage() {
  return (
    <div>
      <h1>Sair da conta</h1>
      <SignOutButton>
        <button type="button">Sair</button>
      </SignOutButton>
    </div>
  );
}
