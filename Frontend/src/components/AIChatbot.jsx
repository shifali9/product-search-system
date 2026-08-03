import { useEffect, useMemo, useRef, useState } from "react";
import { buildSearchUrl, getProductDisplayTitle, rankAndDedupeHits } from "../utils/catalog";
import { buildChatbotResponse } from "../utils/aiChatbotFormatter";
import { buildPersonalizedSearchSeedFromActivity } from "../utils/personalizedRecommendations";
import { getSearchHistory } from "../utils/userBehavior";
import { buildTypesenseQuery, parseUserQuery } from "../utils/queryParser";

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    content: "I can help you find products, compare options, and surface recommendations from this catalog.",
  },
];

function isRecommendationRequest(text) {
  return /suggest|recommend|what should i buy|for me|something for me|pick for me/i.test(text);
}

function buildSearchSeedQuery(message, currentQuery, personalizationContext = {}) {
  const parsedQuery = parseUserQuery(message);
  const text = message.toLowerCase();

  if (/compare|vs|versus/.test(text) && (text.includes("apple watch") && text.includes("samsung"))) {
    return "Apple Watch Samsung Watch";
  }

  if (parsedQuery.intent === "recommend" && isRecommendationRequest(text)) {
    const personalizedSeed = buildPersonalizedSearchSeedFromActivity(personalizationContext);
    if (personalizedSeed) {
      return personalizedSeed;
    }
  }

  return buildTypesenseQuery(parsedQuery, currentQuery || message);
}

function sortFallbackProducts(products = [], parsedQuery = null) {
  return [...products].sort((left, right) => {
    const leftRating = Number(left?.document?.average_rating ?? left?.average_rating ?? 0);
    const rightRating = Number(right?.document?.average_rating ?? right?.average_rating ?? 0);

    if (parsedQuery?.intent === "highest_rated" || parsedQuery?.intent === "trending") {
      return rightRating - leftRating;
    }

    return rightRating - leftRating;
  });
}

function buildNoHistoryFallbackMessage(catalogItems, parsedQuery) {
  const products = sortFallbackProducts(catalogItems, parsedQuery).slice(0, 5);

  return {
    ...buildChatbotResponse({
      message: parsedQuery?.raw || "",
      matches: products,
      mode: "search",
      searchHistory: [],
      viewedProducts: [],
    }),
    intro: "I don't have enough search history yet. Here are some popular products from the catalog.",
  };
}

function findBestMatches(message, catalogItems, parsedQuery = null) {
  const text = message.toLowerCase();
  const queryTerms = parsedQuery?.keywords || message;
  const rankedItems = rankAndDedupeHits(catalogItems, queryTerms);
  const documents = rankedItems.map((item) => item.document);

  if (/compare|vs|versus/.test(text) && (text.includes("apple watch") || text.includes("samsung watch") || text.includes("watch"))) {
    return {
      matches: rankedItems.slice(0, 6),
      mode: "compare",
      labels: ["Apple Watch", "Samsung Watch"],
    };
  }

  const brands = parsedQuery?.brand ? [parsedQuery.brand.toLowerCase()] : [];
  const maxPrice = parsedQuery?.maxPrice ?? null;

  let matches = rankedItems.filter((item) => {
    const document = item.document || {};
    const title = `${document.title || ""} ${document.store || ""} ${document.main_category || ""}`.toLowerCase();
    const price = Number(document.price);

    const matchesBrand = brands.length === 0 || brands.some((brand) => title.includes(brand));
    const matchesPrice = maxPrice === null || (Number.isFinite(price) && price <= maxPrice);

    return matchesBrand && matchesPrice;
  });

  if (!matches.length && brands.length > 0) {
    matches = rankedItems.filter((item) => {
      const title = `${item.document?.title || ""} ${item.document?.store || ""}`.toLowerCase();
      return brands.some((brand) => title.includes(brand));
    });
  }

  if (!matches.length && /gift|birthday|present|student|college student/i.test(text)) {
    matches = rankedItems.filter((item) => {
      const title = `${item.document?.title || ""} ${item.document?.main_category || ""}`.toLowerCase();
      return /(headphone|earbud|watch|backpack|speaker|accessor|keyboard|mouse|charger|lamp|desk|gift)/.test(title);
    });
  }

  if (!matches.length && /wireless earbuds?|earbuds?|headphones?|headset/i.test(text)) {
    matches = rankedItems.filter((item) => /(earbud|headphone|audio)/i.test(item.document?.title || ""));
  }

  if (!matches.length && parsedQuery?.category) {
    matches = rankedItems.filter((item) => `${item.document?.main_category || ""} ${item.document?.categories || ""}`.toLowerCase().includes(parsedQuery.category.toLowerCase()));
  }

  if (!matches.length && parsedQuery?.brand) {
    matches = rankedItems.filter((item) => `${item.document?.store || ""} ${item.document?.title || ""}`.toLowerCase().includes(parsedQuery.brand.toLowerCase()));
  }

  if (!matches.length && parsedQuery?.keywords) {
    const keywordTokens = parsedQuery.keywords.toLowerCase().split(" ").filter(Boolean);
    matches = rankedItems.filter((item) => {
      const title = `${item.document?.title || ""} ${item.document?.store || ""} ${item.document?.main_category || ""}`.toLowerCase();
      return keywordTokens.some((token) => title.includes(token));
    });
  }

  return { matches, mode: "search", labels: documents.slice(0, 2).map((doc) => getProductDisplayTitle(doc || { title: "Product" })) };
}

