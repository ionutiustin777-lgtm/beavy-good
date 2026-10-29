import assert from "node:assert/strict";
import test from "node:test";
import { isExcludedMerchant, validateOffer } from "../src/offer.mjs";

const valid = {
  productId: "lapte-1",
  merchant: "Lidl",
  priceRon: 7.49,
  channel: "raft",
  source: "monitorulpreturilor.info",
  observedAt: "2026-10-29T10:00:00Z",
  food: true,
  sgrUnits: 1,
};

test("accepts an offer with source, channel and observation time", () => {
  const result = validateOffer(valid);
  assert.equal(result.ok, true);
  assert.equal(result.offer.channel, "raft");
  assert.equal(result.offer.observedAt, "2026-10-29T10:00:00.000Z");
});

test("rejects an offer missing source, channel or observation time", () => {
  for (const field of ["source", "channel", "observedAt"]) {
    const result = validateOffer({ ...valid, [field]: undefined });
    assert.equal(result.ok, false);
    assert.ok(result.errors.includes(field));
  }
});

test("rejects non-food and excluded merchants", () => {
  assert.equal(validateOffer({ ...valid, food: false }).ok, false);
  assert.equal(validateOffer({ ...valid, merchant: "Metro · București" }).ok, false);
  assert.equal(isExcludedMerchant("Selgros"), true);
  assert.equal(isExcludedMerchant("Lidl"), false);
});
