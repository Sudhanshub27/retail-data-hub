/**
 * Shared formatting utilities — single source of truth.
 * Import these instead of redeclaring fmt/fmtCurrency in every page.
 */

/** Format a number as Indian currency (₹) with Cr/L shorthand */
export function fmtCurrency(n: number): string {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/** Alias used in Overview page */
export const fmt = fmtCurrency;

/** Format a number with Indian locale grouping */
export function fmtNum(n: number): string {
    return n.toLocaleString("en-IN");
}

/** Format a YYYY-MM string to "Jan '24" */
export function fmtMonthLabel(val: string): string {
    const [y, m] = val.split("-");
    if (!y || !m) return val;
    return new Date(+y, +m - 1).toLocaleDateString("en", {
        month: "short",
        year: "2-digit",
    });
}

/** Format percentage with 1 decimal */
export function fmtPct(n: number): string {
    return `${n.toFixed(1)}%`;
}
