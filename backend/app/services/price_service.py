import httpx

BINANCE_URL = "https://api.binance.com/api/v3/ticker/price"

async def get_live_price(symbol: str) -> float:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(BINANCE_URL, params={"symbol": symbol})
            data = response.json()
            return float(data["price"])
    except Exception as e:
        print("Price fetch error:", e)
        return None
