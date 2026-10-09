import pandas as pd
import glob
import os

# =========================================================
# FIND THE MAIN HISTORICAL AGMARKNET FILE
# =========================================================

files = [
    f for f in glob.glob("data/*.csv")
    if "07-11-2025 to 02-10-2026" in os.path.basename(f)
]

if not files:
    print("Historical AGMARKNET file not found.")
    exit()

file = files[0]

print("Reading:", os.path.basename(file))

# =========================================================
# READ AGMARKNET FILE
# =========================================================

df = pd.read_csv(
    file,
    header=1,
    encoding="utf-8-sig"
)

print("Original rows:", len(df))

# =========================================================
# RENAME COLUMNS
# =========================================================

df = df.rename(columns={
    "State/UT": "State",
    "Market": "Market",
    "Variety": "Variety",
    "Grade": "Grade",
    "Min Price": "Minimum Price",
    "Max Price": "Maximum Price",
    "Modal Price": "Modal Price",
    "Price Unit": "Unit of Price",
    "Arrival Quantity": "Arrivals",
    "Arrival Unit": "Unit of Arrivals",
    "Arrival Date": "Date"
})

# =========================================================
# CONVERT DATE
# =========================================================

df["Date"] = pd.to_datetime(
    df["Date"],
    dayfirst=True,
    errors="coerce"
)

# =========================================================
# CONVERT NUMERIC COLUMNS
# =========================================================

numeric_columns = [
    "Minimum Price",
    "Maximum Price",
    "Modal Price",
    "Arrivals"
]

for column in numeric_columns:

    df[column] = (
        df[column]
        .astype(str)
        .str.replace(",", "", regex=False)
    )

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )

# =========================================================
# REMOVE INVALID RECORDS
# =========================================================

df = df.dropna(
    subset=[
        "Date",
        "State",
        "Market",
        "Modal Price"
    ]
)

# =========================================================
# REMOVE DUPLICATES
# =========================================================

df = df.drop_duplicates()

# =========================================================
# SORT DATA
# =========================================================

df = df.sort_values(
    [
        "Date",
        "State",
        "Market"
    ]
).reset_index(drop=True)

# =========================================================
# SELECT REQUIRED COLUMNS
# =========================================================

final_df = df[
    [
        "Date",
        "State",
        "Market",
        "Variety",
        "Grade",
        "Minimum Price",
        "Maximum Price",
        "Modal Price",
        "Arrivals",
        "Unit of Arrivals",
        "Unit of Price"
    ]
]

# =========================================================
# SAVE CLEAN DATASET
# =========================================================

output_file = "data/cotton_prices_ml.csv"

final_df.to_csv(
    output_file,
    index=False
)

# =========================================================
# DISPLAY RESULTS
# =========================================================

print("\n======================================")
print("ML DATASET CREATED")
print("======================================")

print("Rows:", len(final_df))

print(
    "Date range:",
    final_df["Date"].min(),
    "to",
    final_df["Date"].max()
)

print(
    "Unique dates:",
    final_df["Date"].nunique()
)

print(
    "States:",
    final_df["State"].nunique()
)

print(
    "Markets:",
    final_df["Market"].nunique()
)

print(
    "Varieties:",
    final_df["Variety"].nunique()
)

print(
    "Grades:",
    final_df["Grade"].nunique()
)

print("\nColumns:")

print(
    final_df.columns.tolist()
)

print("\nFirst 5 rows:")

print(
    final_df.head()
)

print("\nSaved to:")

print(output_file)