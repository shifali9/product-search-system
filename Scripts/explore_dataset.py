import pandas as pd

# Load the dataset
df = pd.read_parquet(r"C:\Users\Roshni\OneDrive\MSC\product_search_system\dataset\train-00000-of-00001.parquet")

# Dataset information
print("=" * 50)
print("DATASET SHAPE")
print("=" * 50)
print(df.shape)

print("\n" + "=" * 50)
print("COLUMN NAMES")
print("=" * 50)
print(df.columns.tolist())

print("\n" + "=" * 50)
print("FIRST 5 ROWS")
print("=" * 50)
print(df.head())

print("\n" + "=" * 50)
print("MISSING VALUES")
print("=" * 50)
print(df.isnull().sum())