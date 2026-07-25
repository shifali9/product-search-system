import pandas as pd

df = pd.read_parquet(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\train-00000-of-00001.parquet")

print(df.dtypes)

print("\nSample values:\n")

for col in df.columns:
    print(f"\n{col}")
    print(df[col].iloc[0])
