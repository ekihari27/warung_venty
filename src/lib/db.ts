import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getEnv = (key: string) => {
  if (typeof process === "undefined") return "";
  return process.env[key] || "";
};

const isDbConfigured = () => {
  const url = getEnv("DATABASE_URL");
  return !!url && !url.includes("placeholder");
};

export const db = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (prop === "then") return undefined;
    if (prop === "constructor") return Object.prototype.constructor;

    if (!isDbConfigured()) {
      return new Proxy(() => {}, {
        get() {
          return () => {
            throw new Error("Database is not configured. Operating in in-memory mode.");
          };
        },
        apply() {
          throw new Error("Database is not configured. Operating in in-memory mode.");
        }
      });
    }

    if (!globalForPrisma.prisma) {
      const databaseUrl = getEnv("DATABASE_URL");
      const isPrismaPostgres = databaseUrl?.startsWith("prisma+postgres://");

      if (isPrismaPostgres) {
        globalForPrisma.prisma = new PrismaClient({
          log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
          accelerateUrl: databaseUrl,
        });
      } else {
        try {
          // Lazy-require adapter to avoid optional dependency errors during builds
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { Pool } = require("pg");
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { PrismaPg } = require("@prisma/adapter-pg");
          const pool = new Pool({ connectionString: databaseUrl });
          const adapter = new PrismaPg(pool);
          globalForPrisma.prisma = new PrismaClient({
            log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
            adapter,
          });
        } catch (err) {
          console.error("Failed to load Prisma driver adapter pg, falling back to direct PrismaClient", err);
          globalForPrisma.prisma = new PrismaClient({
            log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
          });
        }
      }
    }

    return Reflect.get(globalForPrisma.prisma, prop);
  },
});


