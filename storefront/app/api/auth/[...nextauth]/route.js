import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { API_BASE } from "@/utils/api";

async function exchangeGoogleToken(idToken) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Backend auth failed");
  }

  return res.json();
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Allow slower networks to complete OpenID discovery and token exchange.
      client: {
        httpOptions: {
          timeout: 10000
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.name = profile.name || token.name;
        token.email = profile.email || token.email;
        token.picture = profile.picture || token.picture;
      }

      // On first sign-in, exchange Google id_token for backend JWT + user
      if (account?.provider === "google" && account.id_token) {
        const exchange = await exchangeGoogleToken(account.id_token);
        token.apiToken = exchange.token;
        token.apiUser = exchange.user;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          name: token.name,
          email: token.email,
          image: token.picture,
          apiUser: token.apiUser
        };
        session.apiToken = token.apiToken || null;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
