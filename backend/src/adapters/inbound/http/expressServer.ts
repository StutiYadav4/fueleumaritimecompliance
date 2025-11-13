/**
 * Express HTTP adapter (inbound)
 * - Exposes the endpoints required by the frontend
 */
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import {
  getAllRoutes,
  getBaseline,
  getRouteById,
  setBaseline,
  getRouteByRouteId,
  getAvailableBank,
  insertBankEntry,
  getBankEntries,
  createPoolRecord,
} from "../../outbound/postgres/pgRepo";

import { computeCBForRoute } from "../../../core/application/computeCB";
import { buildComparison } from "../../../core/application/comparison";
import { createPoolAlloc } from "../../../core/application/pooling";

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* ===========================================================
   ROUTES
===========================================================*/

app.get("/routes", async (req, res) => {
  try {
    const routes = await getAllRoutes();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});

app.post("/routes/:id/baseline", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid route id" });

    const route = await getRouteById(id);
    if (!route) return res.status(404).json({ error: "Route not found" });

    await setBaseline(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to set baseline" });
  }
});

app.get("/routes/comparison", async (req, res) => {
  try {
    const baseline = await getBaseline();
    if (!baseline) return res.status(404).json({ error: "No baseline set" });

    const routes = await getAllRoutes();
    const comparisons = routes
      .filter((r) => r.id !== baseline.id)
      .map((r) => buildComparison(baseline, r));

    res.json({ baseline, comparisons });
  } catch (err) {
    res.status(500).json({ error: "Failed to compute comparison" });
  }
});

/* ===========================================================
   COMPLIANCE / CB
===========================================================*/
app.get("/compliance/cb", async (req, res) => {
  try {
    const shipId = (req.query.shipId as string) || "";
    const year = req.query.year ? Number(req.query.year) : undefined;

    if (!shipId) return res.status(400).json({ error: "shipId required" });
    if (!year) return res.status(400).json({ error: "year required" });

    const route = await getRouteByRouteId(shipId, year);
    if (!route) return res.status(404).json({ error: "Route not found" });

    const cb = await computeCBForRoute(route);

    return res.json({
      shipId,
      year,
      cb_before: cb.cb_t,
      cb_after: cb.cb_t,
      applied: 0,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to compute CB",
      detail: err?.message ?? err,
    });
  }
});


/* ===========================================================
   BANKING
===========================================================*/

app.get("/banking/records", async (req, res) => {
  try {
    const shipId = req.query.shipId as string | undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const records = await getBankEntries(shipId, year);
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: "Failed to get banking records" });
  }
});

app.post("/banking/bank", async (req, res) => {
  try {
    const shipId = String(req.body.shipId || "");
    const year = Number(req.body.year);
    const amountT = req.body.amountT as number | undefined;

    if (!shipId || !Number.isFinite(year))
      return res.status(400).json({ error: "shipId and year required" });

    const route = await getRouteByRouteId(shipId, year);
    if (!route) return res.status(404).json({ error: "Route not found" });

    const cb_t = computeCBForRoute(route) ?? 0;

    if (cb_t <= 0 && amountT === undefined)
      return res.status(400).json({ error: "No surplus to bank" });

    const amountToBank = amountT ?? Math.max(0, cb_t);

    const entry = await insertBankEntry(shipId, year, amountToBank);
    const cb_after = cb_t - amountToBank;

    res.json({
      shipId,
      year,
      entry,
      cb_before: cb_t,
      cb_after,
      banked: amountToBank,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to bank surplus" });
  }
});

app.get("/banking/available", async (req, res) => {
  try {
    const shipId = String(req.query.shipId || "");
    const year = Number(req.query.year);

    if (!shipId || !Number.isFinite(year))
      return res.status(400).json({ error: "shipId and year required" });

    const total = await getAvailableBank(shipId, year);

    res.json({ shipId, year, availableT: total });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

app.post("/banking/apply", async (req, res) => {
  try {
    const shipId = String(req.body.shipId || "");
    const year = Number(req.body.year);

    if (!shipId || !Number.isFinite(year))
      return res.status(400).json({ error: "shipId and year required" });

    const route = await getRouteByRouteId(shipId, year);
    if (!route) return res.status(404).json({ error: "Route not found" });

    const cb_t = computeCBForRoute(route) ?? 0;

    if (cb_t >= 0)
      return res.status(400).json({ error: "No deficit", cb_before: cb_t });

    const available = await getAvailableBank(shipId, year);
    if (available <= 0)
      return res.status(400).json({ error: "No banked surplus", cb_before: cb_t });

    const need = Math.abs(cb_t);
    const applied = Math.min(need, available);

    await insertBankEntry(shipId, year, -applied);

    res.json({
      shipId,
      year,
      cb_before: cb_t,
      applied,
      cb_after: cb_t + applied,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to apply surplus" });
  }
});

/* ===========================================================
   POOLING
===========================================================*/

app.post("/pools", async (req, res) => {
  try {
    const year = Number(req.body.year);
    const members = req.body.members;

    if (!Array.isArray(members) || members.length === 0)
      return res.status(400).json({ error: "members required" });

    const alloc = createPoolAlloc(members);

    const persisted = await createPoolRecord(
      year,
      alloc.map((m) => ({
        shipId: m.shipId,
        cbBefore: m.cbBefore,
        cbAfter: m.cbAfter,
      }))
    );

    res.json({ pool: persisted, members: alloc });
  } catch (err) {
    res.status(500).json({ error: "Failed to create pool" });
  }
});

/* ===========================================================
   HEALTH
===========================================================*/
app.get("/_health", (req, res) => res.json({ ok: true }));

/* ===========================================================
   START SERVER
===========================================================*/
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () =>
    console.log(`Backend running at http://localhost:${port}`)
  );
}

export default app;
