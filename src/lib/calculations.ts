export type JobStatus = "PENDING" | "PRINTING" | "COMPLETED" | "CANCELLED";

export interface JobFormData {
  customerName: string;
  productName: string;
  quantity: number;
  filamentUsedGrams: number;
  printTimeMinutes: number;
  filamentCost: number;
  electricityCost: number;
  otherCost: number;
  sellingPrice: number;
  status: JobStatus;
}

export function calculateTotalCost(
  filamentCost: number,
  electricityCost: number,
  otherCost: number
): number {
  const total = (Number(filamentCost) || 0) + (Number(electricityCost) || 0) + (Number(otherCost) || 0);
  return Math.round(total * 100) / 100;
}

export function calculateProfit(sellingPrice: number, totalCost: number): number {
  const profit = (Number(sellingPrice) || 0) - (Number(totalCost) || 0);
  return Math.round(profit * 100) / 100;
}

export function calculateProfitMargin(profit: number, sellingPrice: number): number {
  const price = Number(sellingPrice) || 0;
  if (price <= 0) return 0;
  const margin = (profit / price) * 100;
  return Math.round(margin * 10) / 10;
}

export function formatINR(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
  }).format(rounded);
  return `₹${formatted}`;
}

export function formatPrintTime(minutes: number): string {
  const mins = Math.max(0, Math.floor(minutes || 0));
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours === 0) {
    return `${remainingMins}m`;
  }
  return `${hours}h ${remainingMins}m`;
}

export function formatGrams(grams: number): string {
  return `${Math.round(grams)}g`;
}

export function formatDate(dateInput: Date | string): string {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatJobId(indexOrId: string | number): string {
  if (typeof indexOrId === "number") {
    return `#${String(indexOrId).padStart(3, "0")}`;
  }
  // If cuid or long string, take last 4 chars in uppercase
  if (typeof indexOrId === "string" && indexOrId.length > 6) {
    return `#${indexOrId.slice(-4).toUpperCase()}`;
  }
  return `#${indexOrId}`;
}

// Bambu Lab P2S & Indian 3D Printing Market Material Presets
export interface MaterialPreset {
  id: string;
  name: string;
  pricePerKg: number;
  description: string;
}

export const BAMBU_MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: "pla",
    name: "Bambu PLA Basic / Matte",
    pricePerKg: 1599,
    description: "Prototyping & decorative models",
  },
  {
    id: "petg",
    name: "Bambu PETG-HF / Basic",
    pricePerKg: 1799,
    description: "High impact, UV & moisture resistant",
  },
  {
    id: "abs",
    name: "Bambu ABS / ASA",
    pricePerKg: 2199,
    description: "Heat resistant enclosures up to 95°C",
  },
  {
    id: "tpu",
    name: "Bambu TPU 95A Flexible",
    pricePerKg: 2899,
    description: "Rubbery impact-absorbing gaskets",
  },
  {
    id: "generic",
    name: "Generic PLA / PETG",
    pricePerKg: 1200,
    description: "Standard third-party spools",
  },
];

export interface BambuEstimatorParams {
  grams: number;
  printTimeMinutes: number;
  materialPricePerKg?: number;
  electricityRateKwh?: number;
  powerDrawWatts?: number;
  machineWearPerHour?: number;
  laborMinutes?: number;
  laborRatePerHour?: number;
  scrapRatePercent?: number;
  packagingCost?: number;
}

// Exact cost formulas from https://3d-print-calculator-pink.vercel.app/
export function estimateCostsWithBambuP2S({
  grams,
  printTimeMinutes,
  materialPricePerKg = 1599,
  electricityRateKwh = 8.5,
  powerDrawWatts = 130,
  machineWearPerHour = 18,
  laborMinutes = 15,
  laborRatePerHour = 150,
  scrapRatePercent = 8,
  packagingCost = 25,
}: BambuEstimatorParams) {
  const hours = Math.max(0, printTimeMinutes / 60);
  const safeGrams = Math.max(0, grams);

  // 1. Material Cost: (grams / 1000) * pricePerKg
  const filamentCost = Math.round((safeGrams / 1000) * materialPricePerKg * 100) / 100;

  // 2. Electricity: (130W * hours / 1000) * ₹8.50/kWh
  const kwh = (powerDrawWatts * hours) / 1000;
  const electricityCost = Math.round(kwh * electricityRateKwh * 100) / 100;

  // 3. Wear & Maintenance: ₹18.00 / hour
  const wearCost = hours * machineWearPerHour;

  // 4. Labor: (15m / 60) * ₹150 / hr = ₹37.50
  const laborCost = (laborMinutes / 60) * laborRatePerHour;

  // 5. Scrap Contingency: 8% of (Material + Electricity + Wear)
  const scrapCost = (filamentCost + electricityCost + wearCost) * (scrapRatePercent / 100);

  // 6. Other Cost: wear + labor + scrap + packaging
  const otherCost = Math.round((wearCost + laborCost + scrapCost + packagingCost) * 100) / 100;

  // Total Unit Production Cost
  const totalCost = calculateTotalCost(filamentCost, electricityCost, otherCost);

  // 3 Pricing Tiers (Margin % Mode: Price = Cost / (1 - Margin))
  const volumePrice = totalCost > 0 ? Math.ceil(totalCost / (1 - 0.28)) : 0;
  const recommendedPrice = totalCost > 0 ? Math.ceil(totalCost / (1 - 0.52)) : 0;
  const highValuePrice = totalCost > 0 ? Math.ceil(totalCost / (1 - 0.72)) : 0;

  return {
    filamentCost,
    electricityCost,
    otherCost,
    totalCost,
    tiers: {
      volume: volumePrice,
      recommended: recommendedPrice,
      highValue: highValuePrice,
    },
  };
}
