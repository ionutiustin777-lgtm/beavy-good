const MASS_UNITS = new Set(["g", "kg"]);
const VOLUME_UNITS = new Set(["ml", "l"]);

function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  const normalized = String(value ?? "").trim().replace(",", ".");
  const match = normalized.match(/^\d+(?:\.\d+)?$/);
  return match ? Number(normalized) : NaN;
}

function canonicalUnit(unit) {
  const value = String(unit ?? "").trim().toLowerCase();
  if (["g", "gr", "gram", "grams", "gramme", "grame"].includes(value)) return "g";
  if (["kg", "kilogram", "kilograms", "kilogramme", "kilograme"].includes(value)) return "kg";
  if (["ml", "milliliter", "milliliters", "mililitru", "mililitri"].includes(value)) return "ml";
  if (["l", "lt", "liter", "liters", "litru", "litri"].includes(value)) return "l";
  return null;
}

function parsePackSize(packSize, packUnit, packCount) {
  if (packSize && typeof packSize === "object") {
    const amount = parseNumber(packSize.amount ?? packSize.value);
    const unit = canonicalUnit(packSize.unit);
    const count = parseNumber(packSize.count ?? 1);
    return { amount, unit, count };
  }

  if (typeof packSize === "number") {
    return {
      amount: parseNumber(packSize),
      unit: canonicalUnit(packUnit),
      count: parseNumber(packCount ?? 1)
    };
  }

  const value = String(packSize ?? "").trim().toLowerCase();
  const multi = value.match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)$/i);
  if (multi) {
    return {
      count: parseNumber(multi[1]),
      amount: parseNumber(multi[2]),
      unit: canonicalUnit(multi[3])
    };
  }

  const single = value.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)$/i);
  if (single) {
    return { count: parseNumber(packCount ?? 1), amount: parseNumber(single[1]), unit: canonicalUnit(single[2]) };
  }
  return { amount: NaN, unit: null, count: NaN };
}

/**
 * Normalize a pack price to RON per 1 kg or 1 L.
 * Examples: 650g, 400ml, 2 x 330ml, { amount: 0.65, unit: "kg" }.
 * Piece-count packs are intentionally rejected: pieces cannot be compared to kg/L.
 */
export function normalizeUnit({ price, packSize, packUnit, packCount = 1, referenceUnit } = {}) {
  const priceRon = parseNumber(price);
  if (!(priceRon > 0)) return { ok: false, error: "invalid-price" };

  const parsed = parsePackSize(packSize, packUnit, packCount);
  if (!(parsed.amount > 0) || !(parsed.count > 0) || !parsed.unit) {
    return { ok: false, error: "invalid-pack-size" };
  }

  const inferredReferenceUnit = MASS_UNITS.has(parsed.unit) ? "kg" : VOLUME_UNITS.has(parsed.unit) ? "l" : null;
  const targetUnit = referenceUnit ?? inferredReferenceUnit;
  if (targetUnit !== "kg" && targetUnit !== "l") return { ok: false, error: "unsupported-reference-unit" };
  if ((targetUnit === "kg" && !MASS_UNITS.has(parsed.unit)) || (targetUnit === "l" && !VOLUME_UNITS.has(parsed.unit))) {
    return { ok: false, error: "incompatible-unit" };
  }

  let quantityInReferenceUnits = parsed.amount * parsed.count;
  if (parsed.unit === "g" || parsed.unit === "ml") quantityInReferenceUnits /= 1000;
  if (!(quantityInReferenceUnits > 0)) return { ok: false, error: "invalid-pack-size" };

  const unitPrice = priceRon / quantityInReferenceUnits;
  const rounded = Number(unitPrice.toFixed(4));
  return {
    ok: true,
    priceRon,
    packSize: { count: parsed.count, amount: parsed.amount, unit: parsed.unit },
    quantityInReferenceUnits,
    referenceUnit: targetUnit,
    referenceLabel: targetUnit === "kg" ? "RON/kg" : "RON/l",
    pricePerReferenceUnit: rounded
  };
}
