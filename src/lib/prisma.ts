import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  let dbUrl = process.env.DATABASE_URL;

  // On Vercel / AWS Lambda serverless environments:
  // The deployment root (/var/task) is read-only.
  // If using local SQLite, copy the pre-seeded dev.db to /tmp so writes succeed without EROFS.
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless && (!dbUrl || dbUrl.startsWith("file:"))) {
    try {
      const tmpDbPath = path.join("/tmp", "dev.db");
      const seedDbPath = path.join(process.cwd(), "prisma", "dev.db");

      if (!fs.existsSync(tmpDbPath) && fs.existsSync(seedDbPath)) {
        fs.copyFileSync(seedDbPath, tmpDbPath);
      }
      dbUrl = `file:${tmpDbPath}`;
    } catch (err) {
      console.warn("Could not copy SQLite database to /tmp:", err);
    }
    if (!dbUrl) {
      dbUrl = "file:/tmp/dev.db";
    }
  }

  if (!dbUrl) {
    dbUrl = "file:./dev.db";
  }

  return new PrismaClient({
    ...(dbUrl
      ? {
          datasources: {
            db: {
              url: dbUrl,
            },
          },
        }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

