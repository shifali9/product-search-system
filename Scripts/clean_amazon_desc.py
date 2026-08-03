import pandas as pd
import re


def normalize_whitespace(text):
    if text is None:
        return ""

    return re.sub(r"\s+", " ", str(text)).strip()


def remove_duplicate_words(text):
    words = normalize_whitespace(text).split(" ")
    result = []

    for word in words:
        if not result or result[-1].lower() != word.lower():
            result.append(word)

    return " ".join(result)


def clean_title(text):
    if pd.isna(text):
        return ""

    title = normalize_whitespace(text)
    title = re.sub(r"\b(?:compatible with|works with|fit for|best seller|premium|high quality|100% new|super soft|amazing)\b", " ", title, flags=re.I)
    title = re.sub(r"\b\d{1,3}(?:mm|cm|in|inch|inches)\b", " ", title, flags=re.I)
    title = re.sub(r"\b\d+(?:/\d+)+\b", " ", title)
    title = re.sub(r"\b[A-Z0-9]{5,}\b", " ", title)
    title = re.sub(r"[\/|,]+", " ", title)
    title = remove_duplicate_words(title)
    title = re.sub(r"\s{2,}", " ", title).strip()
    return title[:55].rstrip() + ("..." if len(title) > 55 else "")


def clean_brand(text):
    if pd.isna(text):
        return "Unknown Brand"

    brand = normalize_whitespace(text)
    brand = re.sub(r"\b(?:official|authorized|verified)\s+(?:store|shop|seller)\b", "", brand, flags=re.I)
    brand = re.sub(r"\b(?:store|shop|seller)\b", "", brand, flags=re.I)
    brand = re.sub(r"[|,]+", " ", brand)
    brand = re.sub(r"\s{2,}", " ", brand).strip()
    return brand.title() if brand else "Unknown Brand"


def clean_description_text(text):
    if pd.isna(text):
        return ""

    description = normalize_whitespace(text)
    description = re.sub(r"<.*?>", "", description)
    description = re.sub(r"\b(?:compatible with|works with|premium quality|high quality|best seller|brand new)\b", " ", description, flags=re.I)
    description = remove_duplicate_words(description)
    description = re.sub(r"\s{2,}", " ", description).strip()

    if len(description) > 180:
        description = description[:180].rstrip() + "..."

    return description

# ==========================
# LOAD DATASET
# ==========================
df = pd.read_parquet(
    r"C:\Users\Roshni\OneDrive\MSC\product_search_system\Dataset\train-00000-of-00001.parquet"
)
print("Original Shape:", df.shape)

# ==========================
# REMOVE DUPLICATES
# ==========================
df = df.drop_duplicates(subset=["title"])

# ==========================
# REMOVE ROWS WITHOUT TITLE
# ==========================
df = df[df["title"].notna()]

# ==========================
# TITLE CLEANING
# ==========================
df["title"] = (
    df["title"]
    .astype(str)
    .str.replace(r"\s+", " ", regex=True)
    .str.strip()
)
df["display_title"] = df["title"].apply(clean_title)

# ==========================
# DESCRIPTION CLEANING
# ==========================

df["description"] = df["description"].apply(clean_description_text)

# ==========================
# FEATURES CLEANING
# ==========================

def clean_features(text):

    # Handle missing values
    if text is None:
        return ""

    # If it's a list, join it into one string
    if isinstance(text, list):
        text = ". ".join(str(x) for x in text)

    # Convert everything else to string
    text = str(text)

    # Remove line breaks
    text = text.replace("\n", " ")

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    # Add period before capital letters if words are stuck together
    text = re.sub(r"(?<=[a-z])(?=[A-Z])", ". ", text)

    text = text.strip()

    # Limit length
    if len(text) > 220:
        text = text[:220] + "..."

    return text
# ==========================
# CATEGORY CLEANING
# ==========================

def clean_category(text):

    # Handle missing values
    if text is None:
        return ""

    # If it's already a list
    if isinstance(text, list):
        text = " > ".join(str(x) for x in text)

    # Convert everything else to string
    text = str(text)

    # Remove brackets and quotes if present
    text = text.replace("[", "")
    text = text.replace("]", "")
    text = text.replace("'", "")
    text = text.replace('"', "")

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()
# ==========================
# STORE CLEANING
# ==========================

df["store"] = (
    df["store"]
    .fillna("Unknown")
    .astype(str)
    .str.title()
)
df["display_brand"] = df["store"].apply(clean_brand)
df["display_description"] = df["description"].apply(clean_description_text)

# ==========================
# PRICE CLEANING
# ==========================

original_products = len(df)
df["price"] = pd.to_numeric(df["price"], errors="coerce")

missing_price_mask = df["price"].isna()
zero_price_mask = df["price"].eq(0)
negative_price_mask = df["price"].lt(0)

products_removed_missing_price = int(missing_price_mask.sum())
products_removed_zero_price = int(zero_price_mask.sum())
products_removed_negative_price = int(negative_price_mask.sum())

df = df[~(missing_price_mask | zero_price_mask | negative_price_mask)]
df["price"] = df["price"].astype(float)

print("\nPRICE CLEANING SUMMARY")
print(f"Original number of products: {original_products}")
print(f"Products removed due to missing price: {products_removed_missing_price}")
print(f"Products removed due to zero price: {products_removed_zero_price}")
print(f"Products removed due to negative price: {products_removed_negative_price}")
print(f"Final number of products: {len(df)}")

# ==========================
# RATING CLEANING
# ==========================

df["average_rating"] = (
    pd.to_numeric(df["average_rating"], errors="coerce")
    .fillna(0)
    .round(1)
)

df["rating_number"] = (
    pd.to_numeric(df["rating_number"], errors="coerce")
    .fillna(0)
    .astype(int)
)

# ==========================
# IMAGE CLEANING
# ==========================

df = df[df["image"].notna()]

# ==========================
# RESET INDEX
# ==========================
df = df.reset_index(drop=True)

print("Cleaned Shape:", df.shape)

# ==========================
# SAVE CLEANED DATASET
# ==========================
df.to_parquet(
    r"C:\Users\Roshni\OneDrive\MSC\product_search_system\Dataset\cleaned_amazon_products_v2.parquet",
    index=False
)
print("\n✅ Cleaned dataset saved as:")
print("cleaned_amazon_products_v2.parquet")