import pandas as pd

df = pd.read_csv(
    r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\typesense_products.csv"
)

print(df.isna().sum())