import asyncio
from fastapi import FastAPI, WebSocket
from .database import engine, Base
from .routers import trade, user
from .services.trade_engine import trade_engine
from .websocket_manager import manager
from fastapi.middleware.cors import CORSMiddleware
from .services.price_service import get_live_price

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    asyncio.create_task(trade_engine())


app.include_router(trade.router)
app.include_router(user.router)


@app.get("/")
def read_root():
    return {"message": "Crypto Bot Backend Running"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(websocket)
        
async def price_stream():
    while True:
        price = await get_live_price("BTCUSDT")
        if price:
            await manager.broadcast({
                "type": "price_update",
                "price": price
            })
        await asyncio.sleep(2)
