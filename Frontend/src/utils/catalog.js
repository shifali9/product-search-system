const BACKEND_BASE_URL = "http://localhost:3000";

const TITLE_NOISE_PHRASES = [
  /\bcompatible with\b/gi,
  /\bcompatible\b/gi,
  /\bworks with\b/gi,
  /\bfit for\b/gi,
  /\bpack of\b/gi,
  /\bset of\b/gi,
  /\bbundle of\b/gi,
  /\bfor men and women\b/gi,
  /\bfor men women\b/gi,
  /\bhigh quality\b/gi,
  /\bpremium quality\b/gi,
  /\bbrand new\b/gi,
  /\bbest seller\b/gi,
  /\bofficial\b/gi,
  /\bnew version\b/gi,
  /\b100% brand new\b/gi,
  /\bsuper soft\b/gi,
  /\bamazing\b/gi,
  /\bpremium\b/gi,
  /\bhigh quality\b/gi,
  /\bquality\b/gi,
];

const TITLE_MARKETING_PHRASES = [
  /\b100% brand new\b/gi,
  /\bbrand new\b/gi,
  /\bpremium quality\b/gi,
  /\bhigh quality\b/gi,
  /\bbest seller\b/gi,
  /\bsuper soft\b/gi,
  /\bamazing\b/gi,
  /\bofficial\b/gi,
  /\bauthentic\b/gi,
  /\bpremium\b/gi,
  /\bquality\b/gi,
];

