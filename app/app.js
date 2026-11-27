// Hash router and filter state controller for LedgerDrop.

import { deals } from './deals-data.js';
import { filterDeals } from './filters.js';
import { renderBoard, renderDetail } from './render.js';

const root = document.getElementById('app');

const defaultState = {
  query: '',
  category: 'all',
  store: 'all',
  minDiscount: 0,
  verdict: 'all',
  sort: 'score',
};

let state = { ...defaultState };

function parseRoute() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/deal/')) {
    return { view: 'detail', id: decodeURIComponent(hash.slice(7)) };
  }
  const qIndex = hash.indexOf('?');
  if (qIndex !== -1) {
    const params = new URLSearchParams(hash.slice(qIndex + 1));
    state = {
      query: params.get('q') ?? '',
      category: params.get('category') ?? 'all',
      store: params.get('store') ?? 'all',
      minDiscount: Number(params.get('minDiscount') ?? 0),
      verdict: params.get('verdict') ?? 'all',
      sort: params.get('sort') ?? 'score',
    };
  }
  return { view: 'board' };
}

function syncHashFromState() {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.category !== 'all') params.set('category', state.category);
  if (state.store !== 'all') params.set('store', state.store);
  if (Number(state.minDiscount) > 0) params.set('minDiscount', String(state.minDiscount));
  if (state.verdict !== 'all') params.set('verdict', state.verdict);
  if (state.sort !== 'score') params.set('sort', state.sort);
  const qs = params.toString();
  const next = qs ? `#/?${qs}` : '#/';
  if (window.location.hash !== next) {
    history.replaceState(null, '', next);
  }
}

function bindBoardEvents() {
  const qEl = document.getElementById('f-query');
  const catEl = document.getElementById('f-category');
  const storeEl = document.getElementById('f-store');
  const discEl = document.getElementById('f-discount');
  const sortEl = document.getElementById('f-sort');
  const resetEl = document.getElementById('reset-filters');

  qEl?.addEventListener('input', (e) => {
    state.query = e.target.value;
    syncHashFromState();
    paintBoard(true);
  });
  catEl?.addEventListener('change', (e) => {
    state.category = e.target.value;
    syncHashFromState();
    paintBoard(false);
  });
  storeEl?.addEventListener('change', (e) => {
    state.store = e.target.value;
    syncHashFromState();
    paintBoard(false);
  });
  discEl?.addEventListener('change', (e) => {
    state.minDiscount = Number(e.target.value);
    syncHashFromState();
    paintBoard(false);
  });
  sortEl?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    syncHashFromState();
    paintBoard(false);
  });
  resetEl?.addEventListener('click', () => {
    state = { ...defaultState };
    syncHashFromState();
    paintBoard(false);
  });
  root.querySelectorAll('[data-verdict]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.verdict = btn.getAttribute('data-verdict');
      syncHashFromState();
      paintBoard(false);
    });
  });
}

function paintBoard(keepFocus) {
  const activeId = keepFocus ? document.activeElement?.id : null;
  const cursorPos = keepFocus ? document.activeElement?.selectionStart : null;
  const visible = filterDeals(deals, state);
  root.innerHTML = renderBoard(deals, visible, state);
  bindBoardEvents();
  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) {
      el.focus();
      if (typeof cursorPos === 'number') el.setSelectionRange(cursorPos, cursorPos);
    }
  }
}

function render() {
  const route = parseRoute();
  if (route.view === 'detail') {
    const deal = deals.find((d) => d.id === route.id);
    root.innerHTML = renderDetail(deal);
    window.scrollTo(0, 0);
    return;
  }
  paintBoard(false);
}

window.addEventListener('hashchange', render);
render();
