import pandas as pd
import re
from html import unescape

# Load cleaned dataset
df = pd.read_csv(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\cleaned_products.csv")


def normalize_spaces(value):
    return re.sub(r"\s+", " ", str(value)).strip()


def remove_bracketed_text(value):
    value = re.sub(r"\([^)]*\)", " ", value)
    value = re.sub(r"\[[^]]*\]", " ", value)
    value = re.sub(r"\{[^}]*\}", " ", value)
    return value


def remove_pack_and_size_noise(value):
    patterns = [
        r"\b\d+(?:/\d+)+\s*(?:pack|count|pcs?|pieces?|pair|pairs)\b",
        r"\b(?:pack|count|pcs?|pieces?|pair|pairs)\s*(?:of\s*)?\d+\b",
        r"\b\d+\s*(?:pack|count|pcs?|pieces?|pair|pairs)\b",
        r"\bset\s*of\s*\d+\b",
        r"\b\d+(?:\.\d+)?\s*(?:mm|cm|m|in|inch|inches|ft|oz|lb|lbs|g|kg|ml|l|fl\s?oz)\b(?:\s*[,/x×-]\s*\d+(?:\.\d+)?\s*(?:mm|cm|m|in|inch|inches|ft|oz|lb|lbs|g|kg|ml|l|fl\s?oz)\b)*",
        r"\b\d+(?:mm|cm|m|in|inch|inches|ft|oz|lb|lbs|g|kg|ml|l)\b(?:\s*[,/x×-]\s*\d+(?:mm|cm|m|in|inch|inches|ft|oz|lb|lbs|g|kg|ml|l)\b)*",
        r"\b(?:\d{1,4}(?:mm|cm|m|in|inch|inches|ft|oz|lb|lbs|g|kg|ml|l))\b(?:\s+(?:\d{1,4}(?:mm|cm|m|in|inch|inches|ft|oz|lb|lbs|g|kg|ml|l))\b)+",
        r"\b\d+(?:\.\d+)?\b",
    ]
    for pattern in patterns:
        value = re.sub(pattern, " ", value, flags=re.IGNORECASE)
    return value


def remove_marketing_noise(value):
    patterns = [
        r"\bcompatible with\b.*$",
        r"\bcompatibility\b.*$",
        r"\bfor use with\b.*$",
        r"\bfits\b.*$",
        r"\bwith charging case\b.*$",
        r"\bwith case\b.*$",
    ]
    for pattern in patterns:
        value = re.sub(pattern, " ", value, flags=re.IGNORECASE)

    marketing_words = {
        "premium",
        "best",
        "sale",
        "deal",
        "hot",
        "new",
        "original",
        "official",
        "quality",
        "genuine",
        "super",
        "ultra",
        "latest",
        "cheap",
        "seller",
        "sellers",
        "brand",
        "brands",
    }

    tokens = []
    previous = None
    for token in value.split():
        cleaned = re.sub(r"[^A-Za-z0-9&+/-]", "", token)
        if not cleaned:
            continue
        lowered = cleaned.lower()
        if lowered in marketing_words:
            continue
        if previous is not None and lowered == previous:
            continue
        tokens.append(cleaned)
        previous = lowered

    return " ".join(tokens)


def build_display_title(title):
    if pd.isna(title):
        return ""

    original = normalize_spaces(title)
    if not original:
        return ""

    if len(original) <= 80:
        return original

    cleaned = original
    cleaned = remove_bracketed_text(cleaned)
    cleaned = remove_pack_and_size_noise(cleaned)
    cleaned = remove_marketing_noise(cleaned)
    cleaned = re.sub(r"[|:;•·_/\\]+", " ", cleaned)
    cleaned = re.sub(r"[-]{2,}", " ", cleaned)
    cleaned = normalize_spaces(cleaned)

    stop_tokens = {
        "compatible",
        "compatibility",
        "bundle",
        "bundles",
        "pack",
        "packs",
        "set",
        "sets",
        "replacement",
        "replacements",
        "adapter",
        "adapters",
        "case",
        "cases",
        "charging",
        "charger",
        "chargers",
        "model",
        "models",
        "series",
        "version",
        "versions",
        "edition",
        "editions",
        "for",
        "with",
        "fit",
        "fits",
        "noise",
        "cancelling",
        "canceling",
        "headphones",
        "accessories",
        "accessory",
        "seller",
        "sellers",
    }

    keep_tokens = []
    seen_tokens = set()
    for token in cleaned.split():
        normalized_token = re.sub(r"[^A-Za-z0-9]+", "", token).lower()
        if not normalized_token:
            continue
        if normalized_token in seen_tokens:
            continue
        if normalized_token in stop_tokens and len(keep_tokens) >= 3:
            break
        if re.fullmatch(r"\d+", normalized_token):
            continue
        if re.search(r"\d", normalized_token) and len(keep_tokens) >= 3:
            break
        keep_tokens.append(token)
        seen_tokens.add(normalized_token)
        if len(" ".join(keep_tokens)) >= 70:
            break

    display_title = normalize_spaces(" ".join(keep_tokens))
    if len(display_title) < 3:
        display_title = original
    return display_title[:70].rstrip()


def remove_html_tags(text):
    return re.sub(r"<[^>]+>", " ", text)


def remove_urls_and_emails(text):
    text = re.sub(r"https?://\S+|www\.\S+", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b", " ", text)
    return text


def remove_promotional_language(text):
    phrases = [
        r"\bbest seller\b",
        r"\blimited time offer\b",
        r"\bbuy now\b",
        r"\bfree shipping\b",
        r"\b100% guaranteed\b",
        r"\bsatisfaction guaranteed\b",
        r"\bworldwide shipping\b",
        r"\blimited offer\b",
        r"\bavailable now\b",
        r"\bon sale\b",
        r"\bhot deal\b",
        r"\bexclusive offer\b",
    ]

    for pattern in phrases:
        text = re.sub(pattern, " ", text, flags=re.IGNORECASE)

    return text


def remove_noise_symbols(text):
    text = re.sub(r"[\*^`~_={}\[\]<>|]+", " ", text)
    text = re.sub(r"[!?]{2,}", ".", text)
    text = re.sub(r"[.]{3,}", ".", text)
    text = re.sub(r"[-]{3,}", "-", text)
    text = re.sub(r"[•·●◦]+", " ", text)
    return text


def normalize_description_text(text):
    text = unescape(str(text))
    text = remove_html_tags(text)
    text = remove_urls_and_emails(text)
    text = remove_promotional_language(text)
    text = remove_noise_symbols(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def collapse_duplicate_words(text):
    words = text.split()
    result = []

    for word in words:
        previous = result[-1] if result else ""
        if previous and previous.lower() == word.lower():
            continue
        result.append(word)

    return " ".join(result)


def collapse_duplicate_sentences(text):
    sentences = [segment.strip() for segment in re.split(r"(?<=[.!?])\s+", text) if segment.strip()]
    result = []
    seen = set()

    for sentence in sentences:
        normalized = re.sub(r"\s+", " ", sentence).strip().rstrip(".").lower()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(sentence.strip())

    return " ".join(result)


def build_display_description(description, max_length=150):
    if pd.isna(description):
        return "No description available."

    original = normalize_description_text(description)
    if not original:
        return "No description available."

    if len(original) <= max_length:
        return original

    cleaned = original
    cleaned = collapse_duplicate_sentences(cleaned)
    cleaned = collapse_duplicate_words(cleaned)
    cleaned = re.sub(r"([!?.,;:])\1{1,}", r"\1", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    if len(cleaned) <= max_length:
        return cleaned

    truncated = cleaned[:max_length].rsplit(" ", 1)[0].strip()
    if not truncated:
        truncated = cleaned[:max_length].strip()

    return f"{truncated}..."

print("Before preprocessing:")
print(df.isnull().sum())

# Fill missing values
df["description"] = df["description"].fillna("")
df["main_category"] = df["main_category"].fillna("Unknown")
df["store"] = df["store"].fillna("Unknown")

# Create a clean display title without changing the original title
df["display_title"] = df["title"].apply(build_display_title)

# Create a clean display description without changing the original description
df["display_description"] = df["description"].apply(build_display_description)

# Fill missing rating_number with median
median_rating = df["rating_number"].median()
df["rating_number"] = df["rating_number"].fillna(median_rating)

print("\nAfter preprocessing:")
print(df.isnull().sum())

# Save final dataset
df.to_csv(
    r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\final_products.csv",
    index=False
)

print("\n✅ Final dataset saved as final_products.csv")