const TITLE_CODE_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9-]{5,}$/;
const DIMENSION_SEQUENCE_PATTERN = /\b\d+(?:\.\d+)?(?:mm|cm|in|inch|inches|")[\w\s/|,-]*\b(?:\d+(?:\.\d+)?(?:mm|cm|in|inch|inches|"))?/gi;
const SIZE_TOKEN_PATTERN = /^(?:\d+(?:\.\d+)?(?:mm|cm|in|inch|inches|")|\d+x\d+(?:x\d+)?|one\s*size|single\s*size)$/i;
const COMPATIBILITY_TARGET_PATTERNS = [
  /\b(?:compatible with|compatible|works with|fit for|fits with|fits|for use with|for)\s+(.+?)(?=(?:\b(?:pack|set|bundle|best seller|premium|high quality|brand new|official|amazing|super soft|replacement|accessory|accessories)\b|[|/,-]|$))/i,
];

const DESCRIPTION_NOISE_PHRASES = [
  /\bcompatible with\b/gi,
  /\bfree shipping\b/gi,
  /\bhigh quality\b/gi,
  /\bpremium quality\b/gi,
  /\bbrand new\b/gi,
  /\bproduct description\b/gi,
  /\bdimensions?\b/gi,
  /\bmeasurement(?:s)?\b/gi,
];

const DIMENSION_TOKEN_PATTERN = /^(?:\d+(?:\.\d+)?(?:mm|cm|in|inch|inches|gb|tb|mah|hz|w|v)|\d+x\d+(?:x\d+)?|\d{3,}[a-z]+|[a-z]+\d{3,})$/i;

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function removeConsecutiveDuplicateWords(text) {
  const words = normalizeWhitespace(text).split(" ");
  const result = [];

  words.forEach((word) => {
    const previous = result[result.length - 1];

    if (previous && previous.toLowerCase() === word.toLowerCase()) {
      return;
    }

    result.push(word);
  });

  return result.join(" ");
}

function smartTitleCase(word) {
  if (!word) {
    return word;
  }

  if (/^[A-Z0-9]{2,}$/.test(word) || /[a-z][A-Z]/.test(word) || /[A-Z].*[a-z]/.test(word)) {
    return word;
  }

  if (/^[a-z]+$/.test(word)) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  return word;
}

function titleCaseBrand(text) {
  return normalizeWhitespace(text)
    .split(" ")
    .map((word) => smartTitleCase(word))
    .join(" ");
}

function stripNoisePhrases(text, phrases) {
  return phrases.reduce((accumulator, pattern) => accumulator.replace(pattern, " "), text);
}

function normalizeCompatibilityTarget(text) {
  const cleaned = normalizeWhitespace(text)
    .replace(DIMENSION_SEQUENCE_PATTERN, " ")
    .replace(/\bseries\s*\d+(?:\s*[/]\s*\d+)+\b/gi, "")
    .replace(/\bseries\b/gi, "")
    .replace(/\bse\b/gi, "")
    .replace(/\bgen(?:eration)?\b/gi, "")
    .replace(/\bmodel\b/gi, "")
    .replace(/\b(?:bands?|straps?|cases?|covers?|chargers?|accessories|accessory|wraps?|sleeves?)\b/gi, "")
    .replace(/\b(?:for|with|compatible|compatibility|works|fit|fits)\b/gi, " ")
    .replace(/[/|,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/apple\s+watch/i.test(cleaned)) {
    return "Apple Watch";
  }

  if (/samsung\s+galaxy\s+watch/i.test(cleaned)) {
    return "Samsung Galaxy Watch";
  }

  const words = cleaned.split(" ").filter(Boolean);
  const selectedWords = words.filter((word) => !SIZE_TOKEN_PATTERN.test(word));

  if (selectedWords.length === 0) {
    return "";
  }

  return selectedWords.slice(0, 4).join(" ");
}

function extractCompatibilityPhrase(text) {
  for (const pattern of COMPATIBILITY_TARGET_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const target = normalizeCompatibilityTarget(match[1]);
      if (target) {
        return target;
      }
    }
  }

  return "";
}

function normalizePackLabel(text) {
  const lowerText = text.toLowerCase();
  const packNumbers = lowerText.match(/\b\d{1,3}(?:\s*[/|,]\s*\d{1,3}){1,}\b/g);

  if (packNumbers || /\bpack\b|\bbundle\b|\bset\b|\bkit\b|\bcollection\b/i.test(text)) {
    return " (Multi-Pack)";
  }

  return "";
}

function removeMarketingLanguage(text) {
  return TITLE_MARKETING_PHRASES.reduce((accumulator, pattern) => accumulator.replace(pattern, " "), text);
}

function removeSeparatorNoise(text) {
  return text
    .replace(/\s*[/|,]+\s*/g, " ")
    .replace(/\s+-\s+/g, " ")
    .replace(/\s{2,}/g, " ");
}

function isNoiseToken(token) {
  return (
    !token ||
    SIZE_TOKEN_PATTERN.test(token) ||
    DIMENSION_TOKEN_PATTERN.test(token) ||
    TITLE_CODE_PATTERN.test(token) ||
    /^\d+$/.test(token) ||
    /^[\d.]+(?:mm|cm|in|inch|inches|w|v|gb|tb|mah|hz)$/i.test(token)
  );
}

function cleanTitleTokens(text) {
  const tokens = normalizeWhitespace(text).split(" ");
  const result = [];
  const seen = new Set();

  tokens.forEach((token) => {
    const normalizedToken = token.replace(/[()\]{}:,.;!?]+$/g, "").replace(/\[+$/g, "");

    if (isNoiseToken(normalizedToken)) {
      return;
    }

    const lowerToken = normalizedToken.toLowerCase();
    if (seen.has(lowerToken)) {
      return;
    }

    seen.add(lowerToken);
    result.push(normalizedToken);
  });

  return result.join(" ");
}

function truncateAtBoundary(text, maxLength) {
  const normalized = normalizeWhitespace(text);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const cutIndex = normalized.lastIndexOf(" ", maxLength - 1);
  const safeCut = cutIndex > 24 ? cutIndex : maxLength;

  return `${normalized.slice(0, safeCut).trim()}...`;
}

function formatTitleWords(text) {
  return normalizeWhitespace(text)
    .split(" ")
    .map((word) => smartTitleCase(word))
    .join(" ");
}

export function cleanProductTitle(title, maxLength = 55) {
  if (!title) {
    return "Untitled Product";
  }

  const originalTitle = normalizeWhitespace(String(title));
  const compatibilityTarget = extractCompatibilityPhrase(originalTitle);
  const packLabel = normalizePackLabel(originalTitle);

  let cleanedTitle = stripNoisePhrases(originalTitle, TITLE_NOISE_PHRASES);
  cleanedTitle = removeMarketingLanguage(cleanedTitle);
  cleanedTitle = cleanedTitle.replace(COMPATIBILITY_TARGET_PATTERNS[0], " ");
  cleanedTitle = cleanedTitle.replace(DIMENSION_SEQUENCE_PATTERN, " ");
  cleanedTitle = removeSeparatorNoise(cleanedTitle);
  cleanedTitle = cleanTitleTokens(cleanedTitle);
  cleanedTitle = removeConsecutiveDuplicateWords(cleanedTitle);
  cleanedTitle = cleanedTitle.replace(/\b(?:the|and|with|for)\s+(?=\b(?:the|and|with|for)\b)/gi, " ");

  const formatted = formatTitleWords(cleanedTitle);
  const compactTitle = normalizeWhitespace(formatted);
  const withCompatibility = compatibilityTarget
    ? `${compactTitle} for ${formatTitleWords(compatibilityTarget)}`
    : compactTitle;
  const withPackLabel = `${withCompatibility}${packLabel}`.replace(/\s{2,}/g, " ").trim();

  return truncateAtBoundary(withPackLabel, maxLength);
}

export function cleanProductDescription(description, maxLength = 100) {
  if (!description) {
    return "No description available.";
  }

  let text = stripNoisePhrases(String(description), DESCRIPTION_NOISE_PHRASES);
  text = text.replace(/\b\d+(?:\.\d+)?\s?(?:mm|cm|in|inch|inches|gb|tb|mah|hz|w|v)\b/gi, " ");
  text = removeConsecutiveDuplicateWords(text);
  text = normalizeWhitespace(text);

  return truncateAtBoundary(text, maxLength);
}

export function buildSearchUrl({ query = "", page = 1, sortBy = "", category = "", store = "", rating = "", priceRange = "" } = {}) {
  const url = new URL(`${BACKEND_BASE_URL}/search`);
  url.searchParams.set("q", query || "*");
  url.searchParams.set("page", String(page || 1));

  if (sortBy) {
    url.searchParams.set("sort_by", sortBy);
  }

  if (category) {
    url.searchParams.set("category", category);
  }

  if (store) {
    url.searchParams.set("store", store);
  }

  if (rating) {
    url.searchParams.set("rating", rating);
  }

  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split("-");
    if (minPrice) {
      url.searchParams.set("minPrice", minPrice);
    }
    if (maxPrice) {
      url.searchParams.set("maxPrice", maxPrice);
    }
  }

  return url.toString();
}

export function buildSuggestionsUrl(query) {
  const url = new URL(`${BACKEND_BASE_URL}/suggestions`);
  url.searchParams.set("q", query || "");
  return url.toString();
}

export function getProductImage(document) {
  return document?.image || "https://via.placeholder.com/600x600?text=No+Image";
}

export function formatPrice(price) {
  if (price === undefined || price === null || price === "") {
    return "Price Not Available";
  }

  const numericPrice = Number(price);

  if (Number.isFinite(numericPrice)) {
    return `$${numericPrice.toFixed(numericPrice % 1 === 0 ? 0 : 2)}`;
  }

  return String(price);
}

export function formatRating(rating) {
  if (rating === undefined || rating === null || rating === "") {
    return "N/A";
  }

  const numericRating = Number(rating);

  if (Number.isFinite(numericRating)) {
    return numericRating.toFixed(numericRating % 1 === 0 ? 0 : 1);
  }

  return String(rating);
}

export function getProductDisplayTitle(document = {}) {
  const displayTitle = normalizeWhitespace(document?.display_title || document?.displayTitle || "");

  if (displayTitle) {
    return displayTitle;
  }

  return cleanProductTitle(document?.title);
}

export function getProductKey(document) {
  return [
    normalizeWhitespace(document?.title || "").toLowerCase(),
    normalizeWhitespace(document?.store || "").toLowerCase(),
    normalizeWhitespace(String(document?.price ?? "")).toLowerCase(),
    normalizeWhitespace(document?.main_category || "").toLowerCase(),
  ].join("|");
}

function calculateHitScore(hit, query = "") {
  const document = hit?.document || {};
  const title = normalizeWhitespace(document.title || "").toLowerCase();
  const store = normalizeWhitespace(document.store || "").toLowerCase();
  const category = normalizeWhitespace(document.main_category || "").toLowerCase();
  const normalizedQuery = normalizeWhitespace(query).toLowerCase();
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  let score = 0;

  if (normalizedQuery && title === normalizedQuery) {
    score += 120;
  }

  if (normalizedQuery && title.includes(normalizedQuery)) {
    score += 60;
  }

  if (queryTokens.length > 0 && queryTokens.every((token) => title.includes(token))) {
    score += 35;
  }

  if (queryTokens.length > 0 && queryTokens.some((token) => store.includes(token) || category.includes(token))) {
    score += 14;
  }

  const rating = Number(document.average_rating);
  if (Number.isFinite(rating)) {
    score += rating * 8;
  }

  if (document.image) {
    score += 8;
  }

  if (document.price !== undefined && document.price !== null && document.price !== "") {
    score += 4;
  }

  return score;
}

export function rankAndDedupeHits(hits = [], query = "", sortBy = "") {
  const bestBySignature = new Map();

  hits.forEach((hit, index) => {
    const signature = getProductKey(hit?.document || {});
    const existing = bestBySignature.get(signature);

    if (!existing) {
      bestBySignature.set(signature, { hit, index });
      return;
    }

    const existingScore = calculateHitScore(existing.hit, query);
    const nextScore = calculateHitScore(hit, query);

    if (nextScore > existingScore) {
      bestBySignature.set(signature, { hit, index });
    }
  });

  const deduped = Array.from(bestBySignature.values()).map(({ hit }) => hit);

  if (sortBy) {
    return deduped;
  }

  return deduped.sort((left, right) => calculateHitScore(right, query) - calculateHitScore(left, query));
}

export function cleanBrand(brand) {
  const normalized = normalizeWhitespace(brand);

  if (!normalized) {
    return "Unknown Brand";
  }

  const cleaned = normalized
    .replace(/\b(?:official|authorized|verified)\s+(?:store|shop|seller)\b/gi, "")
    .replace(/\b(?:store|shop|seller)\b/gi, "")
    .replace(/[|,]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return titleCaseBrand(cleaned || normalized);
}

export function formatProductDisplay(document = {}) {
  return {
    ...document,
    displayTitle: getProductDisplayTitle(document),
    displayDescription: cleanProductDescription(document.description, 110),
    displayBrand: cleanBrand(document.store || document.brand || document.main_category),
  };
}
