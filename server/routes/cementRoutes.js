import express from "express";
import * as svc from "../services/dataService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// GET /api/cement?type=regular|ghmc
router.get("/", asyncHandler(async (req, res) => {
  const type = req.query.type === "ghmc" ? "ghmc" : "regular";
  const result = await svc.getCementEntries(type);
  res.json(result);
}));

// POST /api/cement
router.post("/", asyncHandler(async (req, res) => {
  const entry = { type: "regular", ...req.body, created_at: new Date().toISOString() };
  const result = await svc.createCementEntry(entry);
  res.status(201).json(result);
}));

// PUT /api/cement/:id
router.put("/:id", asyncHandler(async (req, res) => {
  const result = await svc.updateCementEntry(req.params.id, req.body);
  res.json(result);
}));

// DELETE /api/cement/:id
router.delete("/:id", asyncHandler(async (req, res) => {
  await svc.deleteCementEntry(req.params.id);
  res.json({ success: true });
}));

export default router;
