import asyncio, random
from app.services.websocket_manager import manager

# Seed prices — realistic starting points for the random walk simulation
SIMULATED_PRICES = {
    "AAPL": 182.50, "MSFT": 415.20, "GOOGL": 175.80,
    "AMZN": 195.40, "TSLA": 248.10, "NVDA": 876.30,
}

async def simulate_price_tick(symbol: str, last_price: float) -> float:
    # Gaussian random walk — the standard model for intraday price movement
    # gauss(mean=0, sigma=0.003) means ±0.3% per tick on average — realistic
    change_pct = random.gauss(0, 0.003)
    return round(last_price * (1 + change_pct), 2)

async def price_feed_loop():
    """Infinite background loop: generate ticks, broadcast via WebSocket."""
    prices = dict(SIMULATED_PRICES)
    prev_prices = dict(SIMULATED_PRICES)

    while True:
        await asyncio.sleep(2)   # async sleep — doesn't block other coroutines!

        updates = []
        for symbol, price in prices.items():
            new_price   = await simulate_price_tick(symbol, price)
            change      = round(new_price - prev_prices[symbol], 2)
            change_pct  = round((change / prev_prices[symbol]) * 100, 3)
            prices[symbol] = new_price
            updates.append({
                "symbol":     symbol,
                "price":      new_price,
                "change":     change,
                "change_pct": change_pct,
                "volume":     random.randint(50000, 2000000),
            })
        prev_prices = dict(prices)

        # One broadcast call — reaches every connected client simultaneously
        await manager.broadcast({"type": "price_update", "data": updates})