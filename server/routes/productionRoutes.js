import express from "express";
import * as svc from "../services/dataService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// GET /api/production?type=regular|ghmc
router.get("/", asyncHandler(async (req, res) => {
  const type = req.query.type === "ghmc" ? "ghmc" : "regular";
  const result = await svc.getProductionEntries(type);
  res.json(result);
}));

// POST /api/production
router.post("/", asyncHandler(async (req, res) => {
  const entry = { type: "regular", ...req.body, created_at: new Date().toISOString() };
  const result = await svc.createProductionEntry(entry);
  res.status(201).json(result);
}));

// PUT /api/production/:id
router.put("/:id", asyncHandler(async (req, res) => {
  const result = await svc.updateProductionEntry(req.params.id, req.body);
  res.json(result);
}));

// DELETE /api/production/:id
router.delete("/:id", asyncHandler(async (req, res) => {
  await svc.deleteProductionEntry(req.params.id);
  res.json({ success: true });
}));

export default router;
