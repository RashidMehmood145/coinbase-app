import React, { useState, useEffect } from "react";
import TopOfBook from "./TopOfBook";
import RealTimePriceChart from "./RealTimePriceChart";
import OrderBook from "./OrderBook";

function CurrencyWidget({ pair, socketData }) {
  const [tickerData, setTickerData] = useState(null);
  const [orderBookData, setOrderBookData] = useState({ bids: [], asks: [] });

  useEffect(() => {
    if (socketData && socketData.product_id === pair) {
      if (socketData.type === "ticker") {
        setTickerData(socketData);
      } else if (socketData.type === "snapshot") {
        setOrderBookData({
          bids: socketData.bids.map(([price, size]) => ({
            price: parseFloat(price),
            quantity: parseFloat(size),
          })),
          asks: socketData.asks.map(([price, size]) => ({
            price: parseFloat(price),
            quantity: parseFloat(size),
          })),
        });
      } else if (socketData.type === "l2update") {
        updateOrderBook(socketData);
      }
    }
  }, [socketData, pair]);

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
