import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const catalog = JSON.parse(await readFile(new URL("../data/canonical-catalog.json", import.meta.url), "utf8"));
const matrix = JSON.parse(await readFile(new URL("../data/private-label-matrix.json", import.meta.url), "utf8"));

test("canonical catalog contains 60 unique, well-formed food products", () => {
  assert.equal(catalog.products.length, 60);
  assert.equal(new Set(catalog.products.map(product => product.id)).size, 60);
  for (const product of catalog.products) {
    assert.ok(product.id && product.name && product.category);
    assert.ok(["kg", "l", "buc"].includes(product.defaultUnit));
    assert.ok(Number.isInteger(product.shelfLifeDays) && product.shelfLifeDays > 0);
    assert.equal(typeof product.isPerishable, "boolean");
  }
});

test("private-label matrix covers every canonical product and each target retailer", () => {
  assert.equal(matrix.products.length, 60);
  const expectedRetailers = ["lidl", "kaufland", "mega-image", "penny", "carrefour"];
  for (const row of matrix.products) {
    assert.ok(catalog.products.some(product => product.id === row.canonicalProductId));
    assert.deepEqual(Object.keys(row.brandCandidates).sort(), [...expectedRetailers].sort());
  }
});

test("Cien is explicitly excluded from food matching", () => {
  const cien = matrix.retailers.find(retailer => retailer.id === "lidl").brands.find(brand => brand.name === "Cien");
  assert.equal(cien.foodEligible, false);
  assert.ok(matrix.products.every(row => !row.brandCandidates.lidl.includes("Cien")));
});
