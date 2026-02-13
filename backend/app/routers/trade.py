from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Trade, User
from ..schemas import TradeCreate, TradeResponse

router = APIRouter(prefix="/trade", tags=["Trade"])


@router.post("/create", response_model=TradeResponse)
def create_trade(trade: TradeCreate, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == trade.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")

    if trade.sell_price <= trade.buy_price:
        raise HTTPException(status_code=400, detail="Sell price must be greater than buy price")

    if trade.stop_loss >= trade.buy_price:
        raise HTTPException(status_code=400, detail="Stop loss must be less than buy price")

    new_trade = Trade(**trade.dict())
    db.add(new_trade)
    db.commit()
    db.refresh(new_trade)

    return new_trade


@router.get("/active", response_model=List[TradeResponse])
def get_active_trades(db: Session = Depends(get_db)):
    return db.query(Trade).filter(Trade.status.in_(["pending", "bought"])).all()


@router.get("/history", response_model=List[TradeResponse])
def get_trade_history(db: Session = Depends(get_db)):
    return db.query(Trade).filter(Trade.status.in_(["sold", "stopped"])).all()
