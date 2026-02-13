from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TradeCreate(BaseModel):
    user_id: int
    symbol: str
    buy_price: float = Field(gt=0)
    sell_price: float = Field(gt=0)
    stop_loss: float = Field(gt=0)
    quantity: float = Field(gt=0)

    class Config:
        orm_mode = True


class TradeResponse(BaseModel):
    id: int
    user_id: int
    symbol: str
    buy_price: float
    sell_price: float
    stop_loss: float
    quantity: float
    
    executed_buy_price: Optional[float] = None
    executed_sell_price: Optional[float] = None
    
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
