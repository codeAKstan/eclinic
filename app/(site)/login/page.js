"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContents() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed");
      } else {
        setSuccess(true);
        if (data.role === "admin") {
          router.push(nextPath || "/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 md:px-6 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 text-center">Log in with email</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">E-mail</label>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg text-black  border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg text-black  border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-emerald-700 px-6 py-3 text-white shadow-md hover:bg-emerald-800 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Login successful.
        </div>
      )}

      <div className="mt-4 text-center text-sm">
        <Link href="#" className="text-emerald-700 hover:underline">Forgot your password?</Link>
      </div>
      <div className="mt-2 text-center text-sm text-black">
        Don&apos;t have an account? {" "}
        <Link href="/signup" className="text-emerald-700 hover:underline">Sign up</Link>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md px-4 md:px-6 py-12"><h1 className="text-2xl font-bold text-zinc-900 text-center">Loading...</h1></main>}>
      <LoginContents />
    </Suspense>
  );
}