export type PackageInput = {
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
};

export type CarrierType =
  | "dpd"
  | "amm"
  | "spedition"
  | string
  | null
  | undefined;
export type BundleInput = { quantity?: number | null } | null | undefined;

const DPD_LIMITS = {
  maxWeightKg: 31,
  maxLengthCm: 175,
  maxGirthCm: 300,
};

const DPD_RATES: Array<{ maxKg: number; price: number }> = [
  { maxKg: 3, price: 3.0 },
  { maxKg: 5, price: 3.4 },
  { maxKg: 10, price: 3.9 },
  { maxKg: 15, price: 4.4 },
  { maxKg: 20, price: 4.6 },
  { maxKg: 25, price: 4.8 },
  { maxKg: 31.5, price: 5.1 },
];

const SPEDITION_RATES: Array<{ maxKg: number; price: number }> = [
  { maxKg: 75, price: 31.5 },
  { maxKg: 100, price: 34.16 },
  { maxKg: 150, price: 39.4 },
  { maxKg: 200, price: 44.85 },
  { maxKg: 250, price: 49.9 },
  { maxKg: 300, price: 54.25 },
  { maxKg: 350, price: 59.7 },
  { maxKg: 400, price: 64.55 },
  { maxKg: 450, price: 70.5 },
  { maxKg: 500, price: 75.9 },
  { maxKg: 550, price: 83.5 },
  { maxKg: 600, price: 86.9 },
  { maxKg: 650, price: 95.5 },
  { maxKg: 700, price: 98.9 },
  { maxKg: 750, price: 106.8 },
  { maxKg: 800, price: 110.1 },
  { maxKg: 850, price: 118.1 },
  { maxKg: 900, price: 121.4 },
  { maxKg: 950, price: 130.2 },
  { maxKg: 1000, price: 133.5 },
  { maxKg: 1100, price: 145.1 },
  { maxKg: 1200, price: 156.6 },
  { maxKg: 1300, price: 168.8 },
  { maxKg: 1400, price: 180.3 },
  { maxKg: 1500, price: 191.7 },
  { maxKg: 1600, price: 203.8 },
  { maxKg: 1700, price: 215.2 },
  { maxKg: 1800, price: 226.6 },
  { maxKg: 1900, price: 238.6 },
  { maxKg: 2000, price: 250.0 },
  { maxKg: 2100, price: 261.6 },
  { maxKg: 2200, price: 267.7 },
  { maxKg: 2300, price: 273.1 },
  { maxKg: 2400, price: 278.4 },
  { maxKg: 2500, price: 284.4 },
  { maxKg: 2600, price: 289.7 },
  { maxKg: 2700, price: 294.9 },
  { maxKg: 2800, price: 300.8 },
  { maxKg: 2900, price: 310.5 },
  { maxKg: 3000, price: 320.1 },
];

function pickRate(
  rates: Array<{ maxKg: number; price: number }>,
  weightKg: number,
) {
  return rates.find((rate) => weightKg <= rate.maxKg) ?? null;
}

function getDpdGirthCm(length: number, width: number, height: number) {
  const longest = Math.max(length, width, height);
  const sum = length + width + height;
  return longest + 2 * (sum - longest);
}

function calcPackageCost(pkg: PackageInput) {
  const { weight, length, width, height } = pkg;

  if (weight == null) {
    return { cost: null };
  }

  const adjustedWeight = weight + 5;
  const rate = pickRate(SPEDITION_RATES, adjustedWeight);
  if (!rate) {
    return { cost: null, error: "Spedition rate not available over 3000 kg." };
  }

  return { cost: rate.price + 6 };
}

function calcPackageCostDpd(pkg: PackageInput) {
  const { weight, length, width, height } = pkg;

  if (weight == null) {
    return { cost: null };
  }

  if (weight >= DPD_LIMITS.maxWeightKg) {
    return {
      cost: null,
      error: "DPD Classic weight limit exceeded (31 kg).",
    };
  }

  if (length == null || width == null || height == null) {
    return { cost: null };
  }

  const longest = Math.max(length, width, height);
  const girth = getDpdGirthCm(length, width, height);

  if (longest > DPD_LIMITS.maxLengthCm || girth > DPD_LIMITS.maxGirthCm) {
    return {
      cost: null,
      error: "DPD Classic size limits exceeded (175 cm / 300 cm girth).",
    };
  }

  const rate = pickRate(DPD_RATES, weight);
  if (!rate) {
    return { cost: null, error: "No DPD rate found for this weight." };
  }

  return { cost: rate.price };
}

export function calcDeliveryCost(
  packages: PackageInput[],
  carrier: CarrierType,
) {
  if (!packages?.length) {
    return {
      cost: null as number | null,
      error: undefined as string | undefined,
    };
  }

  const normalizedCarrier = carrier === "spedition" ? "amm" : carrier;
  const isDpd = normalizedCarrier === "dpd";

  let total = 0;

  for (const pkg of packages) {
    const result = isDpd ? calcPackageCostDpd(pkg) : calcPackageCost(pkg);
    if (result.error)
      return { cost: null as number | null, error: result.error };
    if (result.cost == null) {
      return {
        cost: null as number | null,
        error: undefined as string | undefined,
      };
    }
    total += result.cost;
  }

  return {
    cost: Number(total.toFixed(2)),
    error: undefined as string | undefined,
  };
}

export function aggregatePackages(
  packages: PackageInput[] | null | undefined,
  bundles?: BundleInput[],
) {
  if (!packages || packages.length === 0) return null;

  let totalWeight = 0;
  let totalLength = 0;
  let totalWidth = 0;
  let totalHeight = 0;

  for (let index = 0; index < packages.length; index += 1) {
    const pkg = packages[index] ?? {};
    const rawQuantity = Number(bundles?.[index]?.quantity ?? 1);
    const quantity =
      Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;

    if (
      pkg.weight == null ||
      pkg.length == null ||
      pkg.width == null ||
      pkg.height == null
    ) {
      return null;
    }

    totalWeight += pkg.weight * quantity;
    totalLength += pkg.length * quantity;
    totalWidth += pkg.width * quantity;
    totalHeight += pkg.height * quantity;
  }

  return {
    weight: totalWeight,
    length: totalLength,
    width: totalWidth,
    height: totalHeight,
  };
}
