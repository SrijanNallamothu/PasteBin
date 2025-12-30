import express from "express";
import { nanoid } from "nanoid";
import { redis } from "../redis.js";
import { getNow } from "../utils/time.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  if (typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (
    ttl_seconds !== undefined &&
    (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
  ) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (
    max_views !== undefined &&
    (!Number.isInteger(max_views) || max_views < 1)
  ) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = nanoid(8);
  const now = Date.now();

  const paste = {
    id,
    content,
    created_at: now,
    expires_at: ttl_seconds ? now + ttl_seconds * 1000 : null,
    max_views: max_views ?? null,
    views: 0,
  };

  const key = `paste:${id}`;

  // ✅ ALWAYS stringify
  await redis.set(key, JSON.stringify(paste));

  res.status(201).json({
    id,
    url: `${req.protocol}://${req.get("host")}/p/${id}`,
  });
});

router.get("/:id", async (req, res) => {
  const key = `paste:${req.params.id}`;
  const raw = await redis.get(key);

  if (!raw) {
    return res.status(404).json({ error: "Not found" });
  }

  const paste = typeof raw === "string" ? JSON.parse(raw) : raw;

  const now = getNow(req);

  if (paste.expires_at && now >= paste.expires_at) {
    await redis.del(key);
    return res.status(404).json({ error: "Expired" });
  }

  res.json({
    content: paste.content,
    remaining_views:
      paste.max_views === null
        ? null
        : Math.max(paste.max_views - paste.views, 0),
    expires_at: paste.expires_at
      ? new Date(paste.expires_at).toISOString()
      : null,
  });
});


export default router;
