import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CONSOLE_ROLES, type Role } from "@/lib/constants";
import { loginSchema } from "@/lib/validations";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        return token;
      }
      // On every later session read, re-check the account so role changes and
      // deactivations take effect immediately instead of when the JWT expires.
      // (Runs only in Node route handlers / server components — the edge
      // middleware just decodes the token.)
      if (token.id) {
        const fresh = await prisma.user.findUnique({ where: { id: token.id }, select: { name: true, role: true, active: true } });
        if (!fresh || !fresh.active) return { sub: token.sub }; // signed out: no id/role
        token.name = fresh.name;
        token.role = fresh.role as Role;
      }
      void trigger; // useSession().update() lands here too and gets the fresh values above
      return token;
    },
    async session({ session, token }) {
      if (!token.id) return { expires: session.expires };
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
};

/** The current session, or null if signed out or the account is gone/deactivated. */
export async function getSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session : null;
}

/** Server-side guard: returns the signed-in user or redirects to login. */
export async function requireUser(callbackUrl = "/dashboard") {
  const session = await getSession();
  if (!session) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session.user;
}

/** Server-side guard for the admin console (staff + admins). */
export async function requireConsole(roles: Role[] = CONSOLE_ROLES) {
  const user = await requireUser("/admin");
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}
