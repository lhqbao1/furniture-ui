import Image from "next/image";

type TranslationFn = (key: string) => string;

export default function LogoHeader({ t }: { t: TranslationFn }) {
  return (
    <div className="mb-8 flex flex-col items-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary/10 bg-white shadow-sm">
        <Image
          src="/new-logo.svg"
          width={52}
          height={52}
          alt="Prestige Home"
          priority
        />
      </div>

      <h1 className="text-balance text-3xl font-semibold tracking-tight text-secondary">
        <span>{t("welcomeTo")}</span>
        <span
          className="ml-2 text-primary"
          translate="no"
        >
          Prestige Home
        </span>
      </h1>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        Erstellen Sie Ihr Konto in wenigen Schritten und verwalten Sie Ihre
        Bestellungen komfortabel online.
      </p>
    </div>
  );
}
