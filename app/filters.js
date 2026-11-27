// Search, category, store, discount, and verdict filtering.

import { discountPercent, dollarSavings, sortDeals } from './scoring.js';

export function uniqueValues(deals, field) {
  return [...new Set(deals.map((d) => d[field]))].sort();
}

export function filterDeals(deals, state) {
  const q = state.query.trim().toLowerCase();
  const minDisc = Number(state.minDiscount) || 0;

  const matched = deals.filter((deal) => {
    if (state.category !== 'all' && deal.category !== state.category) return false;
    if (state.store !== 'all' && deal.store !== state.store) return false;
    if (state.verdict !== 'all' && deal.verdict !== state.verdict) return false;
    if (discountPercent(deal) < minDisc) return false;
    if (q) {
      const hay = `${deal.title} ${deal.store} ${deal.category} ${deal.verdictLabel} ${deal.verdictNote} ${deal.source}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return sortDeals(matched, state.sort);
}

export function summarizeDeals(deals) {
  const total = deals.length;
  const lows = deals.filter((d) => d.verdict === 'low').length;
  const avgDiscount = total
    ? Math.round(deals.reduce((sum, d) => sum + discountPercent(d), 0) / total)
    : 0;
  const topSavings = deals.reduce((max, d) => Math.max(max, dollarSavings(d)), 0);
  const stores = new Set(deals.map((d) => d.store)).size;
  return { total, lows, avgDiscount, topSavings, stores };
}
