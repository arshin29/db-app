"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { calculateTotalCost, calculateProfit, JobFormData, JobStatus } from "./calculations";

export async function createPrintJob(data: JobFormData) {
  try {
    if (!data.customerName?.trim()) {
      return { success: false, error: "Customer name is required" };
    }
    if (!data.productName?.trim()) {
      return { success: false, error: "Product name is required" };
    }

    const quantity = Math.max(1, Math.floor(Number(data.quantity) || 1));
    const filamentUsedGrams = Math.max(0, Number(data.filamentUsedGrams) || 0);
    const printTimeMinutes = Math.max(0, Math.floor(Number(data.printTimeMinutes) || 0));
    const filamentCost = Math.max(0, Number(data.filamentCost) || 0);
    const electricityCost = Math.max(0, Number(data.electricityCost) || 0);
    const otherCost = Math.max(0, Number(data.otherCost) || 0);
    const sellingPrice = Math.max(0, Number(data.sellingPrice) || 0);

    const totalCost = calculateTotalCost(filamentCost, electricityCost, otherCost);
    const profit = calculateProfit(sellingPrice, totalCost);

    const validStatuses: JobStatus[] = ["PENDING", "PRINTING", "COMPLETED", "CANCELLED"];
    const status: JobStatus = validStatuses.includes(data.status) ? data.status : "PENDING";

    const job = await prisma.printJob.create({
      data: {
        customerName: data.customerName.trim(),
        productName: data.productName.trim(),
        quantity,
        filamentUsedGrams,
        printTimeMinutes,
        filamentCost,
        electricityCost,
        otherCost,
        totalCost,
        sellingPrice,
        profit,
        status,
      },
    });

    revalidatePath("/");
    revalidatePath("/jobs");
    return { success: true, job };
  } catch (error) {
    console.error("Failed to create print job:", error);
    return { success: false, error: "Failed to create print job. Please try again." };
  }
}

export async function updatePrintJob(id: string, data: JobFormData) {
  try {
    if (!id) return { success: false, error: "Missing job ID" };
    if (!data.customerName?.trim()) {
      return { success: false, error: "Customer name is required" };
    }
    if (!data.productName?.trim()) {
      return { success: false, error: "Product name is required" };
    }

    const quantity = Math.max(1, Math.floor(Number(data.quantity) || 1));
    const filamentUsedGrams = Math.max(0, Number(data.filamentUsedGrams) || 0);
    const printTimeMinutes = Math.max(0, Math.floor(Number(data.printTimeMinutes) || 0));
    const filamentCost = Math.max(0, Number(data.filamentCost) || 0);
    const electricityCost = Math.max(0, Number(data.electricityCost) || 0);
    const otherCost = Math.max(0, Number(data.otherCost) || 0);
    const sellingPrice = Math.max(0, Number(data.sellingPrice) || 0);

    const totalCost = calculateTotalCost(filamentCost, electricityCost, otherCost);
    const profit = calculateProfit(sellingPrice, totalCost);

    const validStatuses: JobStatus[] = ["PENDING", "PRINTING", "COMPLETED", "CANCELLED"];
    const status: JobStatus = validStatuses.includes(data.status) ? data.status : "PENDING";

    const job = await prisma.printJob.update({
      where: { id },
      data: {
        customerName: data.customerName.trim(),
        productName: data.productName.trim(),
        quantity,
        filamentUsedGrams,
        printTimeMinutes,
        filamentCost,
        electricityCost,
        otherCost,
        totalCost,
        sellingPrice,
        profit,
        status,
      },
    });

    revalidatePath("/");
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}`);
    return { success: true, job };
  } catch (error) {
    console.error("Failed to update print job:", error);
    return { success: false, error: "Failed to update print job" };
  }
}

export async function updateJobStatus(id: string, status: JobStatus) {
  try {
    const validStatuses: JobStatus[] = ["PENDING", "PRINTING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid status value" };
    }

    const job = await prisma.printJob.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/");
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}`);
    return { success: true, job };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

import { INITIAL_DEMO_JOBS } from "./demo-data";

export async function deletePrintJob(id: string) {
  try {
    await prisma.printJob.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/jobs");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete print job:", error);
    return { success: false, error: "Failed to delete job" };
  }
}

export async function resetDatabase() {
  try {
    // 1. Delete all current jobs
    await prisma.printJob.deleteMany();

    // 2. Re-populate initial realistic jobs
    for (const job of INITIAL_DEMO_JOBS) {
      await prisma.printJob.create({
        data: job,
      });
    }

    revalidatePath("/");
    revalidatePath("/jobs");
    return { success: true, count: INITIAL_DEMO_JOBS.length };
  } catch (error) {
    console.error("Failed to reset and seed database:", error);
    return { success: false, error: "Failed to reset database. Please try again." };
  }
}

export const resetAndSeedDatabase = resetDatabase;

export async function clearDatabase() {
  try {
    await prisma.printJob.deleteMany();
    revalidatePath("/");
    revalidatePath("/jobs");
    return { success: true, count: 0 };
  } catch (error) {
    console.error("Failed to clear database:", error);
    return { success: false, error: "Failed to clear database." };
  }
}


