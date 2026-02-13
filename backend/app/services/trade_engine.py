import asyncio
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Trade, TradeLog
from .price_service import get_live_price
from ..websocket_manager import manager


async def trade_engine():
    while True:
        db: Session = SessionLocal()

        try:
            active_trades = db.query(Trade).filter(
                Trade.status.in_(["pending", "bought"])
            ).all()

            # Group trades by symbol
            symbols = list(set([trade.symbol for trade in active_trades]))

            price_map = {}

            # Fetch price once per symbol
            for symbol in symbols:
                price = await get_live_price(symbol)
                if price:
                    price_map[symbol] = price

            for trade in active_trades:
                price = price_map.get(trade.symbol)
                if not price:
                    continue

                for symbol, price in price_map.items():
                    await manager.broadcast({
                        "type": "price_update",
                        "symbol": symbol,
                        "price": price
                    })

                if trade.status == "pending" and price <= trade.buy_price:
                    trade.status = "bought"
                    trade.executed_buy_price = price

                elif trade.status == "bought" and price >= trade.sell_price:
                    trade.status = "sold"
                    trade.executed_sell_price = price

                elif trade.status == "bought" and price <= trade.stop_loss:
                    trade.status = "stopped"
                    trade.executed_sell_price = price

            db.commit()

        except Exception as e:
            print("Trade engine error:", e)

        finally:
            db.close()

        await asyncio.sleep(2)
