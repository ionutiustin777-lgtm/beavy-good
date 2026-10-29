export const SGR_LEI = 0.5;
export const EXCLUDED_MERCHANTS = new Set(["metro", "selgros"]);

export function merchantKey(name = "") {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .split(/[\s·]+/)[0];
}

export function isExcludedMerchant(name) {
  return EXCLUDED_MERCHANTS.has(merchantKey(name));
}

/** An offer is usable only with source, channel and an observation time. */
export function validateOffer(input) {
  const errors = [];
  if (!input || typeof input !== "object") return { ok: false, errors: ["offer"] };
  if (input.food !== true) errors.push("food");
  if (!input.productId) errors.push("productId");
  if (!input.merchant || isExcludedMerchant(input.merchant)) errors.push("merchant");
  if (!(Number(input.priceRon) > 0)) errors.push("priceRon");
  if (input.channel !== "raft" && input.channel !== "livrare") errors.push("channel");
  if (!input.source) errors.push("source");
  if (!input.observedAt || Number.isNaN(Date.parse(input.observedAt))) errors.push("observedAt");
  const sgrUnits = input.sgrUnits ?? 0;
  if (!Number.isInteger(sgrUnits) || sgrUnits < 0) errors.push("sgrUnits");
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    offer: {
      productId: String(input.productId),
      merchant: String(input.merchant),
      priceRon: Number(input.priceRon),
      channel: input.channel,
      source: String(input.source),
      observedAt: new Date(input.observedAt).toISOString(),
      sgrUnits,
      food: true,
    },
  };
}
