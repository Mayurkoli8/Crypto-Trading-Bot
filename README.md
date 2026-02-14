# Crypto Trading Bot

A full-stack crypto trading simulation platform built using FastAPI, PostgreSQL, WebSockets, and React.

This project simulates automated crypto trade execution using live BTC price data. It supports trade creation, automatic buy/sell/stop execution, trade history tracking, real-time price updates, and Dockerized setup for easy testing.

---

## Project Overview

This application allows users to:

- Create trades with:
  - Buy Price
  - Sell Price (Take Profit)
  - Stop Loss
  - Quantity
- Automatically execute trades based on live BTC price
- View:
  - Active trades
  - Trade history
  - Profit/Loss
- Receive real-time price updates via WebSocket
- Run the entire project locally using Docker

Note: Cloud deployment was partially tested, but due to time constraints and WebSocket hosting limitations, the final submission focuses on local reproducibility via Docker.

---

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- WebSockets
- Uvicorn

### Frontend
- React (Vite)
- TailwindCSS
- Axios

### Infrastructure
- Docker
- Docker Compose
- Binance Public API (for live BTC price)

---

## Project Structure
```bash
crypto-trading-bot/
│
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ ├── models.py
│ │ ├── schemas.py
│ │ ├── database.py
│ │ ├── websocket_manager.py
│ │ ├── routers/
│ │ └── services/
│ │ ├── trade_engine.py
│ │ └── price_service.py
│ ├── Dockerfile
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── Dockerfile
│ └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## System Architecture

1. Frontend sends trade creation request to backend.
2. Backend stores trade in PostgreSQL.
3. Background trade engine runs every 2 seconds.
4. Backend fetches live BTC price from Binance API.
5. If conditions match:
   - Executes Buy
   - Executes Sell
   - Executes Stop
6. Updates database.
7. Broadcasts updates via WebSocket.
8. Frontend updates UI in real time.

---

## Database Schema

### Users
- id
- name
- email

### Trades
- id
- user_id
- symbol
- buy_price
- sell_price
- stop_loss
- quantity
- executed_buy_price
- executed_sell_price
- status (pending / bought / sold / stopped)
- created_at

### Trade Logs
- id
- trade_id
- message
- price
- timestamp

---

## Trade Lifecycle Logic

- If price <= buy_price → status becomes "bought"
- If price >= sell_price → status becomes "sold"
- If price <= stop_loss → status becomes "stopped"

Profit/Loss is calculated as:

(executed_sell_price - executed_buy_price) * quantity


---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /trade/create | Create a new trade |
| GET | /trade/active | Get active trades |
| GET | /trade/history | Get trade history |
| GET | / | Health check |

WebSocket Endpoint:

ws://localhost:8000/ws


---

## Running the Project with Docker (Recommended)

This is the easiest way to test the entire system.

### 1. Clone the Repository

git clone https://github.com/Mayurkoli8/Crypto-Trading-Bot.git
cd crypto-trading-bot


### 2. Start Everything

docker-compose up --build


This will start:
- PostgreSQL database
- FastAPI backend
- React frontend

### 3. Access the Application

Frontend:
http://localhost:5173


Backend API Docs:
http://localhost:8000/docs


---

## Running Without Docker

### Backend

cd backend
python -m venv venv
venv\Scripts\activate (Windows)
pip install -r requirements.txt
pip install "uvicorn[standard]"
uvicorn app.main:app --reload


### Frontend

cd frontend
npm install
npm run dev


---

## Environment Variables

Example `.env` for backend:
```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/crypto_bot

```
For local development without Docker:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/crypto_bot
```

---

## Testing WebSocket Manually

Open browser console and run:

```javascript
const ws = new WebSocket("ws://localhost:8000/ws");

ws.onopen = () => console.log("Connected");
ws.onmessage = (e) => console.log(e.data);
```
You should see live BTC price updates.

#### Known Issue
- During cloud deployment testing, WebSocket connections faced instability on free hosting tiers due to:

- Cold start delays

- Reverse proxy WebSocket restrictions

- DNS resolution issues

However, the system works correctly when run locally using Docker.

---

Demo Video
Demo Video Link: https://drive.google.com/file/d/11sBdnuQMEFMshBAbLCUfwS-vdTZ5WO5l/view?usp=sharing


---

#### What Makes This Project Strong
- Real-time WebSocket communication

- Background trade execution engine

- Proper database modeling

- Dockerized for reproducibility

- Clean and simple frontend UI

- Live price integration

- Profit/Loss calculation

- Modular backend architecture
---

Mayur Koli

---

