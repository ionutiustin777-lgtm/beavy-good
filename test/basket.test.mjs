import assert from "node:assert/strict";
import test from "node:test";
import { paidUnits, quoteBasket } from "../src/basket.mjs";

const line = {
  productId: "apa-1",
  merchant: "Lidl",
  priceRon: 3,
  channel: "raft",
  source: "monitorulpreturilor.info",
  observedAt: "2026-10-29T10:00:00Z",
  food: true,
  sgrUnits: 1,
  quantity: 1,
};

test("1+1 is not a saving when only one unit is needed", () => {
  assert.equal(paidUnits(1, { type: "buy_x_get_y", buy: 1, get: 1 }), 1);
  assert.equal(paidUnits(2, { type: "buy_x_get_y", buy: 1, get: 1 }), 1);
});

test("quotes one store with SGR separate from the product price", () => {
  const result = quoteBasket({
    lines: [{ ...line, quantity: 2, promo: { type: "buy_x_get_y", buy: 1, get: 1 } }],
    shippingRon: 15,
    freeShippingAbove: 10,
    returnsSgr: true,
  });
  assert.equal(result.ok, true);
  assert.equal(result.lines[0].paidQuantity, 1);
  assert.equal(result.productsRon, 3);
  assert.equal(result.sgrRon, 1);
  assert.equal(result.shippingRon, 15);
  assert.equal(result.checkoutRon, 19);
  assert.equal(result.netRon, 18);
});

test("drops shipping once the product total reaches the free threshold", () => {
  const result = quoteBasket({
    lines: [{ ...line, priceRon: 12, sgrUnits: 0, quantity: 1 }],
    shippingRon: 15,
    freeShippingAbove: 10,
  });
  assert.equal(result.shippingRon, 0);
  assert.equal(result.checkoutRon, 12);
});

test("refuses a basket that mixes merchants", () => {
  const result = quoteBasket({
    lines: [line, { ...line, productId: "oua-1", merchant: "Penny", sgrUnits: 0 }],
  });
  assert.equal(result.ok, false);
});
