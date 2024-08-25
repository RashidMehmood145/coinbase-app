import React, { useState, useEffect, useRef, useCallback } from "react";
import CurrencyWidget from "./components/CurrencyWidget";
import "./App.css";

const url = process.env.REACT_APP_API_URL || "https://api.pro.coinbase.com";
const WS_URL =
  process.env.REACT_APP_WEBSOCKET_URL || "wss://ws-feed.exchange.coinbase.com";

function App() {
  const [selectedPair, setSelectedPair] = useState("");
  const [currencyPairs, setCurrencyPairs] = useState([]);
  const [socketData, setSocketData] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await fetch(`${url}/products`);
      const data = await response.json();
      const filtered = data
        .filter((pair) => pair.quote_currency === "USD")
        .map((pair) => pair.id)
        .sort((a, b) => a.localeCompare(b));
      setCurrencyPairs(filtered);
    } catch (error) {
      console.error("Error fetching product pairs:", error);
    }
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const subscribeToChannel = useCallback(() => {
    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      selectedPair
    ) {
      const subscribeMsg = {
        type: "subscribe",
        product_ids: [selectedPair],
        channels: ["ticker", "level2_batch"],
      };
      wsRef.current.send(JSON.stringify(subscribeMsg));
      console.log("Subscribed to:", selectedPair);
    }
  }, [selectedPair]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      subscribeToChannel();
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received data:", data);
      setSocketData(data);
    };

    wsRef.current.onclose = (event) => {
      console.log(
        "WebSocket closed. Attempting to reconnect...",
        event.code,
        event.reason
      );
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, [subscribeToChannel]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (selectedPair) {
      subscribeToChannel();
    }
  }, [selectedPair, subscribeToChannel]);

  const handlePairSelection = (event) => {
    setSelectedPair(event.target.value);
  };

  return (
    <div className="container">
      <div className="mainHeader">
        <h1>Cryptocurrency Data</h1>
        <h2>Select Currency Pair</h2>
        <select value={selectedPair} onChange={handlePairSelection}>
          <option value="">Select a pair</option>
          {currencyPairs.map((pair) => (
            <option key={pair} value={pair}>
              {pair}
            </option>
          ))}
        </select>
      </div>

      <div className="widgets-container">
        {selectedPair && (
          <CurrencyWidget
            key={selectedPair}
            pair={selectedPair}
            socketData={socketData}
          />
        )}
      </div>
    </div>
  );
}

export default App;
