import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    roles: Role[];
  }
  interface Session {
    user: User;
  }
}

// NextAuth v5 uses @auth/core/jwt internally
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    roles: Role[];
  }
}

// Keep for backwards compatibility
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: Role[];
  }
}
