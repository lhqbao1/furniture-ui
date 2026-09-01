"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { useUserV1Login } from "@/features/user-auth-v1/hook";

function getSafeRedirectPath() {
  if (typeof window === "undefined") {
    return "/dashboard";
  }

  const redirectPath = new URLSearchParams(window.location.search).get(
    "redirect",
  );

  if (
    redirectPath &&
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//")
  ) {
    return redirectPath;
  }

  return "/dashboard";
}

export default function LoginPageClient() {
  const router = useRouter();
  const loginMutation = useUserV1Login();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("user_v1_access_token");

    if (token) {
      router.replace(getSafeRedirectPath());
      return;
    }

    setIsCheckingSession(false);
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
      router.replace(getSafeRedirectPath());
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Login failed. Please check your email and password.",
      );
    }
  };

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fbf8] px-4">
        <Loader2 className="size-7 animate-spin text-[#08b55b]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(8,181,91,0.16),transparent_34%),linear-gradient(135deg,#f8fffb_0%,#ffffff_58%,#eefaf3_100%)] px-4 py-10">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden rounded-[2rem] border border-emerald-100 bg-white/70 p-10 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur lg:block">
          <div className="mb-12 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-[#08a653]">
            <Sparkles className="size-4" />
            User workspace
          </div>
          <h1 className="max-w-xl text-5xl font-bold tracking-tight text-slate-950">
            Welcome back to your dashboard.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
            Sign in to view your workspace, profile details, and permissions in
            one clean place.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {["Secure", "Fast", "Focused"].map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-8"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#08a653]">
              Login
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Sign in
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use your email and password to continue.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Email
              </span>
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-[#08b55b] focus-within:ring-4 focus-within:ring-emerald-100">
                <Mail className="mr-3 size-5 shrink-0 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="h-14 w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Password
              </span>
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-[#08b55b] focus-within:ring-4 focus-within:ring-emerald-100">
                <LockKeyhole className="mr-3 size-5 shrink-0 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Enter password"
                  className="h-14 w-full bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="ml-3 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </label>
          </div>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#08b55b] px-5 text-base font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-[#069f4f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loginMutation.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ArrowRight className="size-5" />
            )}
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}
