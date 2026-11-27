// DOM rendering for the LedgerDrop deal board and deal detail pages.

import { dealScore, discountPercent, dollarSavings, formatMoney } from './scoring.js';
import { summarizeDeals, uniqueValues } from './filters.js';

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function badgeClass(verdict) {
  if (verdict === 'low') return 'badge-low';
  if (verdict === 'strong') return 'badge-strong';
  if (verdict === 'routine') return 'badge-routine';
  return 'badge-inflated';
}

function formatChecked(iso) {
  return iso.replace('T', ' ').replace(':00Z', ' UTC');
}

export function renderBoard(allDeals, visibleDeals, state) {
  const stats = summarizeDeals(visibleDeals);
  const categories = uniqueValues(allDeals, 'category');
  const stores = uniqueValues(allDeals, 'store');

  const kpiHtml = `
    <section class="kpi-strip" aria-label="Summary metrics">
      <div class="kpi-card">
        <div class="kpi-label">Verified Deals</div>
        <div class="kpi-value">${stats.total} <span class="kpi-sub">of ${allDeals.length}</span></div>
        <div class="kpi-sub">Across ${stats.stores} major retailers</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">All-Time Lows</div>
        <div class="kpi-value" style="color: var(--low-ink)">${stats.lows}</div>
        <div class="kpi-sub">Verified lowest 2026 floor</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Average Discount</div>
        <div class="kpi-value">${stats.avgDiscount}% off</div>
        <div class="kpi-sub">Exact math from checked prices</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Biggest Dollar Cut</div>
        <div class="kpi-value">${formatMoney(stats.topSavings)}</div>
        <div class="kpi-sub">Highest single-item savings</div>
      </div>
    </section>
  `;

  const controlsHtml = `
    <section class="controls" aria-label="Search and filter deals">
      <div class="controls-row">
        <div class="field">
          <label for="f-query">Search products, brands, stores</label>
          <input id="f-query" type="search" value="${esc(state.query)}" placeholder="e.g. OLED, AirPods, Sony, Dyson, Switch 2...">
        </div>
        <div class="field">
          <label for="f-category">Category</label>
          <select id="f-category">
            <option value="all"${state.category === 'all' ? ' selected' : ''}>All categories</option>
            ${categories.map((c) => `<option value="${esc(c)}"${state.category === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-store">Store</label>
          <select id="f-store">
            <option value="all"${state.store === 'all' ? ' selected' : ''}>All stores</option>
            ${stores.map((s) => `<option value="${esc(s)}"${state.store === s ? ' selected' : ''}>${esc(s)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-discount">Min discount</label>
          <select id="f-discount">
            <option value="0"${Number(state.minDiscount) === 0 ? ' selected' : ''}>Any discount</option>
            <option value="20"${Number(state.minDiscount) === 20 ? ' selected' : ''}>20%+ off</option>
            <option value="30"${Number(state.minDiscount) === 30 ? ' selected' : ''}>30%+ off</option>
            <option value="40"${Number(state.minDiscount) === 40 ? ' selected' : ''}>40%+ off</option>
            <option value="50"${Number(state.minDiscount) === 50 ? ' selected' : ''}>50%+ off</option>
          </select>
        </div>
        <div class="field">
          <label for="f-sort">Sort by</label>
          <select id="f-sort">
            <option value="score"${state.sort === 'score' ? ' selected' : ''}>Best Deal Score</option>
            <option value="discount"${state.sort === 'discount' ? ' selected' : ''}>Biggest % Off</option>
            <option value="savings"${state.sort === 'savings' ? ' selected' : ''}>Most Dollars Saved</option>
            <option value="price-asc"${state.sort === 'price-asc' ? ' selected' : ''}>Lowest Price</option>
          </select>
        </div>
      </div>

      <div class="verdict-chips">
        <div class="chip-group" role="group" aria-label="Filter by deal verdict">
          ${[
            ['all', 'All Verdicts'],
            ['low', 'All-Time Low'],
            ['strong', 'Strong Deal'],
            ['routine', 'Routine Sale'],
            ['inflated', 'Inflated MSRP'],
          ]
            .map(([val, label]) => `<button type="button" class="chip${state.verdict === val ? ' active' : ''}" data-verdict="${val}">${label}</button>`)
            .join('')}
        </div>
        <div class="results-meta">
          <span>Showing <strong>${visibleDeals.length}</strong> deals</span>
          <button type="button" id="reset-filters" class="reset-btn">Reset</button>
        </div>
      </div>
    </section>
  `;

  if (visibleDeals.length === 0) {
    return `${kpiHtml}${controlsHtml}
      <div class="empty-state">
        <h2>No deals match those filters</h2>
        <p>Try lowering the minimum discount or clearing the search box.</p>
      </div>`;
  }

  const cardsHtml = visibleDeals
    .map((deal) => {
      const pct = discountPercent(deal);
      const save = dollarSavings(deal);
      const score = dealScore(deal);
      const otherStore = deal.compare && deal.compare.length > 1 ? deal.compare[1] : null;
      return `
        <article class="deal-card">
          <div class="deal-top">
            <span class="store-tag">${esc(deal.store)} · ${esc(deal.category)}</span>
            <span class="badge ${badgeClass(deal.verdict)}">${esc(deal.verdictLabel)} · ${score}/100</span>
          </div>
          <h2 class="deal-title"><a href="#/deal/${esc(deal.id)}">${esc(deal.title)}</a></h2>
          <div class="price-row">
            <span class="price-now">${formatMoney(deal.price)}</span>
            <span class="price-was">${formatMoney(deal.was)}</span>
            <span class="discount-pill">-${pct}%</span>
            <span class="save-text">Save ${formatMoney(save)}</span>
          </div>
          <div class="meter" aria-hidden="true"><div class="meter-fill ${esc(deal.verdict)}" style="width:${Math.min(100, pct * 1.4)}%"></div></div>
          <p class="verdict-note">${esc(deal.verdictNote)}</p>
          ${otherStore ? `<div class="compare-pill">Cross-store: ${esc(otherStore.store)} ${formatMoney(otherStore.price)} (${esc(otherStore.note)})</div>` : ''}
          <div class="deal-meta">
            <span>Checked ${formatChecked(deal.checked)} · ${esc(deal.source)}</span>
          </div>
          <div class="deal-actions">
            <a class="btn btn-primary" href="${esc(deal.url)}" target="_blank" rel="noopener noreferrer">Open at ${esc(deal.store)}</a>
            <a class="btn btn-secondary" href="#/deal/${esc(deal.id)}">Price Check</a>
          </div>
        </article>
      `;
    })
    .join('');

  return `${kpiHtml}${controlsHtml}<section class="deal-grid" aria-label="Verified Black Friday deals">${cardsHtml}</section>`;
}

export function renderDetail(deal) {
  if (!deal) {
    return `<a class="back-link" href="#/">&larr; Back to all deals</a><div class="empty-state"><h2>Deal not found</h2></div>`;
  }
  const pct = discountPercent(deal);
  const save = dollarSavings(deal);
  const score = dealScore(deal);
  const compareRows = (deal.compare || [{ store: deal.store, price: deal.price, note: 'Checked store price' }])
    .map(
      (row, idx) => `
      <tr class="${idx === 0 ? 'best-row' : ''}">
        <td>${esc(row.store)}</td>
        <td>${formatMoney(row.price)}</td>
        <td>${esc(row.note)}</td>
      </tr>
    `,
    )
    .join('');

  return `
    <a class="back-link" href="#/">&larr; Back to all Black Friday deals</a>
    <section class="detail-layout">
      <div class="detail-panel">
        <div class="deal-top">
          <span class="store-tag">${esc(deal.store)} · ${esc(deal.category)}</span>
          <span class="badge ${badgeClass(deal.verdict)}">${esc(deal.verdictLabel)} · Score ${score}/100</span>
        </div>
        <h1 class="detail-title">${esc(deal.title)}</h1>
        <div class="price-row">
          <span class="price-now">${formatMoney(deal.price)}</span>
          <span class="price-was">${formatMoney(deal.was)}</span>
          <span class="discount-pill">-${pct}% off</span>
          <span class="save-text">Save ${formatMoney(save)}</span>
        </div>
        <div class="meter" style="margin-top: 10px"><div class="meter-fill ${esc(deal.verdict)}" style="width:${Math.min(100, pct * 1.4)}%"></div></div>

        <div class="evidence-box">
          <h3>Is It Really a Deal?</h3>
          <p style="margin:0; font-size:14px;">${esc(deal.verdictNote)}</p>
        </div>

        <h3 style="margin: 18px 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted);">Cross-Store Price Comparison</h3>
        <table class="compare-table">
          <thead><tr><th>Retailer</th><th>Checked Price</th><th>Comparison Note</th></tr></thead>
          <tbody>${compareRows}</tbody>
        </table>
      </div>

      <aside class="detail-panel">
        <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Verification Ledger</h3>
        <ul class="fact-list">
          <li><span>Sale Price</span><strong>${formatMoney(deal.price)}</strong></li>
          <li><span>Usual / List Price</span><strong>${formatMoney(deal.was)}</strong></li>
          <li><span>Verified Savings</span><strong>${formatMoney(save)} (${pct}%)</strong></li>
          <li><span>Store</span><strong>${esc(deal.store)}</strong></li>
          <li><span>Condition</span><strong>${esc(deal.condition)}</strong></li>
          <li><span>Checked (UTC)</span><strong>${formatChecked(deal.checked)}</strong></li>
          <li><span>Price Source</span><strong>${esc(deal.source)}</strong></li>
        </ul>
        <a class="btn btn-primary" style="width:100%; padding:11px 14px; font-size:14px;" href="${esc(deal.url)}" target="_blank" rel="noopener noreferrer">Shop at ${esc(deal.store)} &rarr;</a>
      </aside>
    </section>
  `;
}
