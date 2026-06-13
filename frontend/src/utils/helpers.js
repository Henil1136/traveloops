export const fmt   = n => `$${Number(n||0).toLocaleString()}`;
export const fmtD  = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
export const days  = (a,b) => Math.max(1, Math.ceil((new Date(b)-new Date(a))/86400000));
export const slug  = s => s?.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "";
export const stars = n => "★".repeat(Math.min(5,Math.max(0,n||0)));

// Generate a stable cartId from item type + id
export const makeCartId = (type, id) => `${type}_${id}`;

// Price range string to estimated numeric
export const priceRangeNum = (pr) => ({ "$":15, "$$":40, "$$$":85, "$$$$":160 })[pr] || 0;

// Debounce
export const debounce = (fn, ms=300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), ms); };
};
