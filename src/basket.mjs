import { SGR_LEI, validateOffer } from "./offer.mjs";

/** Paid units for the quantity actually needed. 1+1 with a need of 1 still costs 1. */
export function paidUnits(quantity, promo) {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("quantity");
  if (!promo) return quantity;
  if (promo.type !== "buy_x_get_y") throw new Error("promo");
  const buy = promo.buy;
  const free = promo.get;
  if (!Number.isInteger(buy) || buy < 1 || !Number.isInteger(free) || free < 0) throw new Error("promo");
  const group = buy + free;
  return Math.floor(quantity / group) * buy + (quantity % group);
}

export function quoteBasket({ lines, shippingRon = 0, freeShippingAbove = null, returnsSgr = true }) {
  if (!Array.isArray(lines) || lines.length === 0) return { ok: false, errors: ["lines"] };
  const priced = [];
  const errors = [];
  for (const line of lines) {
    const checked = validateOffer(line);
    if (!checked.ok) {
      errors.push({ productId: line?.productId ?? null, errors: checked.errors });
      continue;
    }
    const quantity = line.quantity;
    if (!Number.isInteger(quantity) || quantity < 1) {
      errors.push({ productId: line.productId, errors: ["quantity"] });
      continue;
    }
    const paid = paidUnits(quantity, line.promo ?? null);
    priced.push({
      ...checked.offer,
      quantity,
      paidQuantity: paid,
      productsRon: round2(paid * checked.offer.priceRon),
      sgrRon: round2(quantity * checked.offer.sgrUnits * SGR_LEI),
    });
  }
  if (errors.length) return { ok: false, errors };
  const merchants = new Set(priced.map((line) => line.merchant));
  if (merchants.size !== 1) return { ok: false, errors: ["single-merchant"] };
  const productsRon = round2(priced.reduce((sum, line) => sum + line.productsRon, 0));
  const sgrRon = round2(priced.reduce((sum, line) => sum + line.sgrRon, 0));
  const shipping = Number(shippingRon);
  if (!(shipping >= 0)) return { ok: false, errors: ["shipping"] };
  const shippingApplied = freeShippingAbove != null && productsRon >= freeShippingAbove ? 0 : shipping;
  const checkoutRon = round2(productsRon + sgrRon + shippingApplied);
  return {
    ok: true,
    merchant: priced[0].merchant,
    lines: priced,
    productsRon,
    sgrRon,
    shippingRon: round2(shippingApplied),
    checkoutRon,
    netRon: returnsSgr ? round2(checkoutRon - sgrRon) : checkoutRon,
  };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}
