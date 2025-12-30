import express from "express";
import { redis } from "../redis.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    await redis.ping();
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

export default router;
