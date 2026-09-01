"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
  UserRound,
  Warehouse,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { userAuthV1Keys, useUserV1Me } from "@/features/user-auth-v1/hook";

export default function DashboardPageClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(false);
  const { data, isError, isLoading } = useUserV1Me();

  useEffect(() => {
    const token = localStorage.getItem("user_v1_access_token");

    if (!token) {
      router.replace("/login?redirect=/dashboard");
      return;
    }

    setHasToken(true);
  }, [router]);

  useEffect(() => {
    if (data?.access_token) {
      localStorage.setItem("user_v1_access_token", data.access_token);
    }
  }, [data?.access_token]);

  useEffect(() => {
    if (!isError) {
      return;
    }

    localStorage.removeItem("user_v1_access_token");
    localStorage.removeItem("user_v1_user_id");
    queryClient.removeQueries({ queryKey: userAuthV1Keys.all });
    router.replace("/login?redirect=/dashboard");
  }, [isError, queryClient, router]);

  const user = data?.user;
  const permissions = data?.permissions ?? [];
  const displayName = useMemo(() => {
    if (!user) {
      return "User";
    }

    return user.full_name?.trim() || user.email || "User";
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user_v1_access_token");
    localStorage.removeItem("user_v1_user_id");
    queryClient.removeQueries({ queryKey: userAuthV1Keys.all });
    router.replace("/login");
  };

  if (!hasToken || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fbf8] px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="size-5 animate-spin text-[#08b55b]" />
          Loading dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(8,181,91,0.16),transparent_30%),linear-gradient(135deg,#fbfffd_0%,#ffffff_58%,#eefaf3_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-emerald-100 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-[#08a653]">
              Dashboard
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Hello, {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              This is a simple protected dashboard using the new user auth API.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            icon={<UserRound className="size-5" />}
            label="Email"
            value={user?.email || "-"}
          />
          <DashboardCard
            icon={<ShieldCheck className="size-5" />}
            label="Role"
            value={user?.role || "-"}
          />
          <DashboardCard
            icon={<Warehouse className="size-5" />}
            label="Warehouse"
            value={user?.warehouse_id || "-"}
          />
          <DashboardCard
            icon={<KeyRound className="size-5" />}
            label="Permissions"
            value={`${permissions.length}`}
          />
        </div>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Account overview
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Basic data returned from `/api/v1/auth/me`.
              </p>
            </div>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-[#08a653]">
              {data?.token_type || "bearer"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <InfoRow label="User ID" value={user?.id} />
            <InfoRow label="Partner ID" value={user?.partner_id} />
            <InfoRow label="Warehouse ID" value={user?.warehouse_id} />
            <InfoRow label="Full name" value={user?.full_name} />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Permissions
            </p>
            {permissions.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No permissions returned.
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function DashboardCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
      <div className="mb-5 inline-flex rounded-2xl bg-emerald-50 p-3 text-[#08a653]">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 truncate text-lg font-bold text-slate-950" title={value}>
        {value}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}
