import { Role } from "./topik.types";

export declare module "next-auth" {
  interface User {
    accessToken: string;
    roles?: Role[];
  }
  interface Session {
    accessToken: string;
    roles?: Role[];
  }
}
export declare module "@auth/core/jwt" {
  interface JWT {
    accessToken: string;
    roles?: Role[];
  }
}