async function fetchCatalogHits(message, currentQuery, fallbackItems, personalizationContext = {}) {
  try {
    const parsedQuery = parseUserQuery(message);
    const hasHistory = (personalizationContext.searchHistory || []).length > 0;
    console.log("Chatbot API request:", { message, parsedQuery, hasHistory });

    if (parsedQuery.isGenericRequest && !hasHistory) {
      const response = await fetch(buildSearchUrl({
        query: "*",
        page: 1,
        sortBy: "average_rating:desc",
      }));

      if (response.ok) {
        const data = await response.json();
        console.log("Chatbot API response:", data);

        if (Array.isArray(data.hits) && data.hits.length > 0) {
          return data.hits;
        }
      }

      return sortFallbackProducts(fallbackItems, parsedQuery).slice(0, 5);
    }

    const querySeed = buildSearchSeedQuery(message, currentQuery, personalizationContext);
    const isPriceOnlyRequest = Boolean(parsedQuery.maxPrice !== null || parsedQuery.minPrice !== null);
    const sortBy = parsedQuery.intent === "highest_rated"
      ? "average_rating:desc"
      : parsedQuery.intent === "latest"
        ? "_text_match:desc"
        : parsedQuery.intent === "trending"
          ? "average_rating:desc"
          : "average_rating:desc";
    const priceRange = isPriceOnlyRequest ? `${parsedQuery.minPrice ?? 0}-${parsedQuery.maxPrice ?? parsedQuery.minPrice ?? ""}` : "";
    const searchAttempts = [
      { query: querySeed, sortBy, priceRange },
      parsedQuery.brand && parsedQuery.brand !== querySeed ? { query: parsedQuery.brand, sortBy, priceRange } : null,
      parsedQuery.category && parsedQuery.category !== querySeed ? { query: parsedQuery.category, sortBy, priceRange } : null,
      parsedQuery.keywords && parsedQuery.keywords !== querySeed ? { query: parsedQuery.keywords, sortBy, priceRange } : null,
      parsedQuery.keywords ? { query: parsedQuery.keywords.split(" ").slice(0, 2).join(" "), sortBy, priceRange } : null,
    ].filter(Boolean);

    if (parsedQuery.isGenericRequest) {
      const historySeed = buildPersonalizedSearchSeedFromActivity(personalizationContext);
      if (historySeed) {
        searchAttempts.unshift({ query: historySeed, sortBy: "average_rating:desc", priceRange: "" });
      } else {
        searchAttempts.unshift({ query: "*", sortBy: "average_rating:desc", priceRange: "" });
      }
    }

    for (const attempt of searchAttempts) {
      console.log("Chatbot Typesense request:", attempt);
      const requestUrl = buildSearchUrl({
        query: attempt.query,
        page: 1,
        sortBy: attempt.sortBy,
        priceRange: attempt.priceRange,
      });
      const response = await fetch(requestUrl);
      console.log("Chatbot fetch response:", {
        ok: response.ok,
        status: response.status,
        url: requestUrl,
      });

      if (!response.ok) {
        continue;
      }

      const rawText = await response.clone().text();
      console.log("Raw API response:", rawText);

      const data = await response.json();
      console.log("Parsed JSON:", data);
      console.log("hits:", data?.hits);
      console.log("found:", data?.found);

      if (Array.isArray(data.hits) && data.hits.length > 0) {
        return data.hits;
      }
    }

    return fallbackItems;
  } catch (error) {
    console.log("Chatbot API error:", error);
    return fallbackItems;
  }
}

function buildLocalAssistantReply(message, catalogItems, personalizationContext = {}) {
  const parsedQuery = parseUserQuery(message);
  const analysis = findBestMatches(message, catalogItems, parsedQuery);
  const response = buildChatbotResponse({
    message,
    matches: analysis.matches || [],
    mode: analysis.mode,
    searchHistory: personalizationContext.searchHistory || [],
    viewedProducts: personalizationContext.viewedProducts || [],
  });

  console.log("Formatted chatbot response:", response);

  if (parsedQuery.isGenericRequest && (personalizationContext.searchHistory || []).length === 0) {
    response.intro = "I don't have enough search history yet. Here are some popular products from the catalog.";
  }

  return response;
}

