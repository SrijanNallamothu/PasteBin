import express from "express";
import { redis } from "../redis.js";
import { getNow } from "../utils/time.js";
import { escapeHtml } from "../utils/escape.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  
  const key = `paste:${req.params.id}`;
  const raw = await redis.get(key);


  if (!raw) return res.status(404).send("Not found");

  const paste = typeof raw === "string" ? JSON.parse(raw) : raw;
  const now = getNow(req);

  if (paste.expires_at && now >= paste.expires_at) {
    await redis.del(key);
    return res.status(404).send("Expired");
  }

  if (paste.max_views !== null && paste.views >= paste.max_views) {
    return res.status(404).send("View limit exceeded");
  }

  paste.views += 1;
  await redis.set(key, JSON.stringify(paste));

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <html>
      <body>
        <pre>${escapeHtml(paste.content)}</pre>
      </body>
    </html>
  `);
});

export default router;
