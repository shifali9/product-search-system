import pandas as pd
import re

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

# ==========================
# DESCRIPTION CLEANING
# ==========================

def clean_description(text):
    if pd.isna(text):
        return ""

    text = str(text)

    # Remove new lines
    text = text.replace("\n", " ")

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    # Remove HTML tags if present
    text = re.sub(r"<.*?>", "", text)

    text = text.strip()

    # Keep only first 180 characters
    if len(text) > 180:
        text = text[:180] + "..."

    return text

df["description"] = df["description"].apply(clean_description)

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

# ==========================
# PRICE CLEANING
# ==========================

df["price"] = pd.to_numeric(df["price"], errors="coerce")

# Optional:
# Replace missing prices with 0
df["price"] = df["price"].fillna(0)

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
    r"C:\Users\Roshni\OneDrive\MSC\product_search_system\Dataset\cleaned_amazon_products.parquet",
    index=False
)
print("\n✅ Cleaned dataset saved as:")
print("cleaned_amazon_products.parquet")