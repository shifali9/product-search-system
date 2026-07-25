import pandas as pd

# Load the cleaned dataset
df = pd.read_csv(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\cleaned_products.csv")

print("="*60)
print("DATASET OVERVIEW")
print("="*60)
print(f"Number of Rows    : {df.shape[0]}")
print(f"Number of Columns : {df.shape[1]}")

print("\n" + "="*60)
print("DATA TYPES")
print("="*60)
print(df.dtypes)

print("\n" + "="*60)
print("MISSING VALUES")
print("="*60)
print(df.isnull().sum())

print("\n" + "="*60)
print("NUMERIC SUMMARY")
print("="*60)
print(df.describe())

print("\n" + "="*60)
print("TOP 10 MAIN CATEGORIES")
print("="*60)
print(df["main_category"].value_counts(dropna=False).head(10))

print("\n" + "="*60)
print("TOP 10 STORES")
print("="*60)
print(df["store"].value_counts(dropna=False).head(10))

print("\n" + "="*60)
print("TOP 10 HIGHEST RATED PRODUCTS")
print("="*60)
print(df[["title","average_rating"]].sort_values(
    by="average_rating",
    ascending=False
).head(10))

print("\n" + "="*60)
print("PRICE STATISTICS")
print("="*60)
print(df["price"].describe())