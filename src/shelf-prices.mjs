import { validateOffer } from "./offer.mjs";
import { normalizeUnit } from "./normalizeUnit.mjs";

export const DEFAULT_SHELF_MAX_AGE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function validDate(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : NaN;
}

export function buildShelfSnapshot({
  offers,
  generatedAt = new Date().toISOString(),
  maxAgeDays = DEFAULT_SHELF_MAX_AGE_DAYS,
  sources = {}
} = {}) {
  if (!Array.isArray(offers)) throw new TypeError("offers must be an array");
  if (!(Number.isFinite(maxAgeDays) && maxAgeDays > 0)) throw new TypeError("maxAgeDays must be positive");
  if (!Number.isFinite(validDate(generatedAt))) throw new TypeError("generatedAt must be a valid date");

  const normalizedOffers = offers.map((input, index) => {
    const checked = validateOffer(input);
    if (!checked.ok) {
      throw new Error(`Invalid offer at index ${index}: ${checked.errors.join(", ")}`);
    }

    const offer = { ...checked.offer };
    if (input.packSize != null) {
      const normalized = normalizeUnit({
        price: offer.priceRon,
        packSize: input.packSize,
        packUnit: input.packUnit,
        packCount: input.packCount,
        referenceUnit: input.referenceUnit
      });
      if (!normalized.ok) {
        throw new Error(`Invalid pack size at index ${index}: ${normalized.error}`);
      }
      offer.packSize = normalized.packSize;
      offer.referenceUnit = normalized.referenceUnit;
      offer.pricePerReferenceUnit = normalized.pricePerReferenceUnit;
      offer.referenceLabel = normalized.referenceLabel;
    }
    return offer;
  });

  return {
    schemaVersion: 1,
    status: normalizedOffers.length ? "ready" : "empty",
    generatedAt: new Date(generatedAt).toISOString(),
    maxAgeDays,
    sources,
    offers: normalizedOffers
  };
}

export function validateShelfSnapshot(snapshot) {
  const errors = [];
  if (!snapshot || typeof snapshot !== "object") return { ok: false, errors: ["snapshot"] };
  if (snapshot.schemaVersion !== 1) errors.push("schemaVersion");
  if (!["ready", "empty", "not_synced"].includes(snapshot.status)) errors.push("status");
  if (!Number.isFinite(validDate(snapshot.generatedAt))) errors.push("generatedAt");
  if (!Array.isArray(snapshot.offers)) errors.push("offers");
  if (!(Number.isFinite(snapshot.maxAgeDays) && snapshot.maxAgeDays > 0)) errors.push("maxAgeDays");

  if (Array.isArray(snapshot.offers)) {
    snapshot.offers.forEach((offer, index) => {
      const checked = validateOffer(offer);
      if (!checked.ok) errors.push(`offers[${index}]:${checked.errors.join(",")}`);
    });
  }

  if (snapshot.status === "ready" && (!Array.isArray(snapshot.offers) || snapshot.offers.length === 0)) {
    errors.push("ready-snapshot-empty");
  }
  if (snapshot.status === "empty" && Array.isArray(snapshot.offers) && snapshot.offers.length > 0) {
    errors.push("empty-snapshot-has-offers");
  }
  return { ok: errors.length === 0, errors };
}

export function getShelfSnapshotFreshness(snapshot, now = new Date()) {
  const checked = validateShelfSnapshot(snapshot);
  if (!checked.ok) return { fresh: false, reason: "invalid-snapshot", errors: checked.errors };

  if (snapshot.status !== "ready" || snapshot.offers.length === 0) {
    return { fresh: false, reason: "no-price-data", ageDays: null };
  }

  const nowMs = validDate(now);
  const generatedMs = validDate(snapshot.generatedAt);
  if (!Number.isFinite(nowMs) || generatedMs > nowMs) {
    return { fresh: false, reason: "invalid-or-future-timestamp", ageDays: null };
  }

  const maxAgeDays = Math.min(snapshot.maxAgeDays, DEFAULT_SHELF_MAX_AGE_DAYS);
  const snapshotAgeMs = nowMs - generatedMs;
  if (snapshotAgeMs > maxAgeDays * DAY_MS) {
    return { fresh: false, reason: "snapshot-expired", ageDays: snapshotAgeMs / DAY_MS };
  }

  for (const [index, offer] of snapshot.offers.entries()) {
    const observedMs = validDate(offer.observedAt);
    if (!Number.isFinite(observedMs) || observedMs > nowMs) {
      return { fresh: false, reason: "invalid-or-future-offer-timestamp", offerIndex: index };
    }
    if (nowMs - observedMs > maxAgeDays * DAY_MS) {
      return { fresh: false, reason: "offer-expired", offerIndex: index, ageDays: (nowMs - observedMs) / DAY_MS };
    }
  }

  return { fresh: true, reason: "fresh", ageDays: snapshotAgeMs / DAY_MS };
}
