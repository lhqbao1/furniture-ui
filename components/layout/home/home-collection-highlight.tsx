import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/src/i18n/navigation";

export default async function HomeCollectionHighlight() {
  const t = await getTranslations("home_blocks");

  return (
    <section className="section-padding">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-stretch [--tile-top:10rem] [--tile-bottom:9rem] [--tile-gap:1rem] md:[--tile-top:14rem] md:[--tile-bottom:11rem]">
        <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-[radial-gradient(circle_at_top,_rgba(255,237,213,0.9),_rgba(255,255,255,0.9))] p-6 md:p-10 lg:h-[calc(var(--tile-top)+var(--tile-bottom)+var(--tile-gap))]">
          <div className="pointer-events-none absolute -left-14 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-orange-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 top-8 h-28 w-28 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-[var(--font-libre)] text-balance">
              {t("story_title")}
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-700 max-w-md">
              {t("story_body")}
            </p>
            <Link
              href="/shop-all"
              prefetch={false}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
              {t("story_cta")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          <div className="relative col-span-2 h-[var(--tile-top)] overflow-hidden rounded-2xl">
            <Image
              src="/home-collection.jpg"
              alt=""
              width={1200}
              height={600}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="relative h-[var(--tile-bottom)] overflow-hidden rounded-2xl">
            <Image
              src="/wpc.webp"
              alt=""
              width={800}
              height={800}
              sizes="(max-width: 1024px) 50vw, 22vw"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="relative h-[var(--tile-bottom)] overflow-hidden rounded-2xl">
            <Image
              src="/collection-5.jpg"
              alt=""
              width={800}
              height={800}
              sizes="(max-width: 1024px) 50vw, 22vw"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
