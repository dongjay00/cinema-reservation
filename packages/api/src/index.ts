import express from "express";
import { ping } from "@cinema/shared";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ server: "ok", shared: ping() });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`api on http://localhost:${PORT}`));