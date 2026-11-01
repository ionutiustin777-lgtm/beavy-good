import assert from "node:assert/strict";
import test from "node:test";
import { normalizeUnit } from "../src/normalizeUnit.mjs";

test("normalizes 650g to price per kilogram", () => {
  const result = normalizeUnit({ price: 3.5, packSize: "650g" });
  assert.equal(result.ok, true);
  assert.equal(result.referenceUnit, "kg");
  assert.equal(result.pricePerReferenceUnit, 5.3846);
});

test("normalizes 400ml to price per litre", () => {
  const result = normalizeUnit({ price: 4, packSize: "400ml" });
  assert.equal(result.ok, true);
  assert.equal(result.referenceUnit, "l");
  assert.equal(result.pricePerReferenceUnit, 10);
});

test("handles multipacks such as 2 x 330ml", () => {
  const result = normalizeUnit({ price: 5.5, packSize: "2 x 330ml" });
  assert.equal(result.ok, true);
  assert.equal(result.quantityInReferenceUnits, 0.66);
  assert.equal(result.pricePerReferenceUnit, 8.3333);
});

test("accepts decimal commas and structured quantities", () => {
  const decimal = normalizeUnit({ price: "4,39", packSize: "330g" });
  assert.equal(decimal.ok, true);
  assert.equal(decimal.pricePerReferenceUnit, 13.303);
  const structured = normalizeUnit({ price: 6, packSize: { amount: 0.75, unit: "kg" } });
  assert.equal(structured.pricePerReferenceUnit, 8);
});

test("rejects invalid prices, unsupported piece counts and mismatched dimensions", () => {
  assert.equal(normalizeUnit({ price: 0, packSize: "500g" }).error, "invalid-price");
  assert.equal(normalizeUnit({ price: 5, packSize: "6 buc" }).error, "invalid-pack-size");
  assert.equal(normalizeUnit({ price: 5, packSize: "500g", referenceUnit: "l" }).error, "incompatible-unit");
});
