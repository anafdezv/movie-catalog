import "dotenv/config";

const required = ["DATABASE_URL", "JWT_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@moviecatalog.dev",
  adminPassword: process.env.ADMIN_PASSWORD ?? "Admin123!",
  demoEmail: process.env.DEMO_EMAIL ?? "demo@moviecatalog.dev",
  demoPassword: process.env.DEMO_PASSWORD ?? "Demo123!"
};

