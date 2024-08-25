// components/CurrencyWidget.js
import React, { useState, useEffect } from "react";
import TopOfBook from "./TopOfBook";
import RealTimePriceChart from "./RealTimePriceChart";
import OrderBook from "./OrderBook";

function CurrencyWidget({ pair, ws }) {
  const [tickerData, setTickerData] = useState(null);
  const [orderBookData, setOrderBookData] = useState({ bids: [], asks: [] });

  useEffect(() => {
    if (!ws) return;

    const messageHandler = (event) => {
      const message = JSON.parse(event.data);
      if (message.product_id === pair) {
        if (message.type === "ticker") {
          setTickerData(message);
        } else if (message.type === "snapshot") {
          setOrderBookData({
            bids: message.bids.map(([price, size]) => ({
              price: parseFloat(price),
              quantity: parseFloat(size),
            })),
            asks: message.asks.map(([price, size]) => ({
              price: parseFloat(price),
              quantity: parseFloat(size),
            })),
          });
        } else if (message.type === "l2update") {
          updateOrderBook(message);
        }
      }
    };

    ws.addEventListener("message", messageHandler);

    return () => {
      ws.removeEventListener("message", messageHandler);
    };
  }, [pair, ws]);

  const updateOrderBook = (update) => {
    setOrderBookData((prevData) => {
      const newData = { ...prevData };
      update.changes.forEach(([side, price, size]) => {
        const sideData = side === "buy" ? newData.bids : newData.asks;
        const floatPrice = parseFloat(price);
        const floatSize = parseFloat(size);

        const index = sideData.findIndex((item) => item.price === floatPrice);
        if (floatSize === 0) {
          if (index !== -1) sideData.splice(index, 1);
        } else {
          if (index === -1) {
            sideData.push({ price: floatPrice, quantity: floatSize });
          } else {
            sideData[index].quantity = floatSize;
          }
        }

        sideData.sort((a, b) =>
          side === "buy" ? b.price - a.price : a.price - b.price
        );
      });
      return newData;
    });
  };

  return (
    <div className="currency-widget">
      <h2>{pair}</h2>
      <TopOfBook data={tickerData} />
      <RealTimePriceChart pair={pair} data={tickerData} />
      <OrderBook data={orderBookData} />
    </div>
  );
}

export default CurrencyWidget;
