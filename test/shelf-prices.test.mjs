import assert from "node:assert/strict";
import test from "node:test";
import { buildShelfSnapshot, getShelfSnapshotFreshness, validateShelfSnapshot } from "../src/shelf-prices.mjs";

const now = "2026-11-01T12:00:00.000Z";
const validOffer = {
  productId: "lapte-proaspat",
  merchant: "Lidl",
  priceRon: 7.49,
  channel: "raft",
  source: "manual-import",
  observedAt: "2026-11-01T11:00:00.000Z",
  food: true,
  sgrUnits: 0,
  packSize: "1l"
};

test("builds a timestamped shelf snapshot with normalized reference prices", () => {
  const snapshot = buildShelfSnapshot({ offers: [validOffer], generatedAt: now });
  assert.equal(snapshot.status, "ready");
  assert.equal(snapshot.offers[0].pricePerReferenceUnit, 7.49);
  assert.equal(validateShelfSnapshot(snapshot).ok, true);
  assert.equal(getShelfSnapshotFreshness(snapshot, new Date(now)).fresh, true);
});

test("marks the initial empty snapshot as not usable for price comparison", () => {
  const snapshot = buildShelfSnapshot({ offers: [], generatedAt: now });
  assert.equal(snapshot.status, "empty");
  assert.equal(getShelfSnapshotFreshness(snapshot, new Date(now)).reason, "no-price-data");
});

test("rejects expired snapshots and stale individual offers", () => {
  const oldSnapshot = buildShelfSnapshot({
    offers: [{ ...validOffer, observedAt: "2026-10-20T11:00:00.000Z" }],
    generatedAt: "2026-10-20T12:00:00.000Z"
  });
  assert.equal(getShelfSnapshotFreshness(oldSnapshot, new Date(now)).reason, "snapshot-expired");

  const staleOffer = buildShelfSnapshot({
    offers: [{ ...validOffer, observedAt: "2026-10-20T11:00:00.000Z" }],
    generatedAt: now
  });
  assert.equal(getShelfSnapshotFreshness(staleOffer, new Date(now)).reason, "offer-expired");
});

test("does not mark future-dated observations as fresh", () => {
  const future = buildShelfSnapshot({
    offers: [{ ...validOffer, observedAt: "2026-11-02T11:00:00.000Z" }],
    generatedAt: now
  });
  assert.equal(getShelfSnapshotFreshness(future, new Date(now)).reason, "invalid-or-future-offer-timestamp");
});
