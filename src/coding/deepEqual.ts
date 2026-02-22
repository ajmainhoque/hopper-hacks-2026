export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  // Treat undefined and null as equivalent
  if ((a === undefined || a === null) && (b === undefined || b === null)) return true;
  if (a === null || a === undefined || b === null || b === undefined) return false;
  // Numeric comparison with epsilon (also handles bool-number coercion: true==1, false==0)
  const na = typeof a === 'boolean' ? (a ? 1 : 0) : typeof a === 'number' ? a : NaN;
  const nb = typeof b === 'boolean' ? (b ? 1 : 0) : typeof b === 'number' ? b : NaN;
  if (!isNaN(na) && !isNaN(nb)) {
    return Math.abs(na - nb) < 1e-9;
  }
  // String-to-number leniency: "3" == 3, etc.
  if ((typeof a === 'string' && typeof b === 'number') || (typeof a === 'number' && typeof b === 'string')) {
    const sn = typeof a === 'string' ? Number(a) : Number(b);
    const nn = typeof a === 'number' ? a : (b as number);
    if (!isNaN(sn)) return Math.abs(sn - nn) < 1e-9;
  }
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as Record<string, unknown>).sort();
    const bKeys = Object.keys(b as Record<string, unknown>).sort();
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key, i) =>
      key === bKeys[i] && deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    );
  }
  return false;
}
