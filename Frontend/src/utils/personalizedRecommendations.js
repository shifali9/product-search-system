import { formatPrice, formatProductDisplay, formatRating } from "./catalog";
import { buildPersonalizedSearchSeed, summarizeRecentInterests } from "./userBehavior";

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function tokenize(text) {
  return normalizeText(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

function getProductSource(product) {
  return product?.document || product || {};
}

function buildKeywordsFromHistory(searchHistory = []) {
  return searchHistory.slice(0, 8).flatMap((entry, index) => {
    const weight = Math.max(1, 8 - index);
    return [
      { value: entry.brand, weight: weight * 5 },
      { value: entry.category, weight: weight * 4 },
      { value: entry.query, weight: weight * 2 },
    ].filter(({ value }) => Boolean(value));
  });
}

function buildViewedSignals(viewedProducts = []) {
  return viewedProducts.slice(0, 8).map((product, index) => {
    const source = getProductSource(product);
    const display = formatProductDisplay(source);

    return {
      id: source.id || product.id || `${index}`,
      title: display.displayTitle,
      brand: display.displayBrand,
      category: source.main_category || source.category || "",
      rating: Number(source.average_rating) || 0,
      weight: Math.max(1, 8 - index) * 6,
    };
  });
}

function scoreProduct(product, { searchHistory = [], viewedProducts = [] } = {}) {
  const source = getProductSource(product);
  const display = formatProductDisplay(source);
  const title = normalizeText(display.displayTitle);
  const brand = normalizeText(display.displayBrand);
  const category = normalizeText(source.main_category || source.category || "");
  const rating = Number(source.average_rating);
  let score = Number.isFinite(rating) ? rating * 10 : 0;

  buildKeywordsFromHistory(searchHistory).forEach(({ value, weight }) => {
    const normalized = normalizeText(value);

    if (!normalized) {
      return;
    }

    const tokens = tokenize(normalized);
    const matchesTitle = tokens.some((token) => title.includes(token));
    const matchesBrand = brand && normalized.includes(brand);
    const matchesCategory = category && normalized.includes(category);

    if (matchesTitle || matchesBrand || matchesCategory) {
      score += weight;
    }
  });

  viewedProducts.slice(0, 8).forEach((entry, index) => {
    const viewed = buildViewedSignals([entry])[0];
    const proximityWeight = Math.max(1, 8 - index) * 5;

    if (!viewed) {
      return;
    }

    if (viewed.brand && brand && viewed.brand === display.displayBrand) {
      score += proximityWeight;
    }

    if (viewed.category && category && normalizeText(viewed.category) === category) {
      score += proximityWeight;
    }

    const viewedTokens = tokenize(viewed.title);
    if (viewedTokens.some((token) => title.includes(token))) {
      score += Math.max(2, proximityWeight - 1);
    }
  });

  const frequentBrandBoost = searchHistory.find((entry) => normalizeText(entry.brand) && normalizeText(entry.brand) === brand);
  if (frequentBrandBoost) {
    score += 18;
  }

  const frequentCategoryBoost = searchHistory.find((entry) => normalizeText(entry.category) && normalizeText(entry.category) === category);
  if (frequentCategoryBoost) {
    score += 16;
  }

  if (source.image) {
    score += 2;
  }

  if (source.price !== undefined && source.price !== null && source.price !== "") {
    score += 1;
  }

  return {
    source,
    display,
    score,
  };
}

function toRecommendationItem(scoredItem, reason) {
  const { source, display, score } = scoredItem;

  return {
    id: source.id,
    document: source,
    title: display.displayTitle,
    brand: display.displayBrand,
    category: source.main_category || source.category || "",
    price: formatPrice(source.price),
    rating: formatRating(source.average_rating),
    reason,
    score,
  };
}

function rankProductsForUser(products = [], context = {}) {
  return products
    .map((product) => scoreProduct(product, context))
    .sort((left, right) => right.score - left.score);
}

function buildRecentlyViewedItems(viewedProducts = [], limit = 3) {
  return viewedProducts.slice(0, limit).map((product) => {
    const source = getProductSource(product);
    const display = formatProductDisplay(source);

    return {
      id: source.id || product.id || display.displayTitle,
      document: source,
      title: display.displayTitle,
      brand: display.displayBrand,
      category: source.main_category || source.category || "",
      price: formatPrice(source.price),
      rating: formatRating(source.average_rating),
      reason: "Viewed in this session",
    };
  });
}

function buildContinueShoppingItems(products = [], context = {}, limit = 3) {
  const ranked = rankProductsForUser(products, context);
  const viewedIds = new Set((context.viewedProducts || []).map((product) => getProductSource(product).id).filter(Boolean));

  return ranked
    .map((item) => item.source)
    .filter((product) => !viewedIds.has(product.id))
    .slice(0, limit)
    .map((product) => {
      const display = formatProductDisplay(product);

      return {
        id: product.id,
        document: product,
        title: display.displayTitle,
        brand: display.displayBrand,
        category: product.main_category || product.category || "",
        price: formatPrice(product.price),
        rating: formatRating(product.average_rating),
        reason: "A relevant next step based on your browsing",
      };
    });
}

export function buildPersonalizedRecommendations({ products = [], searchHistory = [], viewedProducts = [], limit = 3 } = {}) {
  const baseProducts = products.map(getProductSource).filter(Boolean);
  const ranked = rankProductsForUser(baseProducts, { searchHistory, viewedProducts });
  const viewedIds = new Set(viewedProducts.map((product) => getProductSource(product).id).filter(Boolean));

  const recommendedForYou = ranked
    .map((item, index) => toRecommendationItem(item, index === 0 ? "Best fit for your recent activity" : "Relevant to your recent activity"))
    .filter((item) => !viewedIds.has(item.id))
    .slice(0, limit);

  const recentlyViewed = buildRecentlyViewedItems(viewedProducts, limit);
  const continueShopping = buildContinueShoppingItems(baseProducts, { searchHistory, viewedProducts }, limit);
  const interestSummary = summarizeRecentInterests({ searchHistory, viewedProducts });

  return {
    recommendedForYou,
    recentlyViewed,
    continueShopping,
    interestSummary,
  };
}

export function buildPersonalizedRecommendationIntro({ searchHistory = [], viewedProducts = [] } = {}) {
  const summary = summarizeRecentInterests({ searchHistory, viewedProducts });
  const searchPhrase = summary.recentSearches.slice(0, 2).filter(Boolean).join(" and ");
  const viewedPhrase = summary.recentViewed.slice(0, 2).filter(Boolean).join(" and ");

  if (searchPhrase && viewedPhrase) {
    return `I noticed you've recently searched for ${searchPhrase} and viewed ${viewedPhrase}. Based on your interests, here are some recommendations.`;
  }

  if (searchPhrase) {
    return `I noticed you've recently searched for ${searchPhrase}. Based on your interests, here are some recommendations.`;
  }

  if (viewedPhrase) {
    return `I noticed you've recently viewed ${viewedPhrase}. Based on your interests, here are some recommendations.`;
  }

  return "Based on your search, here are my recommendations.";
}

export function buildPersonalizedSearchSeedFromActivity({ searchHistory = [], viewedProducts = [] } = {}) {
  return buildPersonalizedSearchSeed({ searchHistory, viewedProducts });
}

export { rankProductsForUser };