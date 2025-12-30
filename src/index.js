import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import pastesRouter from "./routes/pastes.js";
import viewRouter from "./routes/view.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000", // local dev
      "https://pastebin-ui-seven.vercel.app", // deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/healthz", healthRouter);
app.use("/api/pastes", pastesRouter);
app.use("/p", viewRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
