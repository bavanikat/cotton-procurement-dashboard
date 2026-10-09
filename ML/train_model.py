import pandas as pd
import numpy as np
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# =========================================================
# LOAD CLEAN AGMARKNET DATA
# =========================================================

DATA_FILE = "data/cotton_prices_ml.csv"
MODEL_FILE = "models/cotton_price_model.pkl"

print("Reading dataset:", DATA_FILE)

df = pd.read_csv(DATA_FILE)

print("Dataset loaded!")
print("Rows:", len(df))


# =========================================================
# DATE PROCESSING
# =========================================================

df["Date"] = pd.to_datetime(df["Date"])

df = df.sort_values(
    ["Market", "Date"]
).reset_index(drop=True)


# =========================================================
# CREATE TIME-BASED PRICE FEATURES
# =========================================================

# Previous price for the same market
df["Previous Price"] = (
    df.groupby("Market")["Modal Price"]
    .shift(1)
)

# Price from 2 observations earlier
df["Price Lag 2"] = (
    df.groupby("Market")["Modal Price"]
    .shift(2)
)

# Price from 3 observations earlier
df["Price Lag 3"] = (
    df.groupby("Market")["Modal Price"]
    .shift(3)
)

# 3-period moving average
df["Price Moving Average"] = (
    df.groupby("Market")["Modal Price"]
    .transform(
        lambda x: x.shift(1).rolling(3).mean()
    )
)

# Previous arrival quantity
df["Previous Arrivals"] = (
    df.groupby("Market")["Arrivals"]
    .shift(1)
)


# =========================================================
# TARGET
# =========================================================

# Predict the next observed modal price
df["Next Price"] = (
    df.groupby("Market")["Modal Price"]
    .shift(-1)
)


# =========================================================
# REMOVE ROWS WITHOUT REQUIRED HISTORY
# =========================================================

feature_columns = [
    "Previous Price",
    "Price Lag 2",
    "Price Lag 3",
    "Price Moving Average",
    "Previous Arrivals"
]

df = df.dropna(
    subset=feature_columns + ["Next Price"]
).copy()


print("Usable training rows:", len(df))


# =========================================================
# TIME-BASED TRAIN / TEST SPLIT
# =========================================================

# IMPORTANT:
# We do NOT randomly shuffle the data.
# Earlier dates are used for training.
# Later dates are used for testing.

unique_dates = sorted(df["Date"].unique())

split_index = int(len(unique_dates) * 0.80)

train_dates = unique_dates[:split_index]
test_dates = unique_dates[split_index:]

train_df = df[
    df["Date"].isin(train_dates)
].copy()

test_df = df[
    df["Date"].isin(test_dates)
].copy()


print("\n======================================")
print("TIME-BASED DATA SPLIT")
print("======================================")

print(
    "Training period:",
    train_df["Date"].min(),
    "to",
    train_df["Date"].max()
)

print(
    "Testing period:",
    test_df["Date"].min(),
    "to",
    test_df["Date"].max()
)

print("Training rows:", len(train_df))
print("Testing rows:", len(test_df))


# =========================================================
# PREPARE FEATURES
# =========================================================

X_train = train_df[feature_columns]
y_train = train_df["Next Price"]

X_test = test_df[feature_columns]
y_test = test_df["Next Price"]


# =========================================================
# TRAIN RANDOM FOREST MODEL
# =========================================================

print("\nTraining Random Forest model...")

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=15,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

model.fit(
    X_train,
    y_train
)


# =========================================================
# PREDICTIONS
# =========================================================

predictions = model.predict(X_test)


# =========================================================
# MODEL EVALUATION
# =========================================================

mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        predictions
    )
)

r2 = r2_score(
    y_test,
    predictions
)


print("\n======================================")
print("MODEL TRAINING COMPLETE")
print("======================================")

print(
    "Mean Absolute Error:",
    round(mae, 2)
)

print(
    "Root Mean Squared Error:",
    round(rmse, 2)
)

print(
    "R2 Score:",
    round(r2, 4)
)


# =========================================================
# FEATURE IMPORTANCE
# =========================================================

print("\n======================================")
print("FEATURE IMPORTANCE")
print("======================================")

importance = pd.DataFrame({
    "Feature": feature_columns,
    "Importance": model.feature_importances_
})

importance = importance.sort_values(
    "Importance",
    ascending=False
)

print(importance)


# =========================================================
# SAVE MODEL
# =========================================================

joblib.dump(
    model,
    MODEL_FILE
)

print("\nModel saved to:")
print(MODEL_FILE)

print("\nTraining completed successfully!")