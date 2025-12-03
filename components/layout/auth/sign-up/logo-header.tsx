import Image from "next/image";

export default function LogoHeader({ t }: { t: any }) {
  return (
    <div className="flex flex-col items-center mb-12 gap-3">
      <Image
        src="/new-logo.svg"
        width={100}
        height={100}
        alt=""
      />

      <h1 className="text-3xl font-semibold text-secondary text-center lg:block flex flex-col">
        <span>{t("welcomeTo")}</span>
        <span
          className="text-primary"
          translate="no"
        >
          Prestige Home
        </span>
      </h1>
    </div>
  );
}
