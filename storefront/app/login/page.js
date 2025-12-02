"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <div className="max-w-xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-slate-600">Sign in with Google via NextAuth to personalize your experience.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading session...</p>
      ) : session ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
              {session.user?.image ? (
                <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-600">
                  {(session.user?.name || session.user?.email || "?").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-900">{session.user?.name}</p>
              <p className="text-slate-600">{session.user?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => signOut()}
              className="rounded-lg bg-black px-5 py-3 text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign out
            </button>
            <Link
              href="/products"
              className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-slate-800 shadow-sm hover:border-black/60"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => signIn("google")}
            className="inline-flex items-center gap-3 rounded-lg bg-red-600 px-6 py-3 text-white shadow hover:-translate-y-0.5 hover:shadow-lg transition"
          >
            <svg
              aria-hidden
              className="h-5 w-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M21.35 11.1h-9.17v2.98h5.57c-.24 1.4-.95 2.59-2.03 3.39v2.82h3.28c1.92-1.77 3.02-4.38 3.02-7.5 0-.72-.06-1.42-.17-2.1Z" />
              <path d="M12.18 22c2.74 0 5.05-.9 6.74-2.47l-3.28-2.82c-.9.6-2.05.96-3.46.96-2.66 0-4.9-1.8-5.7-4.23H3.08v2.95C4.75 19.94 8.2 22 12.18 22Z" />
              <path d="M6.48 13.44c-.2-.6-.31-1.24-.31-1.9s.11-1.31.31-1.9V6.69H3.08A9.78 9.78 0 0 0 2.2 11.54c0 1.58.37 3.07.88 4.46l3.4-2.56Z" />
              <path d="M12.18 4.78c1.49 0 2.82.51 3.87 1.5l2.9-2.9C17.22 1.57 14.91.64 12.18.64 8.2.64 4.75 2.7 3.08 5.9l3.4 2.95c.8-2.44 3.04-4.07 5.7-4.07Z" />
            </svg>
            Continue with Google
          </button>
          <p className="text-sm text-slate-500">
            Set <code className="rounded bg-slate-100 px-1">GOOGLE_CLIENT_ID</code>, <code className="rounded bg-slate-100 px-1">GOOGLE_CLIENT_SECRET</code>, and <code className="rounded bg-slate-100 px-1">NEXTAUTH_SECRET</code> in <code className="rounded bg-slate-100 px-1">.env.local</code>.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>Want to keep browsing?</span>
        <Link href="/products" className="font-semibold text-black underline underline-offset-4">
          View products
        </Link>
      </div>
    </div>
  );
}
