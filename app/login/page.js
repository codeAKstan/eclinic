"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    alert("Login form submitted");
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
          className="w-full rounded-full bg-emerald-700 px-6 py-3 text-white shadow-md hover:bg-emerald-800"
        >
          Sign In
        </button>
      </form>

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