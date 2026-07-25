import pandas as pd

# Load the dataset
df = pd.read_parquet(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\train-00000-of-00001.parquet")

print("Original Shape:", df.shape)

# Remove products with missing price
df = df.dropna(subset=["price"])

print("After Removing Missing Prices:", df.shape)

# Remove duplicate products
df = df.drop_duplicates(subset=["title"])

print("After Removing Duplicates:", df.shape)

# Reset index
df.reset_index(drop=True, inplace=True)

# Save cleaned dataset
df.to_csv(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\cleaned_products.csv", index=False)

print("\nCleaning completed successfully!")
print("Cleaned dataset saved as cleaned_products.csv")