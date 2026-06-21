"use client";
import React, { useState } from "react";

export default function Follow() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      return;
    }
    setStatus("pending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <aside className="max-w-md mx-auto py-8 px-6">
      <h4 className="text-lg font-semibold mb-2">Stay updated</h4>
      <p className="text-sm text-neutral-600 mb-4">Subscribe to member updates and event invitations.</p>
      <form onSubmit={onSubmit} className="flex gap-2" aria-live="polite">
        <label htmlFor="follow-email" className="sr-only">
          Email
        </label>
        <input
          id="follow-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-invalid={status === "error"}
        />
        <button
          type="submit"
          disabled={status === "pending"}
          className="rounded-md bg-indigo-600 text-white px-4 py-2 hover:brightness-105 active:scale-95 transition-transform duration-150 ease-out disabled:opacity-60"
        >
          {status === "pending" ? "Sending…" : "Subscribe"}
        </button>
      </form>
      {status === "success" && <p className="mt-3 text-sm text-green-600">Thanks! We&apos;ll be in touch.</p>}
      {status === "error" && <p className="mt-3 text-sm text-red-600">Please enter a valid email.</p>}
    </aside>
  );
}
