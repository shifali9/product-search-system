const SEARCH_HISTORY_KEY = "searchHistory";
const LEGACY_SEARCH_HISTORY_KEY = "productSearchHistory";
const VIEWED_PRODUCTS_KEY = "recentlyViewedProducts";
const HISTORY_LIMIT = 20;

const BRAND_KEYWORDS = [
  "nike",
  "apple",
  "samsung",
  "sony",
  "bose",
  "adidas",
  "jbl",
  "anker",
  "logitech",
  "harman",
  "dell",
  "hp",
  "lenovo",
  "puma",
  "under armour",
];

const CATEGORY_KEYWORDS = [
  { pattern: /\bshoe(s)?\b|\bsneaker(s)?\b|\brunning\b|\btrainer(s)?\b/i, value: "Shoes" },
  { pattern: /\bshirt(s)?\b|\btop(s)?\b|\bt-shirt(s)?\b|\bhoodie(s)?\b/i, value: "Apparel" },
  { pattern: /\bwatch(es)?\b|\bfitness\b|\bsmartwatch(es)?\b/i, value: "Watches" },
  { pattern: /\bearbud(s)?\b|\bheadphone(s)?\b|\bearphone(s)?\b|\baud(io)?\b/i, value: "Audio" },
  { pattern: /\bbackpack(s)?\b|\bbag(s)?\b|\bluggage\b/i, value: "Bags" },
  { pattern: /\bkeyboard(s)?\b|\bmouse(s)?\b|\bcharger(s)?\b|\bcable(s)?\b|\blamp(s)?\b|\bdesk(s)?\b/i, value: "Accessories" },
  { pattern: /\blaptop(s)?\b|\bpc(s)?\b|\bcomputer(s)?\b/i, value: "Computers" },
  { pattern: /\bphone(s)?\b|\bmobile\b|\bsmartphone(s)?\b/i, value: "Phones" },
];

function isBrowserStorageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readArray(key) {
  if (!isBrowserStorageAvailable()) {
    return [];
  }

  const stored = window.localStorage.getItem(key);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLegacySearchHistory() {
  if (!isBrowserStorageAvailable()) {
    return [];
  }

  const stored = window.localStorage.getItem(LEGACY_SEARCH_HISTORY_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray(key, value) {
  if (!isBrowserStorageAvailable()) {
    return value;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function titleCase(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function inferBrand(query, sampleProduct = {}) {
  const lowerQuery = normalizeText(query);
  const explicitBrand = BRAND_KEYWORDS.find((brand) => lowerQuery.includes(brand));

  if (explicitBrand) {
    return titleCase(explicitBrand);
  }

  const productBrand = sampleProduct.brand || sampleProduct.store || sampleProduct.displayBrand;
  return productBrand ? titleCase(productBrand) : "";
}

function inferCategory(query, sampleProduct = {}, explicitCategory = "") {
  if (explicitCategory) {
    return titleCase(explicitCategory);
  }

  const lowerQuery = normalizeText(query);
  const keywordCategory = CATEGORY_KEYWORDS.find(({ pattern }) => pattern.test(lowerQuery));

  if (keywordCategory) {
    return keywordCategory.value;
  }

  const productCategory = sampleProduct.main_category || sampleProduct.category;
  return productCategory ? titleCase(productCategory) : "";
}

function buildSearchEntry(query, context = {}) {
  const normalizedQuery = normalizeText(query);
  const sampleProduct = context.sampleProduct || {};
  const brand = inferBrand(query, sampleProduct);
  const category = inferCategory(query, sampleProduct, context.category);
  const normalizedBrand = normalizeText(brand);
  const normalizedCategory = normalizeText(category);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    query: String(query || "").trim(),
    normalizedQuery,
    brand,
    category,
    signature: [normalizedQuery, normalizedBrand, normalizedCategory].join("|"),
    timestamp: Date.now(),
  };
}

function buildViewedEntry(product) {
  const normalizedProduct = product || {};

  return {
    ...normalizedProduct,
    title: normalizedProduct.title || normalizedProduct.displayTitle || "Untitled Product",
    brand: normalizedProduct.brand || normalizedProduct.store || normalizedProduct.displayBrand || "",
    category: normalizedProduct.main_category || normalizedProduct.category || "",
    timestamp: Date.now(),
  };
}

function dedupeConsecutive(history, nextItem, matchKey) {
  if (!history.length) {
    return false;
  }

  return history[0][matchKey] === nextItem[matchKey];
}

function dedupeBySignature(history, nextEntry) {
  const nextSignature = nextEntry.signature;
  return history.filter((entry) => entry.signature !== nextSignature);
}

function aggregateFrequencies(items, key, limit = 5) {
  const counts = new Map();

  items.forEach((item) => {
    const value = normalizeText(item?.[key]);

    if (!value) {
      return;
    }

    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value: titleCase(value), count }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
    .slice(0, limit);
}

export function saveSearchHistory(query, context = {}) {
  const trimmedQuery = String(query || "").trim();

  if (!trimmedQuery) {
    return getSearchHistory();
  }

  const currentHistory = getSearchHistory();
  const nextEntry = buildSearchEntry(trimmedQuery, context);

  if (dedupeConsecutive(currentHistory, nextEntry, "signature")) {
    console.log("Search saved:", nextEntry.query);
    return currentHistory;
  }

  const nextHistory = dedupeBySignature(currentHistory, nextEntry);
  const updatedHistory = [nextEntry, ...nextHistory].slice(0, HISTORY_LIMIT);
  console.log("Search saved:", nextEntry.query);
  return writeArray(SEARCH_HISTORY_KEY, updatedHistory);
}

export function getSearchHistory() {
  const currentHistory = readArray(SEARCH_HISTORY_KEY);

  if (currentHistory.length > 0) {
    console.log("Search history loaded:", currentHistory.length);
    return currentHistory;
  }

  const legacyHistory = readLegacySearchHistory();
  if (legacyHistory.length > 0) {
    console.log("Search history loaded:", legacyHistory.length);
    writeArray(SEARCH_HISTORY_KEY, legacyHistory.slice(0, HISTORY_LIMIT));
    return legacyHistory.slice(0, HISTORY_LIMIT);
  }

  console.log("Search history loaded:", 0);
  return [];
}

export function saveViewedProduct(product) {
  if (!product) {
    return getViewedProducts();
  }

  const currentViewed = getViewedProducts();
  const nextEntry = buildViewedEntry(product);
  const nextKey = normalizeText(nextEntry.id || nextEntry.title);

  if (currentViewed.length && normalizeText(currentViewed[0].id || currentViewed[0].title) === nextKey) {
    return currentViewed;
  }

  return writeArray(VIEWED_PRODUCTS_KEY, [nextEntry, ...currentViewed].slice(0, HISTORY_LIMIT));
}

export function getViewedProducts() {
  return readArray(VIEWED_PRODUCTS_KEY);
}

export function getFrequentBrands(limit = 5) {
  return aggregateFrequencies(getSearchHistory(), "brand", limit);
}

export function getFrequentCategories(limit = 5) {
  return aggregateFrequencies(getSearchHistory(), "category", limit);
}

export function summarizeRecentInterests({ searchHistory = [], viewedProducts = [] } = {}) {
  const recentSearches = searchHistory.slice(0, 3).map((entry) => entry.brand || entry.category || entry.query).filter(Boolean);
  const recentViewed = viewedProducts.slice(0, 2).map((product) => product.displayTitle || product.title || product.name).filter(Boolean);
  const brands = getFrequentBrands(2).map((entry) => entry.value);
  const categories = getFrequentCategories(2).map((entry) => entry.value);

  const summaryParts = [];

  if (recentSearches.length > 0) {
    summaryParts.push(recentSearches.slice(0, 2).join(" and "));
  } else if (brands.length > 0 || categories.length > 0) {
    const interestBits = [brands[0], categories[0]].filter(Boolean);
    if (interestBits.length > 0) {
      summaryParts.push(interestBits.join(" "));
    }
  }

  if (recentViewed.length > 0) {
    summaryParts.push(`recently viewed ${recentViewed.join(" and ")}`);
  }

  return {
    recentSearches,
    recentViewed,
    brands,
    categories,
    summary: summaryParts.join(" and "),
  };
}

export function buildPersonalizedSearchSeed({ searchHistory = [], viewedProducts = [] } = {}) {
  const summary = summarizeRecentInterests({ searchHistory, viewedProducts });
  return summary.summary || "";
}