import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// For Prisma adapter, since there are two primsa clients in the monorepo, 
// we will stick to a sandboxed mock for now as per the plan: 
// "configure them in a 'Sandboxed Development Mode' that gracefully handles missing keys"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!process.env.GOOGLE_CLIENT_ID) {
        console.warn("Sandboxed NextAuth signIn - missing GOOGLE_CLIENT_ID");
        return true; // Allow in sandbox
      }
      return true;
    },
    async session({ session, user, token }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "sandboxed-secret-1234567890",
  pages: {
    signIn: '/login', // Optional: customize if needed
  }
});

export { handler as GET, handler as POST };
