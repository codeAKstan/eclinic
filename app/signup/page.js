"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dobMonth: "",
    dobDay: "",
    dobYear: "",
    gender: "",
    terms: false,
  });

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    // Placeholder submit; integrate with backend or auth provider later
    alert("Signup form submitted");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-12">
      <h1 className="text-2xl font-bold text-zinc-900">Create an account</h1>
      <p className="mt-2 text-sm text-black">
        Already have one? <Link href="/login" className="text-emerald-700 hover:underline">Log in</Link>.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">Your Name</label>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className="rounded-lg text-black border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="rounded-lg text-black  border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">E-mail</label>
          <input
            type="email"
            placeholder="Enter Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-lg text-black  border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full rounded-lg text-black  border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            className="w-full rounded-lg text-black  border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">Date of birth</label>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="MM"
              value={form.dobMonth}
              onChange={(e) => update("dobMonth", e.target.value)}
              className="rounded-lg border text-black  border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              placeholder="DD"
              value={form.dobDay}
              onChange={(e) => update("dobDay", e.target.value)}
              className="rounded-lg text-black  border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              placeholder="YYYY"
              value={form.dobYear}
              onChange={(e) => update("dobYear", e.target.value)}
              className="rounded-lg text-black  border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">Gender</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center text-black  gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <input
                type="radio"
                name="gender"
                checked={form.gender === "male"}
                onChange={() => update("gender", "male")}
              />
              Male
            </label>
            <label className="flex items-center text-black  gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <input
                type="radio"
                name="gender"
                checked={form.gender === "female"}
                onChange={() => update("gender", "female")}
              />
              Female
            </label>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => update("terms", e.target.checked)}
          />
          I have read and accept E-Clinic&apos;s
          <Link href="#" className="text-emerald-700 hover:underline">Terms of Use</Link>
          and
          <Link href="#" className="text-emerald-700 hover:underline">Privacy Policy</Link>.
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-emerald-600 px-6 py-3 text-white shadow-md hover:bg-emerald-700"
        >
          Save and continue
        </button>
      </form>
    </main>
  );
}