import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function HomeValueProps() {
  const t = await getTranslations("home_blocks");

  const items = [
    {
      icon: "/tracking.svg",
      title: t("value_1_title"),
      body: t("value_1_body"),
    },
    {
      icon: "/credit-card.png",
      title: t("value_2_title"),
      body: t("value_2_body"),
    },
    {
      icon: "/gift-box.png",
      title: t("value_3_title"),
      body: t("value_3_body"),
    },
    {
      icon: "/award.png",
      title: t("value_4_title"),
      body: t("value_4_body"),
    },
  ];

  return (
    <section className="section-padding">
      <div className="relative overflow-hidden rounded-2xl border border-orange-100/60 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-amber-200/40 blur-2xl" />
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-[var(--font-libre)] text-balance">
            {t("value_title")}
          </h2>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100"
                  aria-hidden="true"
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={20}
                    height={20}
                    loading="lazy"
                    sizes="40px"
                    className="h-5 w-5"
                  />
                </div>
                <div className="text-sm font-semibold text-black">
                  {item.title}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-600">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
