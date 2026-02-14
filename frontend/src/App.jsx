import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [price, setPrice] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTrades, setActiveTrades] = useState([]);
  const [historyTrades, setHistoryTrades] = useState([]);

  const [form, setForm] = useState({
    user_id: 1,
    symbol: "BTCUSDT",
    buy_price: "",
    sell_price: "",
    stop_loss: "",
    quantity: ""
  });

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    fetchTrades();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "price_update") {
        setPrice(data.price);
      }

      if (data.type === "trade_update") {

        setLogs((prev) => [
          {
            message: `Trade ${data.status} at ${data.price}`,
            time: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      }
      
    };
    fetchTrades();
      
    return () => ws.close();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const createTrade = async () => {
    if (!form.buy_price || !form.sell_price || !form.stop_loss || !form.quantity) {
      alert("All fields are required");
      return;
    }
    
    try {
      await axios.post("http://localhost:8000/trade/create", {
        ...form,
        buy_price: parseFloat(form.buy_price),
        sell_price: parseFloat(form.sell_price),
        stop_loss: parseFloat(form.stop_loss),
        quantity: parseFloat(form.quantity)
      });

      setLogs((prev) => [
        {
          message: "Trade created",
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);

      fetchTrades();

    } catch (err) {
      alert("Error creating trade");
    }
  };

  const fetchTrades = async () => {
  const active = await axios.get("http://localhost:8000/trade/active");
  const history = await axios.get("http://localhost:8000/trade/history");

  setActiveTrades(active.data);
  setHistoryTrades(history.data);
};

const computedStatus = (() => {
  if (activeTrades.some(t => t.status === "bought")) {
    return "BOUGHT";
  }
  if (activeTrades.some(t => t.status === "pending")) {
    return "PENDING";
  }
  return "No Active Trade";
})();


  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">

      <h1 className="text-3xl font-bold">
        Crypto Trading Bot
      </h1>

      {/* LIVE PRICE */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl mb-2">Live BTC/USDT Price</h2>
        <p className="text-3xl text-green-400">
          {price ? `$${price}` : "Loading..."}
        </p>
      </div>

      {/* TRADE STATUS */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl mb-2">Active Trade Status</h2>
        <p
          className={`text-2xl font-bold ${
            computedStatus === "BOUGHT"
              ? "text-blue-400"
              : computedStatus === "SOLD"
              ? "text-green-400"
              : computedStatus === "STOPPED"
              ? "text-red-400"
              : "text-yellow-400"
          }`}
        >
          {computedStatus}
        </p>
        
        
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
  <h2 className="text-xl mb-4">Active Trades</h2>

  <table className="w-full text-sm">
    <thead>
      <tr className="text-gray-400">
        <th>Symbol</th>
        <th>Buy</th>
        <th>Sell</th>
        <th>Stop</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {activeTrades.map((trade) => (
        <tr key={trade.id} className="border-t border-gray-700">
          <td>{trade.symbol}</td>
          <td>{trade.buy_price}</td>
          <td>{trade.sell_price}</td>
          <td>{trade.stop_loss}</td>
          <td className="text-yellow-400">{trade.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<div className="bg-gray-800 p-6 rounded-xl shadow-lg">
  <h2 className="text-xl mb-4">Trade History</h2>

  <table className="w-full text-sm">
    <thead>
      <tr className="text-gray-400">
        <th>Symbol</th>
        <th>Buy Exec</th>
        <th>Sell Exec</th>
        <th>Qty</th>
        <th>Status</th>
        <th>P/L</th>
      </tr>
    </thead>
    <tbody>
      {historyTrades.map((trade) => {

        let pnl = null;

        if (
          trade.executed_buy_price &&
          trade.executed_sell_price
        ) {
          pnl =
            (trade.executed_sell_price - trade.executed_buy_price) *
            trade.quantity;
        }

        return (
          <tr key={trade.id} className="border-t border-gray-700">
            <td>{trade.symbol}</td>
            <td>{trade.executed_buy_price || "-"}</td>
            <td>{trade.executed_sell_price || "-"}</td>
            <td>{trade.quantity}</td>
            <td className="text-yellow-400">{trade.status}</td>
            <td>
              {pnl !== null ? (
                <span className={pnl >= 0 ? "text-green-400" : "text-red-400"}>
                  {pnl.toFixed(2)}
                </span>
              ) : (
                "-"
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>


      {/* TRADE FORM */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
        <h2 className="text-xl">Create Trade</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="buy_price"
            placeholder="Buy Price"
            className="bg-gray-700 p-2 rounded"
            onChange={handleChange}
          />
          <input
            name="sell_price"
            placeholder="Sell Price"
            className="bg-gray-700 p-2 rounded"
            onChange={handleChange}
          />
          <input
            name="stop_loss"
            placeholder="Stop Loss"
            className="bg-gray-700 p-2 rounded"
            onChange={handleChange}
          />
          <input
            name="quantity"
            placeholder="Quantity"
            className="bg-gray-700 p-2 rounded"
            onChange={handleChange}
          />
        </div>

        <button
          onClick={createTrade}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-bold"
        >
          Submit Trade
        </button>
      </div>

      {/* LIVE LOGS */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl mb-4">Live Logs</h2>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="bg-gray-700 p-2 rounded text-sm">
              <span className="text-green-400">{log.time}</span> — {log.message}
            </div>
          ))}
        </div>
      </div>

    </div>
    </div>
  );
}

export default App;
