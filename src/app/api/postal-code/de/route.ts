import { NextResponse } from "next/server";
import germanPostcodeMap from "@/data/german-postcodes-map.json";

const POSTCODE_CITY_MAP = germanPostcodeMap as Record<string, string[]>;
const MAX_SUGGESTIONS = 12;

const unique = <T,>(items: T[]) => Array.from(new Set(items));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPostalCode = searchParams.get("postal_code") ?? "";
    const postalCode = rawPostalCode.replace(/\D/g, "").slice(0, 5);

    if (!postalCode) {
      return NextResponse.json({
        postal_code: "",
        cities: [],
      });
    }

    if (postalCode.length === 5) {
      return NextResponse.json({
        postal_code: postalCode,
        cities: POSTCODE_CITY_MAP[postalCode] ?? [],
      });
    }

    const matchedPostcodes = Object.keys(POSTCODE_CITY_MAP).filter((code) =>
      code.startsWith(postalCode),
    );

    const cities = unique(
      matchedPostcodes.flatMap((code) => POSTCODE_CITY_MAP[code] ?? []),
    ).slice(0, MAX_SUGGESTIONS);

    return NextResponse.json({
      postal_code: postalCode,
      cities,
    });
  } catch (error) {
    console.error("Failed to suggest German postal code cities:", error);
    return NextResponse.json(
      {
        postal_code: "",
        cities: [],
      },
      { status: 500 },
    );
  }
}

