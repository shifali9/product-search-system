import { formatPrice, formatProductDisplay, formatRating } from "./catalog";
import { buildPersonalizedRecommendationIntro, rankProductsForUser } from "./personalizedRecommendations";

function parsePrice(product) {
  const price = Number(product?.price);
  return Number.isFinite(price) ? price : null;
}

function parseRating(product) {
  const rating = Number(product?.average_rating);
  return Number.isFinite(rating) ? rating : null;
}

function getProductDocument(entry) {
  return entry?.item?.source || entry?.item?.document || entry?.item || entry?.source || entry?.document || {};
}

function buildRecommendationQueue(matches = [], context = {}) {
  return rankProductsForUser(matches, context).map((item, index) => ({
    item,
    index,
    rating: parseRating(getProductDocument(item)) ?? 0,
    price: parsePrice(getProductDocument(item)),
    display: formatProductDisplay(getProductDocument(item)),
  }));
}

function buildShoppingTip(products, messageText) {
  const ratings = products.map((product) => product.rating).filter((rating) => rating !== null);
  const prices = products.map((product) => product.price).filter((price) => price !== null);
  const averageRating = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;
  const averagePrice = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : null;
  const asksForBudget = /\b(?:under|below|less than|max(?:imum)? of?)\s*\$?\d+/i.test(messageText);

  if (averageRating !== null && averageRating < 4) {
    return "Filter by ratings above 4★ if you want a stronger quality match.";
  }

  if (asksForBudget || (averagePrice !== null && averagePrice >= 100)) {
    return "Try increasing your budget for more premium options.";
  }

  return "Explore similar products in this category to compare more options.";
}

function isRecommendationRequest(text) {
  return /suggest|recommend|what should i buy|for me|something for me|pick for me/i.test(String(text || ""));
}

export function buildChatbotResponse({ message = "", matches = [], mode = "search", searchHistory = [], viewedProducts = [] } = {}) {
  try {
    const messageText = String(message || "");
    const recommendations = buildRecommendationQueue(matches, { searchHistory, viewedProducts }).slice(0, 3);
    const personalizedIntro = isRecommendationRequest(messageText)
      ? buildPersonalizedRecommendationIntro({ searchHistory, viewedProducts })
      : "Based on your search, here are my recommendations.";

    if (!recommendations.length) {
      return {
        variant: "no-match",
        intro: personalizedIntro,
        guidance: ["Similar keywords", "A broader category", "Another brand"],
      };
    }

    if (recommendations.length === 1) {
      const [onlyMatch] = recommendations;
      const onlyProduct = getProductDocument(onlyMatch);

      return {
        variant: "single",
        intro: personalizedIntro,
        bestRecommendation: {
          title: onlyMatch.display?.displayTitle || "Recommended Product",
          price: formatPrice(onlyProduct.price),
          rating: formatRating(onlyProduct.average_rating),
          note: "It is the strongest match for the details you shared.",
        },
        shoppingTip: buildShoppingTip(recommendations, messageText),
      };
    }

    const [bestMatch, ...otherMatches] = recommendations;
    const bestProduct = getProductDocument(bestMatch);

    return {
      variant: mode === "compare" ? "compare" : "multiple",
      intro: personalizedIntro,
      bestRecommendation: {
        title: bestMatch.display?.displayTitle || "Recommended Product",
        price: formatPrice(bestProduct.price),
        rating: formatRating(bestProduct.average_rating),
        note: "Best overall match based on relevance and rating.",
      },
      additionalRecommendations: otherMatches.map((match, index) => {
        const product = getProductDocument(match);
        return {
          title: match.display?.displayTitle || "Recommended Product",
          price: formatPrice(product.price),
          rating: formatRating(product.average_rating),
          note: index === 0 ? "A strong alternative if you want another top-rated option." : "A useful backup choice to compare against the best match.",
        };
      }),
      shoppingTip: buildShoppingTip(recommendations, messageText),
    };
  } catch (error) {
    console.log("Formatter error:", error.stack || error);
    return {
      variant: "no-match",
      intro: "Sorry, something went wrong while building the recommendation response. Here is a basic set of options.",
      guidance: ["Try a simpler search", "Use a brand name", "Search a broader category"],
    };
  }
}