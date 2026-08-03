const INTENT_PATTERNS = [
  { intent: "compare", pattern: /\b(compare|vs|versus|difference between)\b/i },
  { intent: "cheapest", pattern: /\b(cheapest|lowest price|budget|least expensive|affordable)\b/i },
  { intent: "highest_rated", pattern: /\b(highest rated|top rated|best rated|best reviewed|highest review(?:ed)?|top review(?:ed)?)\b/i },
  { intent: "latest", pattern: /\b(latest|newest|recent|recently added|new arrivals?)\b/i },
  { intent: "trending", pattern: /\b(trending|popular|hot|bestselling|best selling|most popular)\b/i },
  { intent: "recommend", pattern: /\b(recommend|suggest|show|find|search|discover|need|want|looking for|give me|help me find|what should i buy|pick for me)\b/i },
];

const STOP_WORDS = new Set([
  "recommend",
  "recommendations",
  "suggest",
  "show",
  "find",
  "search",
  "discover",
  "please",
  "give",
  "me",
  "some",
  "products",
  "product",
  "for",
  "under",
  "with",
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "my",
  "i",
  "need",
  "want",
  "looking",
  "help",
  "helping",
  "buy",
  "buying",
  "compare",
  "versus",
  "vs",
  "cheapest",
  "cheaper",
  "lowest",
  "highest",
  "rated",
  "rating",
  "top",
  "latest",
  "newest",
  "trending",
  "popular",
  "price",
  "cost",
  "budget",
  "rating",
  "ratings",
]);

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

const CATEGORY_RULES = [
  { pattern: /\bshoe(s)?\b|\bsneaker(s)?\b|\brunning\b|\btrainer(s)?\b/i, value: "Shoes" },
  { pattern: /\bshirt(s)?\b|\btop(s)?\b|\bt-shirt(s)?\b|\bhoodie(s)?\b/i, value: "Apparel" },
  { pattern: /\bwatch(es)?\b|\bfitness\b|\bsmartwatch(es)?\b/i, value: "Watches" },
  { pattern: /\bearbud(s)?\b|\bheadphone(s)?\b|\bearphone(s)?\b|\baud(io)?\b/i, value: "Earbuds" },
  { pattern: /\bbackpack(s)?\b|\bbag(s)?\b|\bluggage\b/i, value: "Bags" },
  { pattern: /\bgaming\b|\bkeyboard(s)?\b|\bmouse(s)?\b|\bcontroller(s)?\b|\bheadset(s)?\b/i, value: "Gaming" },
  { pattern: /\blaptop(s)?\b|\bpc(s)?\b|\bcomputer(s)?\b/i, value: "Computers" },
  { pattern: /\bphone(s)?\b|\bmobile\b|\bsmartphone(s)?\b/i, value: "Phones" },
  { pattern: /\bcharger(s)?\b|\bcable(s)?\b|\blamp(s)?\b|\bdesk(s)?\b|\baccessor(y|ies)\b/i, value: "Accessories" },
];

function normalizeWhitespace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function titleCase(text) {
  return normalizeWhitespace(text)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function tokenize(text) {
  return normalizeWhitespace(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !STOP_WORDS.has(token) && !/^\d+(?:\.\d+)?$/.test(token));
}

function detectIntent(text) {
  const lowerText = String(text || "");

  for (const entry of INTENT_PATTERNS) {
    if (entry.pattern.test(lowerText)) {
      return entry.intent;
    }
  }

  return "recommend";
}

function extractBrand(text) {
  const lowerText = String(text || "").toLowerCase();
  const match = BRAND_KEYWORDS.find((brand) => lowerText.includes(brand));
  return match ? titleCase(match) : null;
}

function extractCategory(text) {
  const lowerText = String(text || "");
  const match = CATEGORY_RULES.find(({ pattern }) => pattern.test(lowerText));
  return match ? match.value : null;
}

function extractPrice(text) {
  const lowerText = String(text || "");

  const lteMatch = lowerText.match(/\bprice\s*(?:<=|less than or equal to|at most)\s*\$?(\d+(?:\.\d+)?)/i);
  if (lteMatch) {
    return { minPrice: null, maxPrice: Number(lteMatch[1]) };
  }

  const gteMatch = lowerText.match(/\bprice\s*(?:>=|greater than or equal to|at least)\s*\$?(\d+(?:\.\d+)?)/i);
  if (gteMatch) {
    return { minPrice: Number(gteMatch[1]), maxPrice: null };
  }

  const underMatch = lowerText.match(/\b(?:under|below|less than|max(?:imum)? of?)\s*\$?(\d+(?:\.\d+)?)/i);
  if (underMatch) {
    return { maxPrice: Number(underMatch[1]), minPrice: null };
  }

  const betweenMatch = lowerText.match(/\b(?:between|from)\s*\$?(\d+(?:\.\d+)?)\s*(?:and|to|-|through)\s*\$?(\d+(?:\.\d+)?)/i);
  if (betweenMatch) {
    return { minPrice: Number(betweenMatch[1]), maxPrice: Number(betweenMatch[2]) };
  }

  const exactMatch = lowerText.match(/\b(?:price|cost)\s*(?:is|=|equals)?\s*\$?(\d+(?:\.\d+)?)/i);
  if (exactMatch) {
    const value = Number(exactMatch[1]);
    return { minPrice: value, maxPrice: value };
  }

  return { minPrice: null, maxPrice: null };
}

function extractKeywords(text, { brand, category } = {}) {
  const tokens = tokenize(text);
  const filteredTokens = tokens.filter((token) => token !== "products" && token !== "product");

  if (filteredTokens.length > 0) {
    return filteredTokens.join(" ").trim();
  }

  return brand || category || "";
}

export function parseUserQuery(input = "") {
  const raw = normalizeWhitespace(input);
  const lower = raw.toLowerCase();
  const intent = detectIntent(raw);
  const brand = extractBrand(raw);
  const category = extractCategory(raw);
  const { minPrice, maxPrice } = extractPrice(raw);
  const keywords = extractKeywords(raw, { brand, category });

  return {
    intent,
    keywords,
    brand,
    category,
    minPrice,
    maxPrice,
    price: minPrice !== null || maxPrice !== null ? { minPrice, maxPrice } : null,
    raw,
    isGenericRequest: /\b(products?|items?|something|anything)\b/i.test(lower) && !keywords,
  };
}

export function buildTypesenseQuery(parsedQuery, fallbackQuery = "") {
  if (!parsedQuery) {
    return normalizeWhitespace(fallbackQuery);
  }

  const keywords = normalizeWhitespace(parsedQuery.keywords || "");
  if (keywords) {
    return keywords;
  }

  if (parsedQuery.brand) {
    return parsedQuery.brand;
  }

  if (parsedQuery.category) {
    return parsedQuery.category;
  }

  return normalizeWhitespace(fallbackQuery);
}