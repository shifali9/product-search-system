import pandas as pd
import matplotlib.pyplot as plt

# Load the final dataset
df = pd.read_csv(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\final_products.csv")

# -------------------------------
# 1. Top 10 Categories
# -------------------------------
top_categories = df["main_category"].value_counts().head(10)

plt.figure(figsize=(10,6))
top_categories.plot(kind="bar")
plt.title("Top 10 Product Categories")
plt.xlabel("Category")
plt.ylabel("Number of Products")
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.savefig(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\top_categories.png")
plt.show()

# -------------------------------
# 2. Price Distribution
# -------------------------------
plt.figure(figsize=(8,5))
plt.hist(df["price"], bins=50)
plt.title("Price Distribution")
plt.xlabel("Price")
plt.ylabel("Number of Products")
plt.tight_layout()
plt.savefig(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\price_distribution.png")
plt.show()

# -------------------------------
# 3. Rating Distribution
# -------------------------------
plt.figure(figsize=(8,5))
plt.hist(df["average_rating"], bins=20)
plt.title("Average Rating Distribution")
plt.xlabel("Average Rating")
plt.ylabel("Number of Products")
plt.tight_layout()
plt.savefig(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\rating_distribution.png")
plt.show()

# -------------------------------
# 4. Top 10 Stores
# -------------------------------
top_stores = df["store"].value_counts().head(10)

plt.figure(figsize=(10,6))
top_stores.plot(kind="bar")
plt.title("Top 10 Stores")
plt.xlabel("Store")
plt.ylabel("Number of Products")
plt.xticks(rotation=45, ha="right")
plt.tight_layout()
plt.savefig(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\top_stores.png")
plt.show()

plt.figure(figsize=(8,5))
plt.boxplot(df["price"], vert=False)
plt.title("Box Plot of Product Prices")
plt.xlabel("Price")
plt.tight_layout()
plt.savefig(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\price_boxplot.png")
plt.show()

print("✅ All visualizations generated successfully!")