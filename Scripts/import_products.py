import pandas as pd
import typesense

# -----------------------------
# Connect to Typesense
# -----------------------------
client = typesense.Client({
    "nodes": [{
        "host": "localhost",
        "port": "8108",
        "protocol": "http"
    }],
    "api_key": "xyz",
    "connection_timeout_seconds": 60
})

# -----------------------------
# Load Dataset
# -----------------------------
df = pd.read_csv(
    r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\typesense_products.csv"
)

print(f"\nLoaded {len(df)} products")

# -----------------------------
# Data Cleaning
# -----------------------------

# Fill missing values in text columns
text_columns = [
    "title",
    "description",
    "main_category",
    "categories",
    "store",
    "features",
    "details",
    "image"
]

for col in text_columns:
    df[col] = df[col].fillna("").astype(str)

# Numeric columns
df["average_rating"] = pd.to_numeric(
    df["average_rating"], errors="coerce"
).fillna(0.0)

df["rating_number"] = pd.to_numeric(
    df["rating_number"], errors="coerce"
).fillna(0).astype("int32")

df["price"] = pd.to_numeric(
    df["price"], errors="coerce"
).fillna(0.0)

# Create unique ID
df["id"] = df.index.astype(str)

# Check for missing values
print("\nMissing values after cleaning:")
print(df.isna().sum())

# Convert to dictionary
documents = df.to_dict(orient="records")

# -----------------------------
# Import Data
# -----------------------------
batch_size = 500

success = 0
failed = 0

print("\nUploading products...\n")

for i in range(0, len(documents), batch_size):

    batch = documents[i:i + batch_size]

    results = client.collections["products"].documents.import_(
        batch,
        {"action": "upsert"}
    )

    for r in results:
        if r.get("success"):
            success += 1
        else:
            failed += 1
            print("Error:", r.get("error"))

    print(f"Imported {min(i + batch_size, len(documents))}/{len(documents)}")

print("\n==============================")
print("IMPORT SUMMARY")
print("==============================")
print(f"Successful : {success}")
print(f"Failed     : {failed}")
print("==============================")