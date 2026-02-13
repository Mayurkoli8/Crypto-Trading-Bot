from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100))


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String(20))
    buy_price = Column(Float)
    sell_price = Column(Float)
    stop_loss = Column(Float)
    quantity = Column(Float)
    
    executed_buy_price = Column(Float, nullable=True)
    executed_sell_price = Column(Float, nullable=True)
    
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TradeLog(Base):
    __tablename__ = "trade_logs"

    id = Column(Integer, primary_key=True, index=True)
    trade_id = Column(Integer, ForeignKey("trades.id"))
    message = Column(String(255))
    price = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
