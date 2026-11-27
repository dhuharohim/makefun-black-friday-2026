// Price math, deal quality scoring, and sorting helpers.

const VERDICT_BONUS = {
  low: 32,
  strong: 18,
  routine: 4,
  inflated: -8,
};

export function discountPercent(deal) {
  if (!deal.was || deal.was <= 0) return 0;
  return Math.round(((deal.was - deal.price) / deal.was) * 100);
}

export function dollarSavings(deal) {
  return Math.max(0, Number((deal.was - deal.price).toFixed(2)));
}

export function dealScore(deal) {
  const pct = discountPercent(deal);
  const bonus = VERDICT_BONUS[deal.verdict] ?? 0;
  const multiStore = deal.compare && deal.compare.length > 1 ? 4 : 0;
  return Math.max(10, Math.min(99, Math.round(pct * 1.15 + bonus + multiStore)));
}

export function formatMoney(amount) {
  return Number.isInteger(amount)
    ? `$${amount.toLocaleString('en-US')}`
    : `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function sortDeals(list, sortBy) {
  const copy = list.slice();
  if (sortBy === 'discount') {
    return copy.sort((a, b) => discountPercent(b) - discountPercent(a) || dollarSavings(b) - dollarSavings(a));
  }
  if (sortBy === 'savings') {
    return copy.sort((a, b) => dollarSavings(b) - dollarSavings(a) || discountPercent(b) - discountPercent(a));
  }
  if (sortBy === 'price-asc') {
    return copy.sort((a, b) => a.price - b.price || discountPercent(b) - discountPercent(a));
  }
  return copy.sort((a, b) => dealScore(b) - dealScore(a) || discountPercent(b) - discountPercent(a));
}
