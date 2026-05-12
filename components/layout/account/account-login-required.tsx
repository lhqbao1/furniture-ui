"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/src/i18n/navigation";
import {
  ArrowRight,
  FileText,
  LockKeyhole,
  MapPinned,
  PackageSearch,
} from "lucide-react";

const ACCOUNT_FEATURES = [
  {
    icon: PackageSearch,
    title: "Bestellungen verfolgen",
    description: "Lieferstatus, Retouren und Bestelldetails an einem Ort.",
  },
  {
    icon: MapPinned,
    title: "Adressen verwalten",
    description: "Liefer- und Rechnungsadressen schnell aktualisieren.",
  },
  {
    icon: FileText,
    title: "Rechnungen einsehen",
    description: "Dokumente und frühere Einkäufe jederzeit abrufen.",
  },
];

const AccountLoginRequired = () => {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-secondary/15 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.35)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

      <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
            <LockKeyhole className="h-4 w-4" />
            Geschützter Bereich
          </div>

          <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            Sie müssen angemeldet sein, um Ihr Konto aufzurufen.
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Bitte melden Sie sich mit Ihrem Kundenkonto an. Erst danach können
            Sie Bestellungen, Adressen und Rechnungen auf dieser Seite sehen
            und verwalten.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              className="h-11 rounded-full bg-secondary px-6 text-white hover:bg-secondary/90"
            >
              <Link href="/login">
                Zum Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-11 rounded-full px-6">
              <Link href="/">Zur Startseite</Link>
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-secondary/15 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.14),_transparent_38%),linear-gradient(180deg,_#ffffff,_#f8fbf7)] p-6">
          <div className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-secondary/80">
            Mit Konto verfugbar
          </div>

          <div className="space-y-4">
            {ACCOUNT_FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-foreground">
                      {title}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLoginRequired;
