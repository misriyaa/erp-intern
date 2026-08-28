/**
 * Convert quantity from recipe ingredient unit to product stock unit.
 * Supports:
 * - Mass: g / gram / grams / gm <-> kg / kilogram / kilograms (1 kg = 1000 g)
 * - Volume: ml / milliliter / milliliters <-> l / liter / liters (1 L = 1000 ml)
 * - Count: pcs / piece / pieces / unit / units (1:1 conversion)
 */

export function normalizeUnit(unitStr) {
  if (!unitStr) return "";
  const u = String(unitStr).trim().toLowerCase();

  if (["g", "gram", "grams", "gm", "gms"].includes(u)) return "g";
  if (["kg", "kilogram", "kilograms", "kgs"].includes(u)) return "kg";
  if (["ml", "milliliter", "milliliters"].includes(u)) return "ml";
  if (["l", "liter", "liters", "litre", "litres"].includes(u)) return "l";
  if (["pcs", "pc", "piece", "pieces", "unit", "units"].includes(u)) return "pcs";

  return u;
}

export function convertUnit(quantity, fromUnitStr, toUnitStr) {
  const qty = parseFloat(quantity) || 0;
  if (qty <= 0) return 0;

  const from = normalizeUnit(fromUnitStr);
  const to = normalizeUnit(toUnitStr);

  if (!from || !to || from === to) {
    return qty;
  }

  // Mass conversions
  if (from === "g" && to === "kg") {
    return qty / 1000;
  }
  if (from === "kg" && to === "g") {
    return qty * 1000;
  }

  // Volume conversions
  if (from === "ml" && to === "l") {
    return qty / 1000;
  }
  if (from === "l" && to === "ml") {
    return qty * 1000;
  }

  // Fallback 1:1 if units cannot be converted
  return qty;
}
