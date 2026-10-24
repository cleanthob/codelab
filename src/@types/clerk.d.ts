export {};

export type Roles = "admin" | "member";

declare global {
  interface CustomJetSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
