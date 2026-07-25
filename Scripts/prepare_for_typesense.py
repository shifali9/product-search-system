import pandas as pd
import ast

# Load the final dataset
df = pd.read_csv(
    r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\final_products.csv"
)

# -----------------------------
# Convert categories
# -----------------------------
def clean_categories(value):
    try:
        items = ast.literal_eval(str(value))
        if isinstance(items, list):
            return ", ".join(items)
    except:
        pass
    return ""

# -----------------------------
# Convert features
# -----------------------------
def clean_features(value):
    try:
        items = ast.literal_eval(str(value))
        if isinstance(items, list):
            return ", ".join(items)
    except:
        pass
    return ""

# Apply transformations
df["categories"] = df["categories"].apply(clean_categories)
df["features"] = df["features"].apply(clean_features)

# Save new dataset
output_path = r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\typesense_products.csv"

df.to_csv(output_path, index=False)

print("✅ Typesense dataset created successfully!")
print(f"Saved at: {output_path}")