import React, { useState, useEffect, useRef, useCallback } from "react";
import CurrencyWidget from "./components/CurrencyWidget";
import "./styles.css";

const url = process.env.REACT_APP_API_URL || "https://api.pro.coinbase.com";
const WS_URL =
  process.env.REACT_APP_WEBSOCKET_URL || "wss://ws-feed.exchange.coinbase.com";

function App() {
  const [selectedPair, setSelectedPair] = useState("");
  const [currencyPairs, setCurrencyPairs] = useState([]);
  const wsRef = useRef(null);

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
    }
  }, [selectedPair]);

  useEffect(() => {
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      subscribeToChannel();
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [subscribeToChannel]);

  useEffect(() => {
    subscribeToChannel();
  }, [subscribeToChannel]);

  const handlePairSelection = (event) => {
    setSelectedPair(event.target.value);
  };

  return (
    <div className="container">
      <h1>Cryptocurrency Data</h1>
      <div>
        <h2>Select Currency Pair:</h2>
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
            ws={wsRef.current}
          />
        )}
      </div>
    </div>
  );
}

export default App;