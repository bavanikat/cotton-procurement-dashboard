import sys
import json
import pandas as pd
import joblib

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_FILE = os.path.join(BASE_DIR, "data", "cotton_prices_ml.csv")
MODEL_FILE = os.path.join(BASE_DIR, "models", "cotton_price_model.pkl")


def predict_price(market):
    df = pd.read_csv(DATA_FILE)

    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values(["Market", "Date"]).reset_index(drop=True)

    model = joblib.load(MODEL_FILE)

    market_df = df[
        df["Market"].astype(str).str.strip().str.lower()
        == market.strip().lower()
    ].copy()

    if market_df.empty:
        return {
            "success": False,
            "message": "Market not found"
        }

    market_df = market_df.sort_values("Date").copy()

    market_df["Previous Price"] = market_df["Modal Price"].shift(1)
    market_df["Price Lag 2"] = market_df["Modal Price"].shift(2)
    market_df["Price Lag 3"] = market_df["Modal Price"].shift(3)
    market_df["Price Moving Average"] = (
        market_df["Modal Price"].shift(1).rolling(3).mean()
    )
    market_df["Previous Arrivals"] = market_df["Arrivals"].shift(1)

    latest_rows = market_df.dropna(
        subset=[
            "Previous Price",
            "Price Lag 2",
            "Price Lag 3",
            "Price Moving Average",
            "Previous Arrivals"
        ]
    )

    if latest_rows.empty:
        return {
            "success": False,
            "message": "Not enough historical data for this market"
        }

    latest = latest_rows.iloc[-1]

    features = pd.DataFrame([{
        "Previous Price": latest["Previous Price"],
        "Price Lag 2": latest["Price Lag 2"],
        "Price Lag 3": latest["Price Lag 3"],
        "Price Moving Average": latest["Price Moving Average"],
        "Previous Arrivals": latest["Previous Arrivals"]
    }])

    predicted_price = model.predict(features)[0]
    predicted_price = round(float(predicted_price), 2)

    current_price = round(float(latest["Modal Price"]), 2)

    change = round(predicted_price - current_price, 2)

    percentage = round(
        (change / current_price) * 100,
        2
    )

    return {
        "success": True,
        "market": market,
        "latestDate": str(latest["Date"].date()),
        "currentPrice": current_price,
        "predictedPrice": predicted_price,
        "change": change,
        "percentage": percentage
    }


if len(sys.argv) < 2:
    print(json.dumps({
        "success": False,
        "message": "Market name is required"
    }))
    sys.exit(1)


market = sys.argv[1]

result = predict_price(market)

print(json.dumps(result))
