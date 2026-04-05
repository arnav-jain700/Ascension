import { prisma } from "@ascension/db";
import cors from "cors";
import express from "express";
import productsRouter from "./routes/products.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json());

app.get("/health", async (_req, res) => {
  let database: "ok" | "unconfigured" | "error" = "unconfigured";
  if (process.env.DATABASE_URL) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "ok";
    } catch {
      database = "error";
    }
  }
  res.json({ ok: true, service: "ascension-api", database });
});

app.get("/api/v1", (_req, res) => {
  res.json({ name: "Ascension API", version: "0.0.1" });
});

// Products routes
app.use("/api/v1/products", productsRouter);

app.listen(port, () => {
  console.log(`Ascension API listening on http://localhost:${port}`);
});
