import pandas as pd

# Load cleaned dataset
df = pd.read_csv(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\cleaned_products.csv")

print("Before preprocessing:")
print(df.isnull().sum())

# Fill missing values
df["description"] = df["description"].fillna("")
df["main_category"] = df["main_category"].fillna("Unknown")
df["store"] = df["store"].fillna("Unknown")

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