function renderAssistantResponse(content) {
  if (!content || typeof content !== "object") {
    return content;
  }

  if (content.variant === "no-match") {
    return (
      <div className="ai-response-card">
        <p className="ai-response-intro">{content.intro}</p>
        <p className="ai-response-copy">You could try searching using:</p>
        <ul className="ai-response-list">
          {content.guidance?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="ai-response-card">
      <p className="ai-response-intro">{content.intro}</p>

      {content.bestRecommendation ? (
        <section className="ai-response-section">
          <h4>🏆 Best Recommendation</h4>
          <div className="ai-response-product">
            <div className="ai-response-product-title">{content.bestRecommendation.title}</div>
            <div className="ai-response-product-meta">
              <span>{content.bestRecommendation.price}</span>
              <span>Rating: {content.bestRecommendation.rating}★</span>
            </div>
            <p className="ai-response-note">{content.bestRecommendation.note}</p>
          </div>
        </section>
      ) : null}

      {content.additionalRecommendations?.length ? (
        <section className="ai-response-section">
          <h4>Additional Recommendations</h4>
          <div className="ai-response-list-block">
            {content.additionalRecommendations.map((item) => (
              <div key={`${item.title}-${item.price}-${item.rating}`} className="ai-response-list-item">
                <div className="ai-response-product-title">{item.title}</div>
                <div className="ai-response-product-meta">
                  <span>{item.price}</span>
                  <span>Rating: {item.rating}★</span>
                </div>
                <p className="ai-response-note">{item.note}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {content.shoppingTip ? (
        <section className="ai-response-tip">
          <h4>Shopping Tip</h4>
          <p>{content.shoppingTip}</p>
        </section>
      ) : null}
    </div>
  );
}

function AIChatbot({ catalogItems = [], currentQuery = "", searchHistory = [], viewedProducts = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const suggestedPrompts = useMemo(() => [
    "Recommend Nike shoes under $100.",
    "Show highly rated Apple products.",
    "Suggest a birthday gift for a college student.",
    "Recommend wireless earbuds.",
    currentQuery ? `Show me highly rated ${currentQuery}` : "Show me highly rated Nike shoes.",
  ], [currentQuery]);

  const sendMessage = async (content) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const parsedQuery = parseUserQuery(trimmed);
    const storedSearchHistory = searchHistory.length > 0 ? searchHistory : getSearchHistory();
    console.log("Chatbot reading history:", storedSearchHistory.length);
    console.log("User message:", trimmed);
    const personalizationContext = { searchHistory: storedSearchHistory, viewedProducts };
    const hasHistory = storedSearchHistory.length > 0;

    if (parsedQuery.isGenericRequest && !hasHistory) {
      const userMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");

      if (catalogItems.length > 0) {
        const fallbackReply = buildNoHistoryFallbackMessage(catalogItems, parsedQuery);
        console.log("Formatted chatbot response:", fallbackReply);
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: fallbackReply }]);
        return;
      }

      window.setTimeout(async () => {
        try {
          const searchHits = await fetchCatalogHits(trimmed, currentQuery, catalogItems, personalizationContext);
          const reply = buildLocalAssistantReply(trimmed, searchHits, personalizationContext);
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
        } catch (error) {
          console.log("Chatbot error:", error);
          setMessages((prev) => [...prev, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: {
              variant: "no-match",
              intro: "Sorry, something went wrong while processing your request. Please try again.",
              guidance: ["Try a simpler search", "Use a brand name", "Search a broader category"],
            },
          }]);
        }
      }, 0);
      return;
    }

    const userMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    window.setTimeout(async () => {
      try {
        const searchHits = await fetchCatalogHits(trimmed, currentQuery, catalogItems, personalizationContext);
        const reply = buildLocalAssistantReply(trimmed, searchHits, personalizationContext);
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
      } catch (error) {
        console.log("Chatbot error:", error);
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: {
            variant: "no-match",
            intro: "Sorry, something went wrong while processing your request. Please try again.",
            guidance: ["Try a simpler search", "Use a brand name", "Search a broader category"],
          },
        }]);
      } finally {
        setIsTyping(false);
      }
    }, 500);
  };

  return (
    <div className="ai-chatbot">
      {isOpen ? (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div>
              <h3>Shopping Assistant</h3>
              <p>Catalog-aware assistance for discovery and comparison.</p>
            </div>
            <button type="button" className="ai-chat-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="ai-chat-body" ref={scrollRef}>
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "ai-message user" : "ai-message assistant"}>
                {message.role === "assistant" ? renderAssistantResponse(message.content) : message.content}
              </div>
            ))}

            {isTyping ? (
              <div className="ai-message assistant typing-indicator">
                <span />
                <span />
                <span />
              </div>
            ) : null}
          </div>

          <div className="ai-suggestions">
            {suggestedPrompts.map((prompt) => (
              <button key={prompt} type="button" className="ai-suggestion-chip" onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="ai-chat-input-row">
            <input
              type="text"
              placeholder="Ask about products, gifts, comparisons..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage(inputValue);
                }
              }}
              className="ai-chat-input"
            />
            <button type="button" className="ai-chat-send" onClick={() => sendMessage(inputValue)}>
              Send
            </button>
          </div>
        </div>
      ) : null}

      <button type="button" className="ai-chat-fab" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "–" : "AI"}
      </button>
    </div>
  );
}

export default AIChatbot;
