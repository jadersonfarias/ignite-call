import NextAuth from "next-auth";

declare module "next-auth" {
  // mudando a tipagem para se adpitar ao meu adptor
  export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar_url: string;
  }

  interface Session {
    user: User;
  }
}
