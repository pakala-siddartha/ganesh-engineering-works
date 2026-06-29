import express from "express";
import * as svc from "../services/dataService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const type = req.query.type === "ghmc" ? "ghmc" : "regular";
  const result = await svc.getSalesEntries(type);
  res.json(result);
});

router.post("/", async (req, res) => {
  const entry = { type: "regular", ...req.body, created_at: new Date().toISOString() };
  const result = await svc.createSalesEntry(entry);
  res.status(201).json(result);
});

export default router;
