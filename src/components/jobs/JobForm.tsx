"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  calculateTotalCost,
  calculateProfit,
  calculateProfitMargin,
  formatINR,
  JobFormData,
  JobStatus,
  BAMBU_MATERIAL_PRESETS,
  estimateCostsWithBambuP2S,
  formatPrintTime,
  formatGrams,
} from "@/lib/calculations";
import { createPrintJob, updatePrintJob } from "@/lib/actions";
import { Button } from "@/components/apple/Button";
import { Card } from "@/components/apple/Card";
import {
  User,
  Box,
  Layers,
  Clock,
  IndianRupee,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
  Zap,
} from "lucide-react";

interface JobFormProps {
  initialData?: JobFormData & { id?: string };
  mode: "create" | "edit";
}

export function JobForm({ initialData, mode }: JobFormProps) {
  const router = useRouter();

  // When editing, initial values in DB represent the total batch.
  // We initialize per-unit filament and print time by dividing by initial quantity.
  const initQty = Math.max(1, initialData?.quantity || 1);
  const initialTotalMinutes = initialData?.printTimeMinutes || 0;
  const initialPerUnitMinutes = Math.round(initialTotalMinutes / initQty);
  const initHours = Math.floor(initialPerUnitMinutes / 60);
  const initMins = initialPerUnitMinutes % 60;

  const initialPerUnitGrams = initialData?.filamentUsedGrams
    ? Math.round(initialData.filamentUsedGrams / initQty)
    : 100;

  // Form states
  const [customerName, setCustomerName] = useState(initialData?.customerName || "");
  const [productName, setProductName] = useState(initialData?.productName || "");
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || "1");

  const [filamentGrams, setFilamentGrams] = useState(
    initialPerUnitGrams.toString()
  );
  const [printHours, setPrintHours] = useState(initHours > 0 ? initHours.toString() : "2");
  const [printMinutes, setPrintMinutes] = useState(initMins > 0 ? initMins.toString() : "30");

  const [filamentCost, setFilamentCost] = useState(
    initialData?.filamentCost?.toString() || "80"
  );
  const [electricityCost, setElectricityCost] = useState(
    initialData?.electricityCost?.toString() || "20"
  );
  const [otherCost, setOtherCost] = useState(initialData?.otherCost?.toString() || "10");

  const [sellingPrice, setSellingPrice] = useState(
    initialData?.sellingPrice?.toString() || "350"
  );
  const [status, setStatus] = useState<JobStatus>(initialData?.status || "PENDING");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("pla");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Calculations factoring Quantity
  const calculatedValues = useMemo(() => {
    const qtyNum = Math.max(1, parseInt(quantity) || 1);
    const unitGrams = Math.max(0, parseFloat(filamentGrams) || 0);
    const totalGrams = unitGrams * qtyNum;

    const unitMins =
      (Math.max(0, parseInt(printHours) || 0) * 60) +
      Math.max(0, parseInt(printMinutes) || 0);
    const totalMins = unitMins * qtyNum;

    const fCost = Math.max(0, parseFloat(filamentCost) || 0);
    const eCost = Math.max(0, parseFloat(electricityCost) || 0);
    const oCost = Math.max(0, parseFloat(otherCost) || 0);
    const sPrice = Math.max(0, parseFloat(sellingPrice) || 0);

    const totalCost = calculateTotalCost(fCost, eCost, oCost);
    const profit = calculateProfit(sPrice, totalCost);
    const margin = calculateProfitMargin(profit, sPrice);

    return {
      qtyNum,
      unitGrams,
      totalGrams,
      unitMins,
      totalMinutes: totalMins,
      fCost,
      eCost,
      oCost,
      totalCost,
      unitCost: qtyNum > 0 ? Math.round((totalCost / qtyNum) * 100) / 100 : 0,
      unitPrice: qtyNum > 0 ? Math.round((sPrice / qtyNum) * 100) / 100 : 0,
      unitProfit: qtyNum > 0 ? Math.round((profit / qtyNum) * 100) / 100 : 0,
      profit,
      margin,
    };
  }, [quantity, filamentGrams, printHours, printMinutes, filamentCost, electricityCost, otherCost, sellingPrice]);

  // Bambu P2S Estimator Intelligence from https://3d-print-calculator-pink.vercel.app/
  const bambuEstimate = useMemo(() => {
    const preset =
      BAMBU_MATERIAL_PRESETS.find((p) => p.id === selectedMaterial) ||
      BAMBU_MATERIAL_PRESETS[0];
    const qtyNum = Math.max(1, parseInt(quantity) || 1);
    const unitMins =
      (Math.max(0, parseInt(printHours) || 0) * 60) +
      Math.max(0, parseInt(printMinutes) || 0);
    const unitGrams = Math.max(0, parseFloat(filamentGrams) || 0);

    const unitEstimate = estimateCostsWithBambuP2S({
      grams: unitGrams,
      printTimeMinutes: unitMins,
      materialPricePerKg: preset.pricePerKg,
    });

    const totalFilamentCost = Math.round(unitEstimate.filamentCost * qtyNum * 100) / 100;
    const totalElectricityCost = Math.round(unitEstimate.electricityCost * qtyNum * 100) / 100;
    const totalOtherCost = Math.round(unitEstimate.otherCost * qtyNum * 100) / 100;
    const totalCost = calculateTotalCost(totalFilamentCost, totalElectricityCost, totalOtherCost);

    return {
      unit: unitEstimate,
      batch: {
        filamentCost: totalFilamentCost,
        electricityCost: totalElectricityCost,
        otherCost: totalOtherCost,
        totalCost,
        tiers: {
          volume: totalCost > 0 ? Math.ceil(totalCost / (1 - 0.28)) : 0,
          recommended: totalCost > 0 ? Math.ceil(totalCost / (1 - 0.52)) : 0,
          highValue: totalCost > 0 ? Math.ceil(totalCost / (1 - 0.72)) : 0,
        },
      },
    };
  }, [selectedMaterial, printHours, printMinutes, filamentGrams, quantity]);

  const handleApplyBambuCalculation = (presetId?: string) => {
    const pId = presetId || selectedMaterial;
    const preset =
      BAMBU_MATERIAL_PRESETS.find((p) => p.id === pId) ||
      BAMBU_MATERIAL_PRESETS[0];
    const qtyNum = Math.max(1, parseInt(quantity) || 1);
    const unitMins =
      (Math.max(0, parseInt(printHours) || 0) * 60) +
      Math.max(0, parseInt(printMinutes) || 0);
    const unitGrams = Math.max(0, parseFloat(filamentGrams) || 0);

    const unitEstimate = estimateCostsWithBambuP2S({
      grams: unitGrams,
      printTimeMinutes: unitMins,
      materialPricePerKg: preset.pricePerKg,
    });

    const totalFilamentCost = Math.round(unitEstimate.filamentCost * qtyNum * 100) / 100;
    const totalElectricityCost = Math.round(unitEstimate.electricityCost * qtyNum * 100) / 100;
    const totalOtherCost = Math.round(unitEstimate.otherCost * qtyNum * 100) / 100;
    const totalCost = calculateTotalCost(totalFilamentCost, totalElectricityCost, totalOtherCost);
    const recommendedBatchPrice = totalCost > 0 ? Math.ceil(totalCost / (1 - 0.52)) : 0;

    setFilamentCost(totalFilamentCost.toString());
    setElectricityCost(totalElectricityCost.toString());
    setOtherCost(totalOtherCost.toString());

    // Auto-fill recommended selling price if selling price is zero or initial default
    if (!sellingPrice || parseFloat(sellingPrice) === 0 || sellingPrice === "350") {
      setSellingPrice(recommendedBatchPrice.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }
    if (!productName.trim()) {
      setError("Product name is required");
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    const grams = parseFloat(filamentGrams);
    if (isNaN(grams) || grams < 0) {
      setError("Filament usage cannot be negative");
      return;
    }

    if (calculatedValues.totalMinutes <= 0) {
      setError("Print time must be greater than 0 minutes");
      return;
    }

    const sPrice = parseFloat(sellingPrice);
    if (isNaN(sPrice) || sPrice < 0) {
      setError("Selling price cannot be negative");
      return;
    }

    const payload: JobFormData = {
      customerName: customerName.trim(),
      productName: productName.trim(),
      quantity: qty,
      filamentUsedGrams: calculatedValues.totalGrams,
      printTimeMinutes: calculatedValues.totalMinutes,
      filamentCost: Math.max(0, parseFloat(filamentCost) || 0),
      electricityCost: Math.max(0, parseFloat(electricityCost) || 0),
      otherCost: Math.max(0, parseFloat(otherCost) || 0),
      sellingPrice: sPrice,
      status,
    };

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const res = await createPrintJob(payload);
        if (res.success && res.job) {
          router.push(`/jobs/${res.job.id}`);
          router.refresh();
        } else {
          setError(res.error || "Failed to create print job");
        }
      } else if (mode === "edit" && initialData?.id) {
        const res = await updatePrintJob(initialData.id, payload);
        if (res.success) {
          router.push(`/jobs/${initialData.id}`);
          router.refresh();
        } else {
          setError(res.error || "Failed to update print job");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: {
    value: JobStatus;
    label: string;
    desc: string;
    activeCard: string;
    inactiveCard: string;
    activeText: string;
    activeDesc: string;
    activeDot: string;
    inactiveDot: string;
  }[] = [
    {
      value: "PENDING",
      label: "Pending",
      desc: "Queued for print",
      activeCard: "bg-[#eff6ff] border-[#3b82f6] ring-2 ring-[#3b82f6]/20 shadow-sm",
      inactiveCard: "bg-[#fafafc] border-[#e5e5ea] hover:bg-[#f4f8fc] hover:border-[#bfdbfe]",
      activeText: "text-[#1d4ed8]",
      activeDesc: "text-[#2563eb]/80",
      activeDot: "bg-[#2563eb]",
      inactiveDot: "bg-[#93c5fd]",
    },
    {
      value: "PRINTING",
      label: "Printing",
      desc: "Currently on build plate",
      activeCard: "bg-[#fff8eb] border-[#f59e0b] ring-2 ring-[#f59e0b]/25 shadow-sm",
      inactiveCard: "bg-[#fafafc] border-[#e5e5ea] hover:bg-[#fffbf0] hover:border-[#fde68a]",
      activeText: "text-[#b45309]",
      activeDesc: "text-[#b45309]/80",
      activeDot: "bg-[#f59e0b] animate-pulse",
      inactiveDot: "bg-[#fcd34d]",
    },
    {
      value: "COMPLETED",
      label: "Completed",
      desc: "Post-processed & ready",
      activeCard: "bg-[#f0fdf4] border-[#16a34a] ring-2 ring-[#16a34a]/25 shadow-sm",
      inactiveCard: "bg-[#fafafc] border-[#e5e5ea] hover:bg-[#f6fef9] hover:border-[#bbf7d0]",
      activeText: "text-[#15803d]",
      activeDesc: "text-[#15803d]/80",
      activeDot: "bg-[#16a34a]",
      inactiveDot: "bg-[#86efac]",
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      desc: "Aborted or rejected",
      activeCard: "bg-[#fef2f2] border-[#dc2626] ring-2 ring-[#dc2626]/20 shadow-sm",
      inactiveCard: "bg-[#fafafc] border-[#e5e5ea] hover:bg-[#fff5f5] hover:border-[#fecaca]",
      activeText: "text-[#b91c1c]",
      activeDesc: "text-[#b91c1c]/80",
      activeDot: "bg-[#dc2626]",
      inactiveDot: "bg-[#fca5a5]",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 rounded-[14px] bg-[#fff2f2] border border-[#ffd5d5] p-4 text-[14px] text-[#d70015]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Organized Form Fields (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Job Information */}
          <Card className="space-y-5" padding="lg">
            <div className="border-b border-[#f0f0f2] pb-3">
              <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-2">
                <User className="w-4 h-4 text-[#0066cc]" />
                Job Information
              </h2>
              <p className="text-[13px] text-[#86868b] mt-0.5">
                Client details and item identity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#1d1d1f]">
                  Customer Name <span className="text-[#d70015]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aisha Khan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-[42px] px-3.5 rounded-[11px] bg-white border border-[#e5e5ea] text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#1d1d1f]">
                  Product Name <span className="text-[#d70015]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Personalized Phone Stand"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full h-[42px] px-3.5 rounded-[11px] bg-white border border-[#e5e5ea] text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-[#1d1d1f]">
                  Quantity (Units) <span className="text-[#d70015]">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full sm:w-1/2 h-[42px] px-3.5 rounded-[11px] bg-white border border-[#e5e5ea] text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Production Parameters */}
          <Card className="space-y-5" padding="lg">
            <div className="border-b border-[#f0f0f2] pb-3">
              <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0066cc]" />
                Production Parameters (Per Unit)
              </h2>
              <p className="text-[13px] text-[#86868b] mt-0.5">
                Filament consumption and slicing print duration for an individual unit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#1d1d1f]">
                  Filament Used (Grams)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={filamentGrams}
                    onChange={(e) => setFilamentGrams(e.target.value)}
                    className="w-full h-[42px] pl-3.5 pr-14 rounded-[11px] bg-white border border-[#e5e5ea] text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#86868b]">
                    grams
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#1d1d1f]">
                  Print Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Hours"
                      value={printHours}
                      onChange={(e) => setPrintHours(e.target.value)}
                      className="w-full h-[42px] pl-3.5 pr-8 rounded-[11px] bg-white border border-[#e5e5ea] text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#86868b]">
                      hrs
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="1"
                      placeholder="Mins"
                      value={printMinutes}
                      onChange={(e) => setPrintMinutes(e.target.value)}
                      className="w-full h-[42px] pl-3.5 pr-8 rounded-[11px] bg-white border border-[#e5e5ea] text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#86868b]">
                      min
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Totals Capsule for Quantity > 1 */}
              {calculatedValues.qtyNum > 1 && (
                <div className="sm:col-span-2 p-3.5 rounded-[12px] bg-[#f5f5f7] border border-[#e5e5ea] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0071e3] shrink-0" />
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">
                      Total Batch Requirement ({calculatedValues.qtyNum} units):
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[12.5px] text-[#1d1d1f]">
                    <span className="px-2.5 py-1 rounded-md bg-white border border-[#e5e5ea] font-medium shadow-xs">
                      Filament: <span className="font-bold text-[#0071e3]">{formatGrams(calculatedValues.totalGrams)}</span> total
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-[#e5e5ea] font-medium shadow-xs">
                      Print Time: <span className="font-bold text-[#0071e3]">{formatPrintTime(calculatedValues.totalMinutes)}</span> total
                    </span>
                  </div>
                </div>
              )}

              {/* Material Preset Selector linked to 3D Print Calculator */}
              <div className="sm:col-span-2 pt-4 mt-2 border-t border-[#f0f0f2] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="text-[13px] font-semibold text-[#1d1d1f]">
                      Material Presets (Bambu Lab &amp; Market Spools)
                    </label>
                    <p className="text-[12px] text-[#86868b] mt-0.5">
                      Select a filament type to auto-calculate material rate and printer settings.
                    </p>
                  </div>
                  <a
                    href="https://3d-print-calculator-pink.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0066cc] hover:underline shrink-0"
                  >
                    <span>Open Calculator</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {BAMBU_MATERIAL_PRESETS.map((m) => {
                    const isSelected = selectedMaterial === m.id;
                    const shortName =
                      m.id === "generic"
                        ? "Generic Spool"
                        : m.name.split("/")[0].replace("Bambu", "").trim();

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMaterial(m.id);
                          handleApplyBambuCalculation(m.id);
                        }}
                        className={`text-left p-3.5 rounded-[14px] border transition-all select-none active:scale-[0.97] flex flex-col justify-between min-h-[82px] ${
                          isSelected
                            ? "bg-white border-[#0066cc] ring-2 ring-[#0066cc]/20 shadow-sm"
                            : "bg-[#fafafc] border-[#e5e5ea] hover:bg-white hover:border-[#d2d2d7]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[13px] font-semibold tracking-tight ${
                              isSelected ? "text-[#0066cc]" : "text-[#1d1d1f]"
                            }`}
                          >
                            {shortName}
                          </span>
                          {isSelected ? (
                            <span className="w-2 h-2 rounded-full bg-[#0066cc] shrink-0" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-transparent shrink-0" />
                          )}
                        </div>

                        <div className="mt-2">
                          <div className="text-[13px] font-bold text-[#1d1d1f]">
                            {formatINR(m.pricePerKg)}
                            <span className="text-[11px] font-normal text-[#86868b]"> / kg</span>
                          </div>
                          <div
                            className="mt-0.5 text-[10.5px] text-[#86868b] truncate"
                            title={m.description}
                          >
                            {m.description.split("&")[0].trim()}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Cost Breakdown */}
          <Card className="space-y-5" padding="lg">
            <div className="border-b border-[#f0f0f2] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#0066cc]" />
                  Production Cost Breakdown
                </h2>
                <p className="text-[13px] text-[#86868b] mt-0.5">
                  Raw materials, printer electricity (130W), machine wear &amp; buffers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyBambuCalculation()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f4f9] hover:bg-[#e1ecf8] text-[#0066cc] px-3.5 py-1.5 text-[12px] font-medium transition-all active:scale-[0.96]"
                >
                  <Zap className="w-3.5 h-3.5 fill-[#0066cc]" />
                  <span>Auto-Estimate via Calculator</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-[#1d1d1f]">
                    Filament Cost (₹)
                  </label>
                  {calculatedValues.qtyNum > 1 && (
                    <span className="text-[11px] text-[#0066cc] font-medium bg-[#f0f4f9] px-2 py-0.5 rounded-full">
                      ₹{(calculatedValues.fCost / calculatedValues.qtyNum).toFixed(1)} / unit
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#86868b]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={filamentCost}
                    onChange={(e) => setFilamentCost(e.target.value)}
                    className="w-full h-[42px] pl-8 pr-3.5 rounded-[11px] bg-white border border-[#e5e5ea] text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-[#1d1d1f]">
                    Electricity Cost (₹)
                  </label>
                  {calculatedValues.qtyNum > 1 && (
                    <span className="text-[11px] text-[#0066cc] font-medium bg-[#f0f4f9] px-2 py-0.5 rounded-full">
                      ₹{(calculatedValues.eCost / calculatedValues.qtyNum).toFixed(1)} / unit
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#86868b]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={electricityCost}
                    onChange={(e) => setElectricityCost(e.target.value)}
                    className="w-full h-[42px] pl-8 pr-3.5 rounded-[11px] bg-white border border-[#e5e5ea] text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-[#1d1d1f]">
                    Other Cost (₹)
                  </label>
                  {calculatedValues.qtyNum > 1 && (
                    <span className="text-[11px] text-[#0066cc] font-medium bg-[#f0f4f9] px-2 py-0.5 rounded-full">
                      ₹{(calculatedValues.oCost / calculatedValues.qtyNum).toFixed(1)} / unit
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#86868b]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Screws, glue..."
                    value={otherCost}
                    onChange={(e) => setOtherCost(e.target.value)}
                    className="w-full h-[42px] pl-8 pr-3.5 rounded-[11px] bg-white border border-[#e5e5ea] text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 4: Pricing & Status */}
          <Card className="space-y-5" padding="lg">
            <div className="border-b border-[#f0f0f2] pb-3">
              <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0066cc]" />
                Pricing &amp; Initial Status
              </h2>
              <p className="text-[13px] text-[#86868b] mt-0.5">
                Set customer quoted price and workflow stage.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 sm:w-1/2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-[#1d1d1f]">
                    Selling Price (₹) <span className="text-[#d70015]">*</span>
                  </label>
                  {calculatedValues.qtyNum > 1 && (
                    <span className="text-[11px] text-[#0066cc] font-medium bg-[#f0f4f9] px-2 py-0.5 rounded-full">
                      ₹{calculatedValues.unitPrice.toFixed(1)} / unit
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-medium text-[#1d1d1f]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full h-[44px] pl-8 pr-3.5 rounded-[11px] bg-white border border-[#e5e5ea] text-[16px] font-semibold text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                  />
                </div>

                {/* 3 Intelligent Price Recommendations from Bambu P2S Model */}
                {bambuEstimate.batch.totalCost > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-medium text-[#86868b] mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#0066cc]" />
                      <span>Calculator Margin Suggestions (Bambu P2S):</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSellingPrice(bambuEstimate.batch.tiers.volume.toString())}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fafafc] border border-[#e5e5ea] hover:border-[#0066cc] text-[12px] text-[#1d1d1f] transition-all active:scale-95"
                      >
                        <span className="text-[#6e6e73]">Volume (28%):</span>
                        <span className="font-semibold">{formatINR(bambuEstimate.batch.tiers.volume)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSellingPrice(bambuEstimate.batch.tiers.recommended.toString())}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eaf6eb] border border-[#c3e6c7] hover:border-[#28a745] text-[12px] text-[#1e7832] transition-all font-medium shadow-sm active:scale-95"
                      >
                        <span>★ Recommended (52%):</span>
                        <span className="font-bold">{formatINR(bambuEstimate.batch.tiers.recommended)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSellingPrice(bambuEstimate.batch.tiers.highValue.toString())}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fafafc] border border-[#e5e5ea] hover:border-[#0066cc] text-[12px] text-[#1d1d1f] transition-all active:scale-95"
                      >
                        <span className="text-[#6e6e73]">High Value (72%):</span>
                        <span className="font-semibold">{formatINR(bambuEstimate.batch.tiers.highValue)}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Segmented Control */}
              <div className="space-y-2 pt-2">
                <label className="text-[13px] font-semibold text-[#1d1d1f]">
                  Job Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {statusOptions.map((opt) => {
                    const isSelected = status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        className={`group text-left p-3.5 rounded-[12px] border transition-all cursor-pointer ${
                          isSelected ? opt.activeCard : opt.inactiveCard
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 transition-transform ${
                              isSelected
                                ? `${opt.activeDot} scale-110`
                                : `${opt.inactiveDot} group-hover:scale-110`
                            }`}
                          />
                          <div
                            className={`text-[13px] font-semibold transition-colors ${
                              isSelected ? opt.activeText : "text-[#1d1d1f]"
                            }`}
                          >
                            {opt.label}
                          </div>
                        </div>
                        <div
                          className={`text-[11px] mt-1 pl-4 transition-colors ${
                            isSelected ? opt.activeDesc : "text-[#86868b]"
                          }`}
                        >
                          {opt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Convenient Bottom Actions right under the form fields */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 shadow-sm justify-center"
              isLoading={isSubmitting}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{mode === "create" ? "Add Print Job" : "Save Changes"}</span>
            </Button>
            <Link
              href={mode === "edit" && initialData?.id ? `/jobs/${initialData.id}` : "/jobs"}
              className="text-center text-[14px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors px-4 py-2"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Right: Live Calculation Card (4 cols, sticky) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-[110px] space-y-4">
            <Card className="space-y-5 bg-white shadow-sm border border-[#e5e5ea]" padding="lg">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#86868b]">
                  Live Calculation Summary
                </span>
                <div className="mt-1 text-[13px] text-[#6e6e73]">
                  Automatically computed from input costs and selling price.
                </div>

                {calculatedValues.qtyNum > 1 && (
                  <div className="mt-3 p-3 rounded-[12px] bg-[#f5f5f7] border border-[#e5e5ea] text-[12px] space-y-1.5">
                    <div className="flex justify-between items-center text-[#1d1d1f]">
                      <span className="text-[#86868b]">Batch Size:</span>
                      <span className="font-semibold">{calculatedValues.qtyNum} units</span>
                    </div>
                    <div className="flex justify-between items-center text-[#1d1d1f]">
                      <span className="text-[#86868b]">Total Filament:</span>
                      <span className="font-semibold">{formatGrams(calculatedValues.totalGrams)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#1d1d1f]">
                      <span className="text-[#86868b]">Total Print Time:</span>
                      <span className="font-semibold">{formatPrintTime(calculatedValues.totalMinutes)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="divide-y divide-[#f0f0f2] text-[14px]">
                <div className="py-3 flex items-center justify-between">
                  <span className="text-[#6e6e73]">Filament Cost</span>
                  <span className="font-medium text-[#1d1d1f]">
                    {formatINR(parseFloat(filamentCost) || 0)}
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-[#6e6e73]">Electricity Cost</span>
                  <span className="font-medium text-[#1d1d1f]">
                    {formatINR(parseFloat(electricityCost) || 0)}
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-[#6e6e73]">Other Cost</span>
                  <span className="font-medium text-[#1d1d1f]">
                    {formatINR(parseFloat(otherCost) || 0)}
                  </span>
                </div>

                <div className="py-3.5 flex items-center justify-between bg-[#fafafc] -mx-6 px-6 border-y border-[#f0f0f2]">
                  <span className="font-semibold text-[#1d1d1f]">Total Production Cost</span>
                  <span className="font-bold text-[16px] text-[#1d1d1f]">
                    {formatINR(calculatedValues.totalCost)}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <span className="text-[#6e6e73]">Selling Price</span>
                  <span className="font-medium text-[#1d1d1f]">
                    {formatINR(parseFloat(sellingPrice) || 0)}
                  </span>
                </div>

                <div className="pt-4 pb-2">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-[#1d1d1f]">Expected Profit</span>
                    <span
                      className={`text-[24px] font-semibold tracking-tight ${
                        calculatedValues.profit >= 0 ? "text-[#1e7832]" : "text-[#d70015]"
                      }`}
                    >
                      {formatINR(calculatedValues.profit)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[13px]">
                    <span className="text-[#86868b]">Profit Margin</span>
                    <span
                      className={`font-medium ${
                        calculatedValues.margin >= 0 ? "text-[#1e7832]" : "text-[#d70015]"
                      }`}
                    >
                      {calculatedValues.margin}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar visual for margin */}
              <div className="pt-1">
                <div className="h-1.5 w-full rounded-full bg-[#f0f0f2] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      calculatedValues.profit >= 0 ? "bg-[#34c759]" : "bg-[#ff3b30]"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, calculatedValues.margin))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Calculator Attribution & Link */}
              <div className="pt-2 border-t border-[#f0f0f2] flex items-center justify-between text-[11px] text-[#86868b]">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#0066cc]" />
                  <span>Bambu P2S Cost Engine</span>
                </span>
                <a
                  href="https://3d-print-calculator-pink.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0066cc] hover:underline inline-flex items-center gap-0.5 font-medium"
                >
                  <span>Calculator</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                {mode === "create" ? "Add Print Job" : "Save Changes"}
              </Button>

              <Link
                href={mode === "edit" && initialData?.id ? `/jobs/${initialData.id}` : "/jobs"}
                className="block text-center text-[14px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors py-2"
              >
                Cancel and Return
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
