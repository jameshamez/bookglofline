import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { OAuthConfig } from "next-auth/providers/oauth";
import { prisma } from "@/lib/prisma";

type LineProfile = {
  sub: string;
  name?: string;
  picture?: string;
  email?: string;
};

const lineProvider: OAuthConfig<LineProfile> = {
  id: "line",
  name: "LINE",
  type: "oauth",
  wellKnown: "https://access.line.me/.well-known/openid-configuration",
  authorization: {
    params: {
      scope: "openid profile email",
    },
  },
  checks: ["pkce", "state", "nonce"],
  clientId: process.env.LINE_CLIENT_ID ?? "",
  clientSecret: process.env.LINE_CLIENT_SECRET ?? "",
  idToken: true,
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name ?? "LINE Member",
      email: profile.email ?? null,
      image: profile.picture ?? null,
    };
  },
};

async function ensureUser(token: JWT) {
  if (!token.lineUserId) {
    return token;
  }

  const user = await prisma.user.findUnique({
    where: { lineUserId: token.lineUserId },
  });

  if (!user) {
    return token;
  }

  token.userId = user.id;
  token.name = user.name ?? token.name;
  token.email = user.email ?? token.email;
  token.picture = user.image ?? token.picture;

  return token;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [lineProvider],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, profile }) {
      const lineProfile = profile as LineProfile | undefined;

      if (!lineProfile?.sub) {
        return false;
      }

      await prisma.user.upsert({
        where: { lineUserId: lineProfile.sub },
        update: {
          name: user.name ?? lineProfile.name ?? "LINE Member",
          email: user.email ?? lineProfile.email ?? null,
          image: user.image ?? lineProfile.picture ?? null,
        },
        create: {
          lineUserId: lineProfile.sub,
          name: user.name ?? lineProfile.name ?? "LINE Member",
          email: user.email ?? lineProfile.email ?? null,
          image: user.image ?? lineProfile.picture ?? null,
        },
      });

      return true;
    },
    async jwt({ token, profile }) {
      const lineProfile = profile as LineProfile | undefined;

      if (lineProfile?.sub) {
        token.lineUserId = lineProfile.sub;
      }

      return ensureUser(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? "";
        session.user.lineUserId = token.lineUserId ?? "";
      }

      return session;
    },
  },
};

export const isLineAuthConfigured = Boolean(
  process.env.NEXTAUTH_SECRET &&
    process.env.LINE_CLIENT_ID &&
    process.env.LINE_CLIENT_SECRET,
